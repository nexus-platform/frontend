<template>
  <v-flex>
    <VProgress v-if="loadingInitialElements" message="Loading information" class="mt-3"/>

    <v-layout row wrap v-else>
      <v-flex xs12 md10 offset-md1 class="animated fadeIn">
        <v-expansion-panel>
          <v-expansion-panel-content>
            <div slot="header">
              <v-icon class="fa">person</v-icon>
              <b>Personal information</b>
            </div>
            <v-card>
              <v-container pa-5>
                <v-form v-model="profileValidationStatus" ref="form">
                  <v-layout row wrap>
                    <v-flex sm5 md5>
                      <v-text-field
                        v-model="userData.name"
                        prepend-icon="edit"
                        name="name"
                        label="First name"
                        type="text"
                        :rules="nameRules"
                      ></v-text-field>
                      <v-text-field
                        v-model="userData.lastname"
                        prepend-icon="edit"
                        name="last_name"
                        label="Last name"
                        type="text"
                        :rules="lastNameRules"
                      ></v-text-field>
                      <v-text-field
                        v-model="userData.email"
                        prepend-icon="email"
                        name="email"
                        label="Email"
                        id="email"
                        type="email"
                        :rules="emailRules"
                      ></v-text-field>
                    </v-flex>
                    <v-flex offset-sm2 sm5>
                      <v-text-field
                        v-model="userData.postcode"
                        prepend-icon="place"
                        name="postcode"
                        label="Postcode"
                        :rules="postcodeRules"
                        hint="Enter a postcode to lookup"
                        type="text"
                      ></v-text-field>
                      <v-text-field
                        v-model="userData.address"
                        prepend-icon="fas fa-map-signs"
                        name="address"
                        label="Address"
                        id="address"
                        type="text"
                        :rules="addressRules"
                      ></v-text-field>
                      <v-text-field
                        v-if="userData.is_student && userData.ac_registered"
                        :readonly="true"
                        v-model="userData.dsa_letter_name"
                        label="DSA Letter"
                        :rules="dsaLetterRules"
                        prepend-icon="attach_file"
                        append-icon="folder"
                        @click="uploadDlg = true"
                        @click:append="() => (uploadDlg = true)"
                        type="text"
                        hint="Upload a copy of your DSA letter"
                      ></v-text-field>
                    </v-flex>
                  </v-layout>

                  <v-layout row wrap mt-5>
                    <v-flex xs12>
                      <v-btn
                        v-on:click="dlgChangePassword = true"
                        class="white--text"
                        color="warning"
                      >
                        <v-icon size="22">lock</v-icon>&nbsp;Change password
                      </v-btn>
                    </v-flex>
                    <v-flex xs12>
                      <v-tooltip bottom :color="validationColor">
                        <v-btn
                          :disabled="loading"
                          v-on:click="updateProfile()"
                          class="white--text"
                          :class="{ red: !profileValidationStatus, indigo: profileValidationStatus }"
                          slot="activator"
                        >
                          <v-progress-circular
                            v-if="loading"
                            :width="2"
                            size="18"
                            indeterminate
                            class="gray--text fa"
                          ></v-progress-circular>
                          <v-icon
                            v-else-if="!loading && profileValidationStatus"
                            small
                            class="fa"
                          >check</v-icon>
                          <v-icon
                            v-else-if="!loading && !profileValidationStatus"
                            small
                            class="fa"
                          >error_outline</v-icon>Update profile
                        </v-btn>
                        <span>{{validationMessage}}</span>
                      </v-tooltip>
                    </v-flex>
                  </v-layout>

                  <v-dialog width="400" v-model="dlgChangePassword" persistent>
                    <v-card>
                      <v-card-title class="headline grey lighten-2">Change password</v-card-title>
                      <v-container>
                        <v-form v-model="passwordValidationStatus" ref="passwordForm">
                          <v-layout row wrap>
                            <v-text-field
                              v-model="userData.current_password"
                              prepend-icon="lock"
                              label="Current password"
                              :rules="nameRules"
                              type="password"
                              hint="Enter your current password"
                            ></v-text-field>
                            <v-text-field
                              v-model="userData.password"
                              prepend-icon="lock"
                              label="New password"
                              :rules="passwordRules"
                              type="password"
                              hint="Enter 6 characters at least"
                            ></v-text-field>
                            <v-text-field
                              v-model="userData.password_confirm"
                              prepend-icon="lock"
                              label="Confirm password"
                              :rules="passwordConfirmRules"
                              type="password"
                              hint="Re-type your password"
                            ></v-text-field>
                          </v-layout>
                          <v-layout row wrap mt-4>
                            <v-spacer></v-spacer>
                            <v-btn
                              :disabled="loading"
                              v-on:click="changePassword()"
                              class="white--text"
                              color="info"
                            >
                              <v-progress-circular
                                v-if="loading"
                                :width="2"
                                size="18"
                                indeterminate
                                class="gray--text fa"
                              ></v-progress-circular>
                              <v-icon v-else size="22" class="fa">done</v-icon>Change password
                            </v-btn>
                            <v-btn
                              v-on:click="closePasswordDlg()"
                              class="white--text"
                              color="error"
                            >
                              <v-icon class="fa" size="22">cancel</v-icon>Cancel
                            </v-btn>
                          </v-layout>
                        </v-form>
                      </v-container>
                    </v-card>
                  </v-dialog>

                  <v-dialog width="500" v-model="uploadDlg" persistent>
                    <v-card>
                      <v-card-title class="headline grey lighten-2">
                        Upload file
                        <v-spacer></v-spacer>
                        <a @click="uploadDlg = false">
                          <v-icon small class="fa">close</v-icon>
                        </a>
                      </v-card-title>
                      <v-container>
                        <file-upload v-on:set-file="setDSALetter($event)"></file-upload>
                      </v-container>
                    </v-card>
                  </v-dialog>
                </v-form>
              </v-container>
            </v-card>
          </v-expansion-panel-content>

          <template v-if="userData.is_student">
            <v-expansion-panel-content>
              <div slot="header">
                <v-icon small class="fa">edit</v-icon>
                <b>Signature</b>
              </div>
              <v-card>
                <v-card-text>
                  <v-layout row wrap>
                    <v-flex xs12 sm6 lg3 v-if="loadingInitialElements">
                      <v-progress-circular :width="2" size="18" indeterminate class="gray--text fa"></v-progress-circular>
                    </v-flex>
                    <v-flex xs12 sm6 lg3 v-if="!loadingInitialElements && userData.signature">
                      <img class="thumbnail" v-bind:src="userData.signature">
                    </v-flex>
                    <v-flex xs12 sm6 lg3>
                      <v-btn v-on:click="showUpload()" class="primary">
                        <v-icon small class="fa">file_upload</v-icon>Select from local drive
                      </v-btn>
                      <v-layout v-if="userData.signature" row wrap>
                        <v-flex>
                          <v-btn
                            :disabled="uploadingImage"
                            v-if="userData.signature"
                            v-on:click="uploadSignature()"
                            class="success"
                          >
                            <v-icon v-if="!uploadingImage" small class="fa">file_upload</v-icon>
                            <v-progress-circular
                              v-else
                              :width="2"
                              size="18"
                              indeterminate
                              class="gray--text fa"
                            ></v-progress-circular>Upload
                          </v-btn>
                        </v-flex>
                      </v-layout>
                    </v-flex>
                  </v-layout>

                  <v-dialog width="500" v-model="uploadDialog" persistent>
                    <v-card>
                      <v-card-title class="headline grey lighten-2">
                        Upload Signature
                        <v-spacer></v-spacer>
                        <a @click="uploadDialog = false">
                          <v-icon small class="fa">close</v-icon>
                        </a>
                      </v-card-title>
                      <v-container>
                        <signature-upload v-on:set-signature="setSignatureFromUpload($event)"></signature-upload>
                      </v-container>
                    </v-card>
                  </v-dialog>
                </v-card-text>
              </v-card>
            </v-expansion-panel-content>

            <v-expansion-panel-content>
              <div slot="header">
                <v-icon small class="fa">people</v-icon>
                <b>Registration</b>
              </div>
              <v-card>
                <v-container pl-3>
                  <v-layout row wrap>
                    <v-flex sm10>
                      <v-btn @click="dlgCancelReg = true" color="error">
                        <v-icon class="fa">cancel</v-icon>
                        Cancel registration with {{ this.$store.getters.getPayload }}
                      </v-btn>
                    </v-flex>
                  </v-layout>

                  <v-dialog width="500" v-model="dlgCancelReg" persistent>
                    <v-card>
                      <v-card-title class="headline grey lighten-2">Cancel Registration</v-card-title>
                      <v-container>
                        <v-layout row wrap>
                          <v-flex xs12>
                            <h3>Are you sure you want to cancel your registration?</h3>
                          </v-flex>
                        </v-layout>
                        <v-card-actions class="mt-3">
                          <v-spacer></v-spacer>
                          <v-btn :disabled="loading" @click="cancelRegistration()" color="error">
                            <v-progress-circular
                              v-if="loading"
                              :width="2"
                              size="18"
                              indeterminate
                              class="gray--text fa"
                            ></v-progress-circular>
                            <v-icon class="fa" size="22" v-else>done</v-icon>Yes
                          </v-btn>
                          <v-btn @click="dlgCancelReg = false" color="info">
                            <v-icon class="fa" size="22">cancel</v-icon>No
                          </v-btn>
                        </v-card-actions>
                      </v-container>
                    </v-card>
                  </v-dialog>
                </v-container>
              </v-card>
            </v-expansion-panel-content>
          </template>
        </v-expansion-panel>
      </v-flex>
    </v-layout>

    <v-snackbar
      :timeout="5000"
      :bottom="true"
      :right="true"
      v-model="snackbar"
      :color="operationMessageType"
    >
      <v-icon small class="white--text fa">info</v-icon>
      {{ operationMessage }}
      <v-btn flat @click.native="snackbar = false">
        <v-icon small class="fa">close</v-icon>
      </v-btn>
    </v-snackbar>

    <AxiosComponent ref="axios" v-on:finish="handleHttpResponse($event)"/>
  </v-flex>
</template>

<script>
import SignatureUpload from "@/components/SignatureUpload";
import FileUpload from "@/components/FileUpload";

export default {
  data() {
    return {
      dlgChangePassword: false,
      dlgCancelReg: false,
      uploadDialog: false,
      uploadingImage: false,
      loadingInitialElements: true,
      snackbar: false,
      nameRules: [v => !!v || "This field is required"],
      lastNameRules: [v => !!v || "This field is required"],
      dsaLetterRules: [v => !!v || "This field is required"],
      passwordRules: [
        v => !!v || "This field is required",
        v => (v && v.length > 5) || "Password requires at least 6 characters"
      ],
      passwordConfirmRules: [
        v => !!v || "This field is required",
        v => v === this.userData.password || "Passwords do not match"
      ],
      emailRules: [
        v => !!v || "E-mail is required",
        v =>
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v) ||
          "E-mail must be valid"
      ],
      postcodeRules: [v => !!v || "This field is required"],
      addressRules: [v => !!v || "This field is required"],
      operationMessage: "Enter your credentials",
      operationMessageType: "warning",
      uploadDlg: false,
      profileValidationStatus: false,
      passwordValidationStatus: false,
      loading: false,
      userData: {}
    };
  },
  computed: {
    validationMessage: function() {
      return this.profileValidationStatus
        ? "Good to go!"
        : "The form is incomplete";
    },
    validationColor: function() {
      return this.profileValidationStatus ? "indigo" : "red";
    }
  },
  components: { SignatureUpload, FileUpload },
  mounted() {
    this.getProfileInfo();
  },
  methods: {
    cancelRegistration() {
      this.loading = true;
      this.snackbar = false;

      var config = {
        url: "cancel-registration",
        method: "post",
        params: {
          type: this.$store.getters.getPayload.institute.type,
          slug: this.$store.getters.getPayload.institute.slug
        }
      };
      this.$refs.axios.submit(config);
    },
    updateProfile() {
      if (this.$refs.form.validate()) {
        this.loading = true;
        let config = {
          method: "form",
          url: "update-user-profile",
          params: new FormData(),
          headers: {
            "Content-Type": "multipart/form-data"
          }
        };
        config.params.append("user_data", JSON.stringify(this.userData));
        if (this.userData.dsa_letter) {
          config.params.append("dsa_letter", this.userData.dsa_letter);
        }
        this.$refs.axios.submit(config);
      }
    },
    changePassword() {
      if (this.$refs.passwordForm.validate()) {
        this.loading = true;
        var config = {
          url: "change-password",
          method: "post",
          params: {
            current_password: this.userData.current_password,
            password: this.userData.password,
            password_confirm: this.userData.password_confirm
          }
        };
        this.$refs.axios.submit(config);
      }
    },
    closePasswordDlg() {
      this.userData.current_password = null;
      this.userData.password = null;
      this.userData.password_confirm = null;
      this.dlgChangePassword = false;
    },
    getProfileInfo() {
      this.loadingInitialElements = true;
      let config = {
        url: "get-profile-info",
        params: {}
      };
      this.$refs.axios.submit(config);
    },
    setDSALetter(event) {
      this.userData.dsa_letter = event;
      if (event) {
        this.userData.dsa_letter_name = event.name;
        this.uploadDlg = false;
      } else {
        this.userData.dsa_letter_name = null;
      }
    },
    showUpload() {
      this.uploadDialog = true;
    },
    setSignatureFromUpload(event) {
      this.userData.signature = event;
      if (event) {
        this.uploadDialog = false;
      }
    },
    uploadSignature() {
      if (!this.uploadingImage) {
        this.uploadingImage = true;

        let config = {
          method: "post",
          url: "upload-signature",
          params: { file: this.userData.signature }
        };
        this.$refs.axios.submit(config);
      }
    },
    handleHttpResponse(event) {
      this.loading = false;
      this.loadingInitialElements = false;

      if (event.data.result.code === 200) {
        var response = event.data.result.response;
        this.operationMessage = response.msg;
        this.operationMessageType = response.code;

        switch (event.url.substring(event.url.lastIndexOf("/") + 1)) {
          case "upload-signature":
            this.snackbar = true;
            this.uploadingImage = false;
            break;
          case "get-profile-info":
            if (response.code === "success") {
              this.userData = response.data;
            } else {
              this.snackbar = true;
            }
            break;
          case "change-password":
            this.snackbar = true;
            if (response.code === "success") {
              this.dlgChangePassword = false;
            }
            break;
          case "cancel-registration":
            this.snackbar = true;
            if (response.code === "success") {
              this.dlgCancelReg = false;
              this.$store.commit("logout");
              this.$router.push(this.$store.getters.getHomeUrl);
            }
            break;
          default:
            this.snackbar = true;
            break;
        }
      } else {
        this.operationMessage = "Your request could not be executed.";
        this.operationMessageType = "error";
        this.snackbar = true;
      }
    }
  }
};
</script>

<template>
  <v-container style="margin-top: 60px;" class="animated fadeIn">
    <v-layout row wrap>
      <v-flex xs12>
        <v-card-text>
          <h2 class="text-md-center">My Profile</h2>
        </v-card-text>
      </v-flex>
    </v-layout>

    <v-layout v-if="loadingInitialElements">
      <v-card-text class="text-xs-center">
        <v-progress-circular indeterminate color="blue-grey"></v-progress-circular>
      </v-card-text>
    </v-layout>

    <v-layout row wrap v-else>
      <v-flex xs12>
        <v-expansion-panel>
          <v-expansion-panel-content v-if="userData.is_student">
            <div slot="header"><icon name="edit" class="fa"></icon><b>Signature</b></div>
            <v-card>
              <v-card-text>
                <v-layout row wrap>
                  <v-flex xs12 sm6 lg3 v-if="loadingInitialElements">
                    <icon name="circle-notch" scale="2" spin class="fa" color="gray"></icon>
                  </v-flex>
                  <v-flex xs12 sm6 lg3 v-if="!loadingInitialElements && userData.signature">
                    <img class="thumbnail" v-bind:src="userData.signature"/>
                  </v-flex>
                  <v-flex xs12 sm6 lg3>
                    <v-btn v-on:click="showUpload()" class="primary"><icon name="edit" class="fa"></icon>Select from local drive</v-btn>
                    <v-layout v-if="userData.signature" row wrap>
                      <v-flex>
                        <v-btn :disabled="uploadingImage" v-if="userData.signature" v-on:click="uploadSignature()" class="success">
                          <icon v-if="!uploadingImage" name="upload" class="fa"></icon>
                          <icon v-if="uploadingImage" name="circle-notch" spin class="fa"></icon>
                          Upload
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
                      <a @click="uploadDialog = false"><icon name="times" class="fa"></icon></a>
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
            <div slot="header"><icon name="user" class="fa"></icon><b>Personal information</b></div>
            <v-card>
              <v-container pa-5>
                <v-form v-model="profileValidationStatus" ref="form">
                  <v-layout row wrap>
                    <v-flex sm5 md5>
                      <v-text-field v-model="userData.name" prepend-icon="edit" name="name" label="First name" type="text" :rules="nameRules"></v-text-field>
                      <v-text-field v-model="userData.lastname" prepend-icon="edit" name="last_name" label="Last name" type="text" :rules="lastNameRules"></v-text-field>
                      <v-text-field v-model="userData.email" prepend-icon="email" name="email" label="Email" id="email" type="email" :rules="emailRules"></v-text-field>
                    </v-flex>
                    <v-flex offset-sm2 sm5>
                      <v-text-field v-model="userData.postcode" prepend-icon="place" name="postcode" label="Postcode" :rules="postcodeRules" hint="Enter a postcode to lookup" type="text"></v-text-field>
                      <v-text-field v-model="userData.address" prepend-icon="fas fa-map-signs" name="address" label="Address" id="address" type="text" :rules="addressRules"></v-text-field>
                      <v-text-field v-if="userData.is_student && userData.ac_registered" :readonly="true" v-model="userData.dsa_letter_name" label="DSA Letter" :rules="dsaLetterRules" prepend-icon="attach_file" append-icon="folder" @click="uploadDlg = true" @click:append="() => (uploadDlg = true)" type="text" hint="Upload a copy of your DSA letter"></v-text-field>
                    </v-flex>
                  </v-layout>

                  <v-layout row wrap mt-5>
                    <v-flex xs12>
                      <v-btn v-on:click="editPassword = true" class="white--text" color="warning">
                        <v-icon size="22">lock</v-icon>&nbsp;Change password
                      </v-btn>
                    </v-flex>
                    <v-flex xs12>
                      <v-tooltip bottom :color="validationColor">
                        <v-btn :disabled="loading" v-on:click="updateProfile()" class="white--text" :class="{ red: !profileValidationStatus, indigo: profileValidationStatus }" slot="activator">
                          <icon v-if="loading" name="circle-notch" spin class="gray--text"></icon>
                          <v-icon size="22" v-if="!loading && profileValidationStatus">done</v-icon>
                          <v-icon size="22" v-if="!loading && !profileValidationStatus">error_outline</v-icon>
                          &nbsp;Update profile
                        </v-btn>
                        <span>{{validationMessage}}</span>
                      </v-tooltip>
                    </v-flex>
                  </v-layout>

                  <v-dialog width="400" v-model="editPassword" persistent>
                    <v-card>
                      <v-card-title class="headline grey lighten-2">
                        Change password
                      </v-card-title>
                      <v-container>
                        <v-form v-model="passwordValidationStatus" ref="passwordForm">
                          <v-layout row wrap>
                            <v-text-field v-model="userData.current_password" prepend-icon="lock" label="Current password" :rules="nameRules" type="password" hint="Enter your current password"></v-text-field>
                            <v-text-field v-model="userData.password" prepend-icon="lock" label="New password" :rules="passwordRules" type="password" hint="Enter 6 characters at least"></v-text-field>
                            <v-text-field v-model="userData.password_confirm" prepend-icon="lock" label="Confirm password" :rules="passwordConfirmRules" type="password" hint="Re-type your password"></v-text-field>
                          </v-layout>
                          <v-layout row wrap mt-4>
                            <v-spacer></v-spacer>
                            <v-btn v-on:click="setPassword()" class="white--text" color="info">Change password</v-btn>
                            <v-btn v-on:click="closePasswordDlg()" class="white--text" color="error">Cancel</v-btn>
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
                        <a @click="uploadDlg = false"><icon name="times" class="fa"></icon></a>
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
        </v-expansion-panel>
      </v-flex>
    </v-layout>

    <v-snackbar :timeout="5000" :bottom="true" :right="true" v-model="snackbar" :color="operationMessageType">
      <icon class="fa" name="info-circle"></icon> {{ operationMessage }}
      <v-btn flat @click.native="snackbar = false"><icon name="times"></icon></v-btn>
    </v-snackbar>

  </v-container>
</template>

<script>
import SignatureUpload from "@/components/SignatureUpload";
import axios from "axios";
import FileUpload from "@/components/FileUpload";

export default {
  data() {
    return {
      editPassword: false,
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
  components: {
    SignatureUpload,
    FileUpload
  },
  created() {
    this.getProfileInfo();
  },
  methods: {
    updateProfile() {
      if (this.$refs.form.validate()) {
        this.loading = true;
        var requestConfig = {
          headers: {
            Authorization: "Bearer " + this.$store.state.payload.jwt,
            "Content-Type": "multipart/form-data"
          }
        };
        var formData = new FormData();
        formData.append("user_data", JSON.stringify(this.userData));
        if (this.userData.dsa_letter) {
          formData.append("dsa_letter", this.userData.dsa_letter);
        }
        var that = this;
        axios
          .post(
            this.$store.state.baseUrl +
              "update-user-profile?XDEBUG_SESSION_START=netbeans-xdebug",
            formData,
            requestConfig
          )
          .then(function(response) {
            that.loading = false;
            that.operationMessage = response.data.msg;
            that.operationMessageType = response.data.code;
            that.snackbar = true;
          })
          .catch(function(error) {
            that.loading = false;
            that.operationMessage =
              "There was an error on the remote endpoint. Try again later.";
            that.operationMessageType = "error";
            that.snackbar = true;
          });
      }
    },
    setPassword() {
      if (this.$refs.passwordForm.validate()) {
        this.editPassword = false;
      }
    },
    closePasswordDlg() {
      this.userData.current_password = null;
      this.userData.password = null;
      this.userData.password_confirm = null;
      this.editPassword = false;
    },
    getProfileInfo() {
      this.loadingInitialElements = true;
      var requestConfig = {
        headers: {
          Authorization: "Bearer " + this.$store.state.payload.jwt
        },
        params: {
          XDEBUG_SESSION_START: "netbeans-xdebug"
        }
      };
      var that = this;

      axios
        .get(this.$store.state.baseUrl + "get-profile-info", requestConfig)
        .then(function(response) {
          that.operationMessage = response.data.msg;
          that.operationMessageType = response.data.code;
          that.loadingInitialElements = false;
          if (response.data.code === "success") {
            that.userData = response.data.data;
          } else {
            that.snackbar = true;
          }
        })
        .catch(function(error) {
          that.operationMessage =
            "There was an error on the remote endpoint. Try again later.";
          that.operationMessageType = "error";
          that.loadingInitialElements = false;
          that.snackbar = true;
        });
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
        var requestConfig = {
          headers: { Authorization: "Bearer " + this.$store.state.payload.jwt }
        };

        var requestParams = {
          file: this.userData.signature
        };

        var that = this;

        axios
          .post(
            this.$store.state.baseUrl +
              "upload-signature?XDEBUG_SESSION_START=netbeans-xdebug",
            requestParams,
            requestConfig
          )
          .then(function(response) {
            that.operationMessage = response.data.msg;
            that.operationMessageType = response.data.code;
            that.snackbar = true;
            that.uploadingImage = false;
          })
          .catch(function(error) {
            that.operationMessage =
              "There was an error on the remote endpoint. Try again later.";
            that.operationMessageType = "error";
            that.snackbar = true;
            that.uploadingImage = false;
          });
      }
    }
  }
};
</script>

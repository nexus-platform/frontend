<template>
  <v-container style="margin-top: 60px;" class="animated fadeIn">
    <v-card class="pb-4">
      <v-layout row wrap mb-3>
        <v-flex xs12 sm8 offset-sm2 mt-4>
          <h3 class="primary--text" :class="loadingInitialElements ? 'uppercase' : ''"><v-icon v-if="!loadingInitialElements" color="primary">location_city</v-icon> {{ac.name}}</h3>
        </v-flex>
      </v-layout>
      <v-layout row v-if="loadingInitialElements" wrap mt-2>
        <v-flex xs12>
          <icon name="circle-notch" scale=2 spin style="color: gray;"></icon>
        </v-flex>
      </v-layout>
      <v-layout row v-else wrap class="text-xs-center">
        <v-flex xs12 v-if="ac.admin">
          <h3><v-icon color="primary">business_center</v-icon> <b>Manager:</b> {{ac.admin}}</h3>
        </v-flex>
        <v-flex xs12>
          <h3><v-icon color="primary">phone</v-icon> <b>Telephone:</b> {{ac.phone}}</h3>
        </v-flex>
        <v-flex xs12>
          <h3><v-icon color="primary">location_on</v-icon> <b>Address:</b> {{ac.address}}</h3>
        </v-flex>
      </v-layout>

      <template v-if="!loadingInitialElements">
        <template v-if="!ac.registered">
          <v-container pa-5>
            <v-form v-model="validationStatus" ref="form">
              <v-layout row wrap>
                <v-flex sm5 md5>
                  <v-text-field :disabled="!isGuest" v-model="ac.user_data.name" prepend-icon="edit" name="name" label="First name" type="text" :rules="nameRules"></v-text-field>
                  <v-text-field :disabled="!isGuest" v-model="ac.user_data.last_name" prepend-icon="edit" name="last_name" label="Last name" type="text" :rules="lastNameRules"></v-text-field>
                  <v-text-field :disabled="!isGuest" @blur="test" v-model="ac.user_data.postcode" prepend-icon="place" name="postcode" label="Postcode" :rules="postcodeRules" :hint="loadingPostcodeInfo ? 'Loading postcode...' : 'Enter a postcode to lookup'" type="text"></v-text-field>
                  <v-text-field :disabled="!isGuest" v-model="ac.user_data.address" prepend-icon="fas fa-map-signs" name="address" label="Address" id="address" type="text" :rules="addressRules"></v-text-field>
                </v-flex>
                <v-flex offset-sm2 sm5>
                  <v-text-field :disabled="!isGuest" v-model="ac.user_data.email" prepend-icon="email" name="email" label="Email" id="email" type="email" :rules="emailRules"></v-text-field>
                  <v-text-field :disabled="!isGuest" v-model="ac.user_data.password" prepend-icon="lock" name="password" label="Password" id="password" :rules="passwordRules" :append-icon="e1 ? 'visibility' : 'visibility_off'" @click:append="() => (e1 = !e1)" :type="e1 ? 'password' : 'text'" hint="At least 6 characters" min="6"></v-text-field>
                  <v-text-field :disabled="!isGuest" v-model="ac.user_data.password_confirm" prepend-icon="lock" name="passwordConfirm" label="Password Confirmation" id="passwordConfirm" :rules="passwordConfirmRules" :append-icon="e1 ? 'visibility' : 'visibility_off'" @click:append="() => (e1 = !e1)" :type="e1 ? 'password' : 'text'" hint="Re-type your password"></v-text-field>
                  <v-text-field v-if="acRole === 'st'" :readonly="true" v-model="dsaLetterName" label="DSA Letter" :rules="dsaLetterRules" prepend-icon="attach_file" append-icon="folder" @click="uploadDialog = true" @click:append="() => (uploadDialog = true)" type="text" hint="Upload a copy of your DSA letter"></v-text-field>
                </v-flex>
              </v-layout>
              <v-layout row wrap mt-5>
                <v-flex xs12>
                  <v-tooltip bottom :color="validationColor">
                    <v-btn :disabled="loading" v-on:click="submit()" class="white--text" :class="{ red: !validationStatus, indigo: validationStatus }" slot="activator">
                      <icon v-if="loading" name="circle-notch" spin class="gray--text"></icon>
                      <v-icon size="22" v-if="!loading && validationStatus">done</v-icon>
                      <v-icon size="22" v-if="!loading && !validationStatus">error_outline</v-icon>
                      &nbsp;Register with this Centre
                    </v-btn>
                    <span>{{validationMessage}}</span>
                  </v-tooltip>
                </v-flex>
              </v-layout>
            </v-form>
          </v-container>

          <v-dialog width="500" v-model="uploadDialog" persistent>
            <v-card>
              <v-card-title class="headline grey lighten-2">
                Upload file
                <v-spacer></v-spacer>
                <a @click="uploadDialog = false"><icon name="times" class="fa"></icon></a>
              </v-card-title>
              <v-container>
                <file-upload v-on:set-file="setDSALetter($event)"></file-upload>
              </v-container>
            </v-card>
          </v-dialog>
        </template>

        <template v-else-if="ac.registered && !ac.is_admin && !isGuest">
          <v-container>
            <v-layout row wrap>
              <v-flex>
                <v-btn color="error" @click="cancelRegistrationDialog = true"><icon class="fa" name="times"></icon> Cancel Registration</v-btn>
              </v-flex>
            </v-layout>
          </v-container>
          <v-dialog width="500" v-model="cancelRegistrationDialog" persistent>
            <v-card>
              <v-card-title class="headline grey lighten-2">
                Cancel Registration
                <v-spacer></v-spacer>
                <a @click="cancelRegistrationDialog = false"><icon name="times" class="fa"></icon></a>
              </v-card-title>
              <v-container>
                <h3>Are you sure you want to cancel your registration with this Centre?</h3>
                <v-btn :disabled="loading" color="error" @click="cancelRegistration()">
                  <icon v-if="!loading" class="fa" name="check"></icon>
                  <icon v-else class="fa" name="circle-notch" spin></icon> Yes
                </v-btn>
                <v-btn color="info" @click="cancelRegistrationDialog = false"><icon class="fa" name="times"></icon> No</v-btn>
              </v-container>
            </v-card>
          </v-dialog>
        </template>

        <template v-else-if="ac.registered && ac.is_admin">
          <v-container>
            <v-layout row>
              <v-flex sm10 offset-sm1>

                <v-tabs slot="extension" class="elevation-1" v-model="tabs" fixed-tabs icons-and-text color="transparent">
                  <v-tabs-slider></v-tabs-slider>
                  <v-tab href="#tab-students" class="primary--text">
                    <v-icon>school</v-icon> Students
                  </v-tab>
                  <v-tab href="#tab-needs-assessors" class="primary--text">
                    <v-icon>assignment_ind</v-icon> Assessors
                  </v-tab>
                </v-tabs>

                <v-tabs-items v-model="tabs" class="white elevation-1">
                  <v-tab-item id='tab-students'>
                    <v-card>
                      <v-data-table :headers="[{ text: 'Name', value: 'name' }, { text: 'Institute', value: 'institute' }, { text: 'Actions', sortable: false, value: 'actions'}]" :items="ac.students" class="elevation-1">
                        <template slot="headerCell" slot-scope="props">
                          <v-tooltip bottom>
                            <span slot="activator">{{ props.header.text }}</span>
                            <span>{{ props.header.text }}</span>
                          </v-tooltip>
                        </template>
                        <template slot="items" slot-scope="props">
                          <td class="text-xs-left">{{ props.item.name }}</td>
                          <td class="text-xs-left">{{ props.item.institute }}</td>
                          <td class="text-xs-left">
                            <v-tooltip bottom color="black">
                              <v-btn @click="setCurrentUser(props.index, props.item, 'student')" small flat slot="activator" class="btn-sm" color="error">
                                <icon class="fa" name="user-times"></icon>
                              </v-btn>
                              <span>Cancel registration</span>
                            </v-tooltip>
                          </td>
                        </template>
                      </v-data-table>
                    </v-card>
                  </v-tab-item>

                  <v-tab-item id='tab-needs-assessors'>
                    <v-card>
                      <v-layout row class="mt-3 mb-2">
                        <v-spacer></v-spacer>
                        <v-btn @click="inviteUsersDialog = true" color="info"><icon class="fa" name="envelope"></icon> Invite Assessors</v-btn>
                      </v-layout>
                      <v-data-table :headers="[{ text: 'Name', value: 'name' }, { text: 'Email', value: 'email' }, { text: 'Actions', sortable: false, value: 'actions'}]" :items="ac.needs_assessors" class="elevation-1">
                        <template slot="headerCell" slot-scope="props">
                          <v-tooltip bottom>
                            <span slot="activator">{{ props.header.text }}</span>
                            <span>{{ props.header.text }}</span>
                          </v-tooltip>
                        </template>
                        <template slot="items" slot-scope="props">
                          <td class="text-xs-left">{{ props.item.name }}</td>
                          <td class="text-xs-left">{{ props.item.email }}</td>
                          <td class="text-xs-left">
                            <v-tooltip bottom color="black">
                              <v-btn @click="setCurrentUser(props.index, props.item, 'needs_assessor')" small flat slot="activator" class="btn-sm" color="error">
                                <icon class="fa" name="user-times"></icon>
                              </v-btn>
                              <span>Cancel registration</span>
                            </v-tooltip>
                          </td>
                        </template>
                      </v-data-table>
                    </v-card>
                    <v-dialog width="500" v-model="inviteUsersDialog" persistent>
                      <v-card>
                        <v-card-title class="headline grey lighten-2">
                          Invite user
                          <v-spacer></v-spacer>
                          <a @click="inviteUsersDialog = false"><icon name="times" class="fa"></icon></a>
                        </v-card-title>
                        <v-container>
                          <v-form ref="inviteForm">
                            <v-layout row>
                              <v-text-field max="50" outline v-on:keyup.enter="inviteUser()" ref="invitationName" v-model="invitation.name" append-icon="person" label="Name" type="text" required :rules="nameRules" hint="Enter the assessor's name"></v-text-field>
                            </v-layout>
                            <v-layout row>
                              <v-text-field max="150" outline v-on:keyup.enter="inviteUser()" v-model="invitation.email" append-icon="mail" label="Email" type="text" required :rules="emailRules" hint="Enter the email address"></v-text-field>
                            </v-layout>
                            <v-layout row>
                              <v-textarea outline v-model="invitation.text" append-icon="edit" label="Custom message" type="text" required hint="Enter a custom message"></v-textarea>
                            </v-layout>
                            <v-layout row>
                              <v-spacer></v-spacer>
                              <v-btn :disabled="loading" color="info" @click="inviteUser()">
                                <icon v-if="!loading" class="fa" name="envelope"></icon>
                                <icon v-else class="fa" name="circle-notch" spin></icon> Send invitation
                              </v-btn>
                            </v-layout>
                          </v-form>
                        </v-container>
                      </v-card>
                    </v-dialog>
                  </v-tab-item>
                </v-tabs-items>

                <v-dialog width="500" v-model="cancelUserRegDialog" persistent>
                  <v-card>
                    <v-card-title class="headline grey lighten-2">
                      Cancel user registration
                      <v-spacer></v-spacer>
                      <a @click="cancelUserRegDialog = false"><icon name="times" class="fa"></icon></a>
                    </v-card-title>
                    <v-container>
                      <v-layout row>
                          <h3>Are you sure you want to revoke {{currentUser.name}}'s registration?</h3>
                      </v-layout>
                      <v-divider class="mt-3 mb-3"></v-divider>
                      <v-layout row>
                        <v-spacer></v-spacer>
                        <v-btn :disabled="loading" color="error" @click="cancelUserRegistration()">
                          <icon v-if="!loading" class="fa" name="check"></icon>
                          <icon v-else class="fa" name="circle-notch" spin></icon> Yes
                        </v-btn>
                        <v-btn color="info" @click="cancelUserRegDialog = false"><icon class="fa" name="times"></icon> No</v-btn>
                      </v-layout>
                    </v-container>
                  </v-card>
                </v-dialog>

              </v-flex>
            </v-layout>
          </v-container>
        </template>
      </template>

      <v-snackbar :timeout="5000" :bottom="true" :right="true" v-model="snackbar" :color="operationMessageType">
        <icon class="fa" name="info-circle"></icon> {{ operationMessage }}
        <v-btn flat @click.native="snackbar = false"><icon name="times"></icon></v-btn>
      </v-snackbar>

    </v-card>
	</v-container>
</template>

<script>
import axios from "axios";
import FileUpload from "@/components/FileUpload";

export default {
  data() {
    return {
      tabs: null,
      e1: true,
      uploadDialog: false,
      cancelRegistrationDialog: false,
      cancelUserRegDialog: false,
      inviteUsersDialog: false,
      validationStatus: false,
      loadingInitialElements: true,
      currentUser: { name: "" },
      acSlug: null,
      acAction: null,
      snackbar: false,
      loading: false,
      loadingPostcodeInfo: false,
      nameRules: [v => !!v || "This field is required"],
      lastNameRules: [v => !!v || "This field is required"],
      dsaLetterRules: [v => !!v || "This field is required"],
      passwordRules: [
        v => !!v || "This field is required",
        v => (v && v.length > 5) || "Password requires at least 6 characters"
      ],
      passwordConfirmRules: [
        v => !!v || "This field is required",
        v => v === this.ac.user_data.password || "Passwords do not match"
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
      dsaLetterName: "",
      invitation: {
        name: "",
        email: "",
        text: ""
      },
      ac: {
        id: null,
        name: "Loading Assessment Centre information",
        address: null,
        phone: null,
        admin: null
      },
      studentsHeaders: [{ text: "Name", value: "name" }]
    };
  },
  created() {
    this.activationUrl = window.location.href.replace(
      this.$route.path,
      "/activate-account"
    );
    this.setInitialData();
  },
  components: { FileUpload },
  computed: {
    isGuest() {
      return this.$store.state.payload.is_guest;
    },
    validationMessage: function() {
      return this.validationStatus ? "Good to go!" : "The form is incomplete";
    },
    validationColor: function() {
      return this.validationStatus ? "indigo" : "red";
    }
  },
  methods: {
    setCurrentUser(index, user, userType) {
      this.currentUserIndex = index;
      this.currentUser = user;
      this.currentUserType = userType;
      this.cancelUserRegDialog = true;
    },
    setInitialData() {
      this.acSlug = this.$route.params.slug;
      this.acAction = this.$route.params.action;
      if (this.$store.state.payload.is_guest) {
        this.acRole = this.$route.params.role;
      }
      else {
        if (this.$store.state.payload.roles.includes("student")) {
          this.acRole = 'st';
        }
        else if (this.$store.state.payload.roles.includes("ac")) {
          this.acRole = 'ac';
        }
        else if (this.$store.state.payload.roles.includes("na")) {
          this.acRole = 'na';
        }
      }
      
      this.getAC().then(data => {
        if (data.item.data) {
          this.ac = data.item.data;
          if (this.ac.registered && this.acAction === "signup") {
            this.$router.push("/assessment-centre/" + this.acSlug + this.acSlug + "/index/" + this.acRole);
          } else if (!this.ac.registered && this.acAction === "index") {
            this.$router.push("/assessment-centre/" + this.acSlug + "/signup/" + this.acRole);
          } else {
          }
        } else {
          this.$router.push("/not-found");
        }
        this.loadingInitialElements = false;
      });
    },
    setDSALetter(event) {
      this.ac.user_data.dsa_letter = event;
      if (event) {
        this.dsaLetterName = event.name;
        this.uploadDialog = false;
      } else {
        this.dsaLetterName = "";
      }
    },
    inviteUser() {
      if (this.$refs.inviteForm.validate()) {
        this.loading = true;
        var requestConfig = {
          headers: {
            Authorization: "Bearer " + this.$store.state.payload.jwt
          }
        };
        var requestParams = {
          invitation: this.invitation,
          ac_id: this.ac.id,
          url: window.location.href.replace(
            this.$route.path,
            "/assessment-centre/" + this.ac.token + '/signup/na'
          )
        };

        var that = this;
        axios
          .post(
            this.$store.state.baseUrl +
              "invite-user?XDEBUG_SESSION_START=netbeans-xdebug",
            requestParams,
            requestConfig
          )
          .then(function(response) {
            that.loading = false;
            that.operationMessage = response.data.msg;
            that.operationMessageType = response.data.code;
            that.snackbar = true;
            if (response.data.code === "success") {
              that.invitation = {
                name: "",
                email: "",
                text: ""
              };
            }
            that.$nextTick(that.$refs.invitationName.focus);
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
    cancelUserRegistration() {
      this.loading = true;
      var requestConfig = {
        headers: {
          Authorization: "Bearer " + this.$store.state.payload.jwt
        }
      };
      var requestParams = {
        ac_id: this.ac.id,
        user_id: this.currentUser.id
      };

      var that = this;
      axios
        .post(
          this.$store.state.baseUrl +
            "unregister-user-from-ac?XDEBUG_SESSION_START=netbeans-xdebug",
          requestParams,
          requestConfig
        )
        .then(function(response) {
          that.loading = false;
          that.operationMessage = response.data.msg;
          that.operationMessageType = response.data.code;
          that.snackbar = true;
          if (response.data.code === "success") {
            if (that.currentUserType === "student") {
              that.ac.students.splice(that.currentUserIndex, 1);
            } else {
              that.ac.needs_assessors.splice(that.currentUserIndex, 1);
            }
            that.cancelUserRegDialog = false;
          }
        })
        .catch(function(error) {
          that.loading = false;
          that.operationMessage =
            "There was an error on the remote endpoint. Try again later.";
          that.operationMessageType = "error";
          that.snackbar = true;
        });
    },
    cancelRegistration() {
      this.loading = true;
      var requestConfig = {
        headers: {
          Authorization: "Bearer " + this.$store.state.payload.jwt
        }
      };
      var requestParams = {
        ac_id: this.ac.id
      };

      var that = this;
      axios
        .post(
          this.$store.state.baseUrl +
            "unregister-from-ac?XDEBUG_SESSION_START=netbeans-xdebug",
          requestParams,
          requestConfig
        )
        .then(function(response) {
          that.loading = false;
          that.operationMessage = response.data.msg;
          that.operationMessageType = response.data.code;
          that.snackbar = true;
          if (response.data.code === "success") {
            that.ac.registered = false;
            that.cancelRegistrationDialog = false;
          }
        })
        .catch(function(error) {
          that.loading = false;
          that.operationMessage =
            "There was an error on the remote endpoint. Try again later.";
          that.operationMessageType = "error";
          that.snackbar = true;
        });
    },
    submit() {
      if (this.$refs.form.validate()) {
        this.loading = true;
        var requestConfig = {
          headers: {
            Authorization: "Bearer " + this.$store.state.payload.jwt,
            "Content-Type": "multipart/form-data"
          }
        };
        var formData = new FormData();
        formData.append("dsa_letter", this.ac.user_data.dsa_letter);
        formData.append("ac", JSON.stringify(this.ac));
        formData.append("url", this.activationUrl);
        formData.append("role", this.acRole);

        var that = this;
        axios
          .post(
            this.$store.state.baseUrl +
              "register-with-ac?XDEBUG_SESSION_START=netbeans-xdebug",
            formData,
            requestConfig
          )
          .then(function(response) {
            that.loading = false;
            that.operationMessage = response.data.msg;
            that.operationMessageType = response.data.code;
            that.snackbar = true;
            if (response.data.code === "success") {
              that.ac.registered = true;
              if (that.isGuest) {
                that.$store.state.authRouteRequested =
                  "/assessment-centre/" + that.acSlug;
                setTimeout(function() {
                  that.$router.push("/login");
                }, 5000);
              } else {
                that.$router.push("/assessment-centre/" + that.acSlug);
              }
            }
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
    test() {
      console.log("Test");
    },
    getAC() {
      return new Promise((resolve, reject) => {
        var requestConfig = {
          headers: {
            Authorization: "Bearer " + this.$store.state.payload.jwt
          },
          params: {
            slug: this.acSlug,
            XDEBUG_SESSION_START: "netbeans-xdebug"
          }
        };
        axios
          .get(this.$store.state.baseUrl + "get-ac-info", requestConfig)
          .then(function(response) {
            let item = response.data;
            resolve({
              item
            });
          })
          .catch(function(error) {
            let item = {};
            resolve({
              item
            });
          });
      });
    }
  }
};
</script>
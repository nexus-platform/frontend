<template>
  <v-container fluid mt-5>

    <template v-if="loadingInitialElements">
      <v-layout row wrap mt-2>
        <v-flex xs12 sm8 offset-sm2 mt-4>
          <h3 class="primary--text" :class="loadingInitialElements ? 'uppercase' : ''">{{ dsaName }}</h3>
        </v-flex>
        <v-flex xs12 mt-3>
          <v-progress-circular indeterminate color="blue-grey"></v-progress-circular>
        </v-flex>
      </v-layout>
    </template>
    
    <template v-else>

      <v-layout align-center justify-center class="animated fadeIn">
        <v-flex md10 mt-3>
          <template v-if="operationMessageType === 'warning'">
            <v-alert :value="true" color="warning">
              <img src="static/img/403.png" />
              <h4>{{ operationMessage }}</h4>
            </v-alert>
          </template>

          <template v-else>
            <template v-if="isGuest">
              <v-toolbar tabs color="indigo">
                <v-toolbar-title class="white--text"><v-icon class="white--text">school</v-icon> {{ dsaName }}</v-toolbar-title>
              </v-toolbar>
              <v-card>
                <v-tabs v-model="currTab" centered color="transparent" icons-and-text>
                  <v-tabs-slider color="indigo"></v-tabs-slider>
                  <v-tab @click="redirect('login')" href="#tab-login">Log in<v-icon>verified_user</v-icon></v-tab>
                  <v-tab @click="redirect('signup')" href="#tab-signup">Sign up<v-icon>account_circle</v-icon></v-tab>
                  <v-tab @click="redirect('reset-password')" href="#tab-reset-password">Reset password<v-icon>email</v-icon></v-tab>
                  
                  <v-tab-item id="tab-login">
                    <v-layout align-center justify-center>
                      <v-flex md6 mt-5>
                        <v-card-text>
                          <v-form v-model="loginValidationStatus" ref="loginForm">
                            <v-layout row>
                              <v-flex lg12>
                                <v-text-field validate-on-blur @keyup.enter="login()" v-model="email" prepend-icon="mail" name="email" label="Email" type="text" required :rules="emailRules" hint="Enter your registered email address"></v-text-field>
                                <v-text-field ref="loginPassword" @keyup.enter="login()" @input="showCapsLockMsg($event)" v-model="password" prepend-icon="lock" name="password" label="Password" type="password" required :rules="passwordRules" hint="Enter your password"></v-text-field>
                              </v-flex>
                            </v-layout>
                          </v-form>
                        </v-card-text>
                        <v-card-actions class="pb-5">
                          <v-spacer></v-spacer>
                          <v-tooltip bottom :color="loginValidationColor">
                            <v-btn :disabled="loading" v-on:click="login()" class="white--text" :class="{ red: !loginValidationStatus, indigo: loginValidationStatus }" slot="activator">
                              <icon v-if="loading" name="circle-notch" spin class="gray--text"></icon>
                              <v-icon size="22" v-if="!loading && loginValidationStatus">done</v-icon>
                              <v-icon size="22" v-if="!loading && !loginValidationStatus">error_outline</v-icon>
                              &nbsp;Log in
                            </v-btn>
                            <span>{{loginValidationMessage}}</span>
                          </v-tooltip>
                        </v-card-actions>
                      </v-flex>
                    </v-layout>
                  </v-tab-item>

                  <v-tab-item id="tab-signup">
                    <v-layout justify-center>
                      <v-flex xs10>
                        <v-card-text>
                          <v-form v-model="signupValidationStatus" ref="signupForm">
                            <v-layout row wrap>
                              <v-flex sm12 md11 lg6>
                                <v-text-field v-model="name" prepend-icon="edit" name="name" label="First name" type="text" :rules="nameRules"></v-text-field>
                                <v-text-field v-model="last_name" prepend-icon="edit" name="last_name" label="Last name" type="text" :rules="lastNameRules"></v-text-field>
                                <v-text-field v-model="password" prepend-icon="lock" name="password" label="Password" :rules="passwordRules" :append-icon="e1 ? 'visibility' : 'visibility_off'" @click:append="() => (e1 = !e1)" :type="e1 ? 'password' : 'text'" hint="At least 6 characters" min="6"></v-text-field>
                                <v-text-field v-model="password_confirm" prepend-icon="lock" name="passwordConfirm" label="Password Confirmation" :rules="passwordConfirmRules" :append-icon="e2 ? 'visibility' : 'visibility_off'" @click:append="() => (e2 = !e2)" :type="e2 ? 'password' : 'text'" hint="Re-type your password"></v-text-field>
                              </v-flex>
                              <v-flex sm12 md11 lg6>
                                <v-text-field validate-on-blur v-model="email" prepend-icon="email" name="email" label="Email" type="email" :rules="emailRules"></v-text-field>
                                <v-text-field @blur="test()" v-model="postcode" prepend-icon="place" name="postcode" label="Postcode" :hint="loadingPostcodeInfo ? 'Loading postcode...' : 'Enter a postcode to lookup'" single-line type="text"></v-text-field>
                                <v-text-field v-model="address" prepend-icon="fas fa-map-signs" name="address" label="Address" type="text" :rules="addressRules"></v-text-field>
                              </v-flex>
                            </v-layout>
                          </v-form>
                        </v-card-text>

                        <v-card-actions class="pb-5">
                          <v-spacer></v-spacer>
                          <v-tooltip bottom :color="signupValidationColor">
                            <v-btn @click="signup()" :disabled="loading" class="white--text" :class="{ red: !signupValidationStatus, indigo: signupValidationStatus }" slot="activator">
                              <v-icon size="22" v-if="!loading && signupValidationStatus">done</v-icon>
                              <v-icon size="22" v-if="!loading && !signupValidationStatus">error_outline</v-icon>
                              <icon v-if="loading" name="circle-notch" spin style="color: gray;"></icon>
                              &nbsp;Sign up
                            </v-btn>
                            <span>{{signupValidationMessage}}</span>
                          </v-tooltip>
                          <v-btn @click="resetSignupForm()" class="white--text primary ml-2" slot="activator">
                            <v-icon size="22">cancel</v-icon>&nbsp;Reset
                          </v-btn>
                        </v-card-actions>
                      </v-flex>
                    </v-layout>
                  </v-tab-item>

                  <v-tab-item id="tab-reset-password">
                    <v-layout align-center justify-center row>
                      <v-flex xs6 mt-5>
                        <v-card-text>
                          <v-form v-model="resetPasswordValidationStatus" ref="resetPasswordForm">
                            <v-layout row>
                              <v-flex lg12>
                                <v-text-field v-model="email" ref="resetPasswordEmail" @keyup.enter="requestPasswordReset()" validate-on-blur prepend-icon="email" name="email" label="Email" type="email" :rules="emailRules"></v-text-field>
                              </v-flex>
                            </v-layout>
                          </v-form>
                        </v-card-text>
                        <v-card-actions class="pb-5">
                          <v-spacer></v-spacer>
                          <v-tooltip bottom :color="resetPasswordValidationColor">
                            <v-btn :disabled="loading" v-on:click="requestPasswordReset()" class="white--text" :class="{ red: !resetPasswordValidationStatus, indigo: resetPasswordValidationStatus }" slot="activator">
                              <icon v-if="loading" name="circle-notch" spin class="gray--text"></icon>
                              <v-icon size="22" v-if="!loading && resetPasswordValidationStatus">done</v-icon>
                              <v-icon size="22" v-if="!loading && !resetPasswordValidationStatus">error_outline</v-icon>
                              &nbsp;Send request
                            </v-btn>
                            <span>{{resetPasswordValidationMessage}}</span>
                          </v-tooltip>
                        </v-card-actions>
                      </v-flex>
                    </v-layout>
                  </v-tab-item>
                </v-tabs>
              </v-card>
            </template>

            <template v-else>
              <template v-if="action === 'admin' && isDO">
                <v-card><my-institute></my-institute></v-card>
              </template>

              <template v-else-if="action === 'submitted-forms' && isDO">
                <v-card><submitted-forms></submitted-forms></v-card>
              </template>

              <template v-else-if="action === 'dsa-forms' && (isDO || isStudent)">
                <v-card v-if="parameter === 'index'"><dsa-forms></dsa-forms></v-card>
                <v-card v-else><dsa-form ref="dsaForm"></dsa-form></v-card>
              </template>
              
              <template v-else>
                <v-card-text>
                  <h3>Welcome to {{ dsaName }}</h3>
                </v-card-text>
              </template>
            </template>
          </template>
        </v-flex>
      </v-layout>
    </template>
    
    <axios-component ref="axios" v-on:finish="handleHttpResponse($event)" />

    <v-snackbar :timeout="5000" :bottom="true" :right="true" v-model="capsLockAlert" color="warning">
      <v-icon class="fa" color="white">warning</v-icon>Caps Lock is active
      <v-btn flat @click.native="capsLockAlert = false"><icon name="times"></icon></v-btn>
    </v-snackbar>

    <v-snackbar :timeout="5000" :bottom="true" :right="true" v-model="snackbar" :color="operationMessageType">
      <icon class="fa" name="info-circle"></icon> {{ operationMessage }}
      <v-btn flat @click.native="snackbar = false"><icon name="times"></icon></v-btn>
    </v-snackbar>

	</v-container>
</template>

<script>
import axios from "axios";
import { now } from "moment";
import AxiosComponent from "@/components/AxiosComponent";
import MyInstitute from "@/components/MyInstitute";
import DsaForms from "@/components/DSAForms";
import DsaForm from "@/components/DSAForm";
import SubmittedForms from "@/components/DOSubmittedForms";

export default {
  data() {
    return {
      parameter: null,
      id: null,
      action: null,
      currTab: "tab-3",
      snackbar: false,
      e1: true,
      e2: true,
      capsLockAlert: false,
      loading: false,
      alert: false,
      loadingPostcodeInfo: false,
      operationMessage: null,
      operationMessageType: null,
      name: "",
      last_name: "",
      password: "",
      password_confirm: "",
      email: "",
      address: "",
      postcode: "",
      loginValidationStatus: false,
      signupValidationStatus: false,
      resetPasswordValidationStatus: false,
      nameRules: [v => !!v || "This field is required"],
      lastNameRules: [v => !!v || "This field is required"],
      passwordRules: [
        v => !!v || "This field is required"
        //v => (v && v.length > 5) || "Password requires at least 6 characters"
      ],
      passwordConfirmRules: [
        v => !!v || "This field is required",
        v => v === this.password || "Passwords do not match"
      ],
      emailRules: [
        v => !!v || "E-mail is required",
        v =>
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v) ||
          "E-mail must be valid"
      ],
      addressRules: [v => !!v || "This field is required"],
      dsaName: "Validating Institute",
      loadingInitialElements: true,
      componentMounted: false,
      anonymActions: ["login", "signup", "reset-password"],
      authActions: ["dsa-forms", "my-dsa-forms"],
    };
  },
  components: { AxiosComponent, MyInstitute, DsaForms, DsaForm, SubmittedForms },
  mounted() {
    this.refreshInterface(this.$route);
  },
  beforeRouteUpdate(to, from, next) {
    this.refreshInterface(to);
    next();
  },
  methods: {
    redirect(action) {
      this.$router.push(`/dsa/${this.dsaSlug}/${action}`);
    },
    refreshInterface(route) {
      this.dsaSlug = route.params.dsa_slug;
      this.action = route.params.action;
      this.parameter = route.params.parameter;
      this.id = route.params.id;

      if (this.isGuest && this.authActions.includes(this.action)) {
        this.$store.state.authRouteRequested = route.path;
      } else if (!this.isGuest && this.anonymActions.includes(this.action)) {
        this.action = 'index';
      } else {
        this.currTab = `tab-${this.action}`;
      }

      if (!this.componentMounted) {
        this.dsaName = "Validating Information";
        this.loadingInitialElements = true;
        var config = {
          url: "get-dsa-info",
          params: {
            slug: this.dsaSlug
          }
        };
        this.$refs.axios.submit(config);
        this.componentMounted = true;
      }

      if (this.id) {
        this.$refs.dsaForm.updateGUI(route);
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
          case "get-dsa-info":
            if (response.code === "success") {
              this.$store.state.homeUrl = `/dsa/${
                this.$route.params.dsa_slug
              }/index`;
              this.$store.state.dsaFormsUrl = `/dsa/${
                this.$route.params.dsa_slug
              }/dsa-forms/index`;
              this.$store.state.myDsaFormsUrl = `/dsa/${
                this.$route.params.dsa_slug
              }/my-dsa-forms/index`;
              this.dsaName = response.data.dsaName;
            } else if (response.code === "warning") {
              this.dsaName = response.data.dsaName;
            } else {
              this.$router.push("/not-found");
            }
            break;
          case "dsa-login":
            if (response.code === "success") {
              this.$store.commit("updatePayload", response.data);
              var redirect = this.$store.state.authRouteRequested;
              this.$store.state.authRouteRequested = null;
              this.$router.push(
                redirect ? redirect : this.$store.state.homeUrl
              );
            } else {
              this.snackbar = true;
              this.$store.commit("logout");
              this.$nextTick(this.$refs.loginPassword.focus);
            }
            break;
          case "request-password-reset":
            this.snackbar = true;
            this.$nextTick(this.$refs.resetPasswordEmail.focus);
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
    },
    showCapsLockMsg(e) {
      var lastChar = e.substring(e.length - 1);
      this.capsLockAlert =
        lastChar.toUpperCase() === lastChar &&
        lastChar.toLowerCase() !== lastChar;
    },
    login() {
      if (this.$refs.loginForm.validate()) {
        this.loading = true;
        this.snackbar = false;

        var config = {
          url: "dsa-login",
          method: "post",
          params: {
            slug: this.dsaSlug,
            email: this.email,
            password: this.password
          }
        };
        this.$refs.axios.submit(config);
      }
    },
    signup() {
      if (this.$refs.signupForm.validate()) {
        this.snackbar = false;
        this.loading = true;
        var activationUrl = window.location.href.replace(
          this.$route.path,
          "/activate-account"
        );
        var config = {
          url: "dsa-signup",
          method: "post",
          params: {
            name: this.name,
            last_name: this.last_name,
            email: this.email,
            password: this.password,
            address: this.address,
            postcode: this.postcode,
            activation_url: activationUrl,
            home_url: window.location.href.replace(
              this.$route.path,
              this.$store.state.homeUrl
            ),
            dsa: this.dsaSlug,
            form_url: this.$store.state.authRouteRequested
          }
        };
        this.$refs.axios.submit(config);
      }
    },
    requestPasswordReset() {
      if (this.$refs.resetPasswordForm.validate()) {
        this.snackbar = false;
        this.loading = true;
        var activationUrl = window.location.href.replace(
          this.$route.path,
          "/reset-password"
        );
        var config = {
          url: "request-password-reset",
          method: "post",
          params: {
            email: this.email,
            activation_url: activationUrl,
            home_url: window.location.href.replace(
              this.$route.path,
              this.$store.state.homeUrl
            )
          }
        };
        this.$refs.axios.submit(config);
      }
    },
    resetSignupForm() {
      this.$refs.signupForm.reset();
    },
    test() {
      console.log("Looking up postcode...");
    }
  },
  computed: {
    loginValidationMessage: function() {
      return this.loginValidationStatus
        ? "Good to go!"
        : "Verify your information";
    },
    loginValidationColor: function() {
      return this.loginValidationStatus ? "indigo" : "red";
    },
    signupValidationMessage: function() {
      return this.signupValidationStatus ? "Good to go!" : "Verify your data";
    },
    signupValidationColor: function() {
      return this.signupValidationStatus ? "indigo" : "red";
    },
    resetPasswordValidationMessage: function() {
      return this.resetPasswordValidationStatus
        ? "Good to go!"
        : "Verify your data";
    },
    resetPasswordValidationColor: function() {
      return this.resetPasswordValidationStatus ? "indigo" : "red";
    },
    isGuest() {
      return this.$store.state.payload.is_guest;
    },
    isDO() {
      return this.$store.state.payload.roles.includes("do");
    },
    isStudent() {
      return this.$store.state.payload.roles.includes("student");
    }
  }
};
</script>
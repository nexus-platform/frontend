<template>
  <v-flex>
    <VProgress v-if="loadingInitialElements" message="Validating Centre information"/>

    <template v-else>
      <!--Anonymous user-->
      <template v-if="$store.getters.isGuest">
        <AuthComponent
          ref="auth"
          v-on:finish="handleHttpResponse($event)"
          target="ac"
          :invitationToken="invitationToken"
          :emailProp="ac.user_data.email"
          :currTab="currTab"
          :parentName="ac.name"
          :apiUrls="apiUrls"
          :slug="acSlug"
        />
      </template>

      <!--Authenticated user-->
      <template v-else>
        <template v-if="acAction === 'index'">
          <!--The user has submitted the form-->
          <template v-if="ac.user_data.ac_form_full_submit">
            <!--Booking needs to be authorized-->
            <template v-if="!ac.user_data.ac_booking_enabled">
              <v-layout row wrap mt-3 class="animated fadeIn">
                <v-flex md6 offset-md3>
                  <v-toolbar tabs color="indigo">
                    <v-toolbar-title class="white--text">
                      <v-icon class="white--text fa">school</v-icon>
                      {{ ac.name }}
                    </v-toolbar-title>
                  </v-toolbar>
                  <v-card>
                    <v-card-text>
                      <h3>
                        Your request form has been successfully submitted.
                        <br>You'll be notified when the Manager approves or denies it.
                      </h3>
                    </v-card-text>
                  </v-card>
                </v-flex>
              </v-layout>
            </template>
          </template>

          <!--The user needs to submit the form-->
          <template v-else>
            <v-container>
              <v-layout row wrap>
                <AcForm v-on:submit-ac-form="acFormSubmitted($event)" :ac="ac" :acFormErrors="acFormErrors" :items="items" :slug="acSlug"/>
              </v-layout>
            </v-container>

            <v-dialog width="500" v-model="uploadDlg" persistent>
              <v-card>
                <v-card-title class="headline grey lighten-2">
                  Upload file
                  <v-spacer></v-spacer>
                  <a @click="uploadDlg = false">
                    <v-icon class="fa">close</v-icon>
                  </a>
                </v-card-title>
                <v-container>
                  <FileUpload v-on:set-file="setDSALetter($event)" />
                </v-container>
              </v-card>
            </v-dialog>
          </template>
        </template>
      </template>
    </template>

    <v-snackbar
      :timeout="5000"
      :bottom="true"
      :right="true"
      v-model="snackbar"
      :color="operationMessageType"
    >
      <v-icon class="fa">info</v-icon>
      {{ operationMessage }}
      <v-btn flat @click.native="snackbar = false">
        <v-icon>close</v-icon>
      </v-btn>
    </v-snackbar>

    <AxiosComponent ref="axios" v-on:finish="handleHttpResponse($event)"/>
  </v-flex>
</template>

<script>
import FileUpload from "@/components/FileUpload";
import moment from "moment";
import Vue from "vue";
import AuthComponent from "@/components/Auth";
import AcceptInvitation from "@/components/AcceptInvitation";
import AcSubmittedForms from "@/components/ac/ACSubmittedForms";
import AcSubmittedForm from "@/components/ac/ACSubmittedForm";
import AcForm from "@/components/ac/ACForm";
import IframeComponent from "@/components/Iframe";

export default {
  data() {
    return {
      acFormErrors: [],
      loadingSubmittedForm: false,
      validParams: false,
      date: null,
      active: null,
      items: [],
      loadingEA: false,
      uploadDlg: false,
      validationStatus: false,
      loadingInitialElements: true,
      acSlug: null,
      acAction: null,
      snackbar: false,
      loading: false,
      dsaLetterRules: [v => !!v || "This field is required"],
      operationMessage: "Enter your credentials",
      operationMessageType: "warning",
      dsaLetterName: "",
      ac: {
        id: null,
        settings: {
          name: "Validating Assessment Centre Information",
          admin: null
        }
      },
      invitationToken: null,
      userToken: null,
      eaUrl: "",
      componentMounted: false,
      anonymActions: ["login", "signup", "reset-password"],
      authActions: ["booking", "ac-forms"],
      apiUrls: {
        login: "login",
        signup: "signup",
        resetPassword: "request-password-reset"
      },
      acSubmittedFormItems: []
    };
  },
  components: {
    FileUpload,
    AuthComponent,
    AcceptInvitation,
    AcSubmittedForms,
    AcSubmittedForm,
    AcForm,
    IframeComponent
  },
  mounted() {
    this.refreshInterface(this.$route);
    if (window.addEventListener) {
      window.addEventListener("message", this.eaFrameResize, false);
    }
  },
  beforeRouteUpdate(to, from, next) {
    this.refreshInterface(to);
    next();
  },
  methods: {
    acFormSubmitted(event) {
      this.ac.user_data.ac_form_full_submit = event.ac_form_full_submit;
      this.ac.user_data.ac_booking_enabled = event.ac_booking_enabled;
      this.operationMessage = "Your form has been submitted";
      this.operationMessageType = "success";
      this.snackbar = true;
    },
    refreshInterface(route) {
      this.activationUrl = window.location.href.replace(
        route.path,
        "/activate-account"
      );
      var prevAcSlug = this.acSlug;
      this.acSlug = route.params.slug;
      this.acAction = route.params.action;
      if (this.acAction === "ac-forms") {
        this.userToken = route.params.token;
      } else {
        this.invitationToken = route.params.token;
      }

      if (
        this.$store.getters.isGuest &&
        this.authActions.includes(this.acAction)
      ) {
        this.$store.commit('setAuthRouteRequested', route.path);
      } else if (
        !this.$store.getters.isGuest &&
        this.anonymActions.includes(this.acAction)
      ) {
        this.acAction = "index";
      } else {
        this.currTab = `tab-${this.acAction}`;
      }

      if (!this.componentMounted || prevAcSlug !== this.acSlug) {
        this.loadingInitialElements = true;
        this.ac = {
          id: null,
          settings: {
            name: "Validating Assessment Centre",
            admin: null
          }
        };
        var config = {
          url: "get-ac-info",
          params: {
            slug: this.acSlug,
            invitation_token: this.invitationToken
          }
        };
        this.$refs.axios.submit(config);
        this.componentMounted = true;
      }
    },
    setDSALetter(event) {
      this.ac.user_data.dsa_letter = event;
      if (event) {
        this.dsaLetterName = event.name;
        this.uploadDlg = false;
      } else {
        this.dsaLetterName = null;
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
          case "get-ac-info":
            this.loadingInitialElements = false;
            if (response.code === "success") {
              this.validParams = true;
              this.ac = response.data;
              this.items = this.ac.star_assessment_form;
              this.acRole = this.ac.role;
              this.dsaLetterName = this.ac.user_data.dsa_letter;
              let homeUrl = `/assessment-centre/${this.acSlug}`;
              this.$store.commit("setHomeUrl", homeUrl);
              this.$store.commit("setACInfo", this.ac);

              if (this.ac.registered && this.acAction === "signup") {
                this.$router.push(`${homeUrl}/index`);
              } else if (!this.ac.registered && this.acAction === "index") {
                var url = `${homeUrl}/login/`;
                var urlOk = true;
                if (this.acRole === "na") {
                  if (this.invitationToken) {
                    url += this.invitationToken;
                  } else {
                    urlOk = false;
                  }
                }
                this.$router.push(urlOk ? url : "/");
              }
            } else {
              //this.$store.commit("setHomeUrl", "/auth/login");
              this.$router.push("/not-found");
            }
            break;
          case this.apiUrls.login:
            if (response.code === "success") {
              this.ac = response.data.ac_info;
              //this.items = this.ac.star_assessment_form;
              this.$store.commit("updatePayload", response.data);
              this.$store.commit(
                "setHomeUrl",
                `/assessment-centre/${this.acSlug}`
              );
              var redirect = this.$store.getters.getAuthRouteRequested;
              this.$store.commit("setAuthRouteRequested", null);
              this.$router.push(
                redirect ? redirect : `/dashboard`
              );
            } else {
              this.snackbar = true;
              this.$store.commit("logout");
            }
            break;
          case this.apiUrls.resetPassword:
            this.snackbar = true;
            break;
          case "get-ac-submitted-form":
            this.acSubmittedFormItems = response.data;
            this.loadingSubmittedForm = false;
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

<style scoped>
.v-input--selection-controls.v-input .v-label {
  font-size: 14px !important;
}
.v-input__control,
.v-datatable .v-input--selection-controls {
  margin-top: -9px !important;
  max-height: 20px !important;
}
.padding-20 {
  padding: 20px 40px;
}

pre {
  overflow: auto;
}
pre .string {
  color: #885800;
}
pre .number {
  color: blue;
}
pre .boolean {
  color: magenta;
}
pre .null {
  color: red;
}
pre .key {
  color: green;
}

h1 {
  text-align: center;
  font-size: 36px;
  margin-top: 20px;
  margin-bottom: 10px;
  font-weight: 500;
}

fieldset {
  border: 0;
}

.panel {
  margin-bottom: 20px;
  background-color: #fff;
  border: 1px solid transparent;
  border-radius: 4px;
  -webkit-box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
  border-color: #ddd;
}

.panel-heading {
  color: #333;
  background-color: #f5f5f5;
  border-color: #ddd;

  padding: 10px 15px;
  border-bottom: 1px solid transparent;
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
}

.panel-body {
  padding: 15px;
}

.field-checklist .wrapper {
  width: 100%;
}
</style>

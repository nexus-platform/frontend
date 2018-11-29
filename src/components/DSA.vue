<template>
  <v-container fluid mt-5 class="animated fadeIn">

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
              <auth-component ref="auth" v-on:finish="handleHttpResponse($event)" target="dsa" :currTab="currTab" :parentName="dsaName" :apiUrls="apiUrls" :slug="dsaSlug" />
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
import AxiosComponent from "@/components/AxiosComponent";
import MyInstitute from "@/components/MyInstitute";
import DsaForms from "@/components/DSAForms";
import DsaForm from "@/components/DSAForm";
import SubmittedForms from "@/components/DOSubmittedForms";
import AuthComponent from "@/components/AuthComponent";

export default {
  data() {
    return {
      parameter: null,
      id: null,
      action: null,
      currTab: "tab-login",
      snackbar: false,
      e1: true,
      e2: true,
      capsLockAlert: false,
      loading: false,
      alert: false,
      loadingPostcodeInfo: false,
      operationMessage: null,
      operationMessageType: null,
      dsaName: "Validating Institute",
      loadingInitialElements: true,
      componentMounted: false,
      anonymActions: ["login", "signup", "reset-password"],
      authActions: ["dsa-forms", "my-dsa-forms"],
      apiUrls: {
        login: "login",
        signup: "signup",
        resetPassword: "request-password-reset"
      }
    };
  },
  components: {
    AxiosComponent,
    MyInstitute,
    DsaForms,
    DsaForm,
    SubmittedForms,
    AuthComponent
  },
  mounted() {
    this.refreshInterface(this.$route);
  },
  beforeRouteUpdate(to, from, next) {
    this.refreshInterface(to);
    next();
  },
  methods: {
    refreshInterface(route) {
      this.dsaSlug = route.params.dsa_slug;
      this.action = route.params.action;
      this.parameter = route.params.parameter;
      this.id = route.params.id;

      if (this.isGuest && this.authActions.includes(this.action)) {
        this.$store.state.authRouteRequested = route.path;
      } else if (!this.isGuest && this.anonymActions.includes(this.action)) {
        this.action = "index";
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
      this.loadingInitialElements = false;
      this.loading = false;

      if (event.data.result.code === 200) {
        var response = event.data.result.response;
        this.operationMessage = response.msg;
        this.operationMessageType = response.code;

        switch (event.url.substring(event.url.lastIndexOf("/") + 1)) {
          case "get-dsa-info":
            if (response.code === "success") {
              this.$store.state.homeUrl = `/dsa/${this.$route.params.dsa_slug}`;
              this.$store.state.dsaFormsUrl = `/dsa/${
                this.$route.params.dsa_slug
              }/dsa-forms/index`;
              this.$store.state.myDsaFormsUrl = `/dsa/${
                this.$route.params.dsa_slug
              }/my-dsa-forms/index`;
              this.$store.state.authType = 'dsa';
              this.dsaName = response.data.dsaName;
            } else if (response.code === "warning") {
              this.dsaName = response.data.dsaName;
            } else {
              this.$router.push("/not-found");
            }
            break;
          case this.apiUrls.login:
            if (response.code === "success") {
              this.$store.commit("updatePayload", response.data);
              var redirect = this.$store.state.authRouteRequested;
              this.$store.state.authRouteRequested = null;
              this.$router.push(
                redirect ? redirect : `${this.$store.state.homeUrl}/index`
                //redirect ? redirect : '/dashboard'
              );
            } else {
              this.snackbar = true;
              this.$store.commit("logout");
            }
            break;
          case this.apiUrls.resetPassword:
            this.snackbar = true;
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
  },
  computed: {
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
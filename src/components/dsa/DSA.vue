<template>
  <v-flex xs12>
    <VProgress v-if="loadingInitialElements" message="Validating DSA information" class="mt-3"/>

    <template v-else>
      <v-layout align-center justify-center class="animated fadeIn">
        <v-flex md10 mt-3>
          <template v-if="operationMessageType === 'warning'">
            <v-alert :value="true" color="warning">
              <h4>{{ operationMessage }}</h4>
            </v-alert>
          </template>

          <template v-else>
            <template v-if="$store.getters.isGuest">
              <AuthComponent
                ref="auth"
                v-on:finish="handleHttpResponse($event)"
                target="dsa"
                :currTab="currTab"
                :parentName="dsaName"
                :apiUrls="apiUrls"
                :slug="dsaSlug"
              />
            </template>

            <template v-else>
              <template v-if="action === 'admin' && $store.getters.isDO">
                <DsaAdmin/>
              </template>

              <template v-else-if="action === 'submitted-forms' && $store.getters.isDO">
                <SubmittedForms/>
              </template>

              <template
                v-else-if="action === 'dsa-forms' && ($store.getters.isDO || $store.getters.isStudent)"
              >
                <DsaForms v-if="parameter === 'index'"/>
                <DsaForm v-else/>
              </template>

              <template v-else-if="action === 'my-dsa-forms' && $store.getters.isStudent">
                <v-card v-if="parameter === 'index'">
                  <DsaStudentForms/>
                </v-card>
              </template>

              <template v-else-if="action === 'files'">
                <AttachedFiles targetType="dsa" />
              </template>

              <template v-else>
                <v-card-text>
                  <h3 class="text-xs-center">Welcome to {{ dsaName }}'s DSA Office</h3>
                </v-card-text>
              </template>
            </template>
          </template>
        </v-flex>
      </v-layout>
    </template>
    
    <v-snackbar
      :timeout="5000"
      :bottom="true"
      :right="true"
      v-model="capsLockAlert"
      color="warning"
    >
      <v-icon class="fa white--text" color="white">warning</v-icon>Caps Lock is active
      <v-btn flat @click.native="capsLockAlert = false">
        <v-icon>close</v-icon>
      </v-btn>
    </v-snackbar>

    <v-snackbar
      :timeout="5000"
      :bottom="true"
      :right="true"
      v-model="snackbar"
      :color="operationMessageType"
    >
      <v-icon class="fa white--text">warning</v-icon>
      {{ operationMessage }}
      <v-btn flat @click.native="snackbar = false">
        <v-icon>close</v-icon>
      </v-btn>
    </v-snackbar>

    <AxiosComponent ref="axios" v-on:finish="handleHttpResponse($event)"/>

  </v-flex>
</template>

<script>
import DsaAdmin from "@/components/dsa/DSAAdmin";
import DsaForms from "@/components/dsa/DSAForms";
import DsaStudentForms from "@/components/dsa/DSAStudentForms";
import DsaForm from "@/components/dsa/DSAForm";
import SubmittedForms from "@/components/dsa/DOSubmittedForms";
import AuthComponent from "@/components/Auth";
import AttachedFiles from "@/components/AttachedFiles";

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
      dsaName: null,
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
    DsaAdmin,
    DsaForms,
    DsaForm,
    SubmittedForms,
    AuthComponent,
    DsaStudentForms,
    AttachedFiles
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

      if (
        this.$store.getters.isGuest &&
        this.authActions.includes(this.action)
      ) {
        this.$store.commit("setAuthRouteRequested", route.path);
      } else if (
        !this.$store.getters.isGuest &&
        this.anonymActions.includes(this.action)
      ) {
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
              this.dsaName = response.data.dsaName;
              this.$store.commit(
                "setHomeUrl",
                `/dsa/${this.$route.params.dsa_slug}`
              );
            } else if (response.code === "warning") {
              this.dsaName = response.data.dsaName;
            } else {
              this.$router.push("/not-found");
            }
            break;
          case this.apiUrls.login:
            if (response.code === "success") {
              this.$store.commit("updatePayload", response.data);
              var redirect = this.$store.getters.getAuthRouteRequested;
              this.$store.commit("setAuthRouteRequested", null);
              this.$store.commit(
                "setHomeUrl",
                `/dsa/${this.$route.params.dsa_slug}`
              );
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
<template>
  <v-content>
    <v-layout row wrap>
      <v-flex md-8>
        <template>
          <AuthComponent
            ref="auth"
            v-on:finish="handleHttpResponse($event)"
            target="public"
            :emailProp="null"
            :currTab="currTab"
            :parentName="'Welcome to Nexus'"
            :apiUrls="apiUrls"
            :slug="null"
          />
        </template>
      </v-flex>
    </v-layout>

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
  </v-content>
</template>

<script>
import AuthComponent from '@/components/Auth'

export default {
  data() {
    return {
      currTab: "tab-login",
      snackbar: false,
      loading: false,
      operationMessage: "Enter your credentials",
      operationMessageType: "warning",
      action: null,
      actions: ["login", "reset-password"],
      apiUrls: {
        login: "login",
        resetPassword: "request-password-reset"
      }
    };
  },
  components: {
    AuthComponent
  },
  beforeRouteUpdate(to, from, next) {
    this.refreshInterface(to);
    next();
  },
  created() {
    this.refreshInterface(this.$route);
  },
  methods: {
    refreshInterface(route) {
      this.action = route.params.action;
      this.$store.commit('setHomeUrl', '/auth')
      if (!this.actions.includes(this.action)) {
        this.action = "login";
        this.$router.push("/auth/login");
      }
      this.currTab = `tab-${this.action}`;
    },
    handleHttpResponse(event) {
      this.loading = false;
      this.loadingInitialElements = false;

      if (event.data.result.code === 200) {
        var response = event.data.result.response;
        this.operationMessage = response.msg;
        this.operationMessageType = response.code;

        switch (event.url.substring(event.url.lastIndexOf("/") + 1)) {
          case this.apiUrls.login:
            if (response.code === "success") {
              this.ac = response.data.ac_info
              this.$store.commit("updatePayload", response.data)
              var redirect = this.$store.getters.getAuthRouteRequested
              this.$store.commit('setAuthRouteRequested', null)
              this.$router.push(redirect ? redirect : "/dashboard")
            } else {
              this.snackbar = true
              this.$store.commit("logout")
            }
            break;
          default:
            this.snackbar = true
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

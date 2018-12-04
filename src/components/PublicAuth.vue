<template>
  <v-container fluid mt-5 class="animated fadeIn">
    <v-layout row wrap>
      <v-flex md-8>
        <template>
          <auth-component
            ref="auth"
            v-on:finish="handleHttpResponse($event)"
            target="public"
            :emailProp="null"
            :currTab="currTab"
            :parentName="'Nexus'"
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
      <icon class="fa" name="info-circle"></icon>
      {{ operationMessage }}
      <v-btn flat @click.native="snackbar = false">
        <icon name="times"></icon>
      </v-btn>
    </v-snackbar>

    <axios-component ref="axios" v-on:finish="handleHttpResponse($event)"/>
  </v-container>
</template>

<script>
import AxiosComponent from "@/components/AxiosComponent";
import Vue from "vue";
import AuthComponent from "@/components/AuthComponent";

export default {
  data() {
    return {
      currTab: "tab-login",
      snackbar: false,
      loading: false,
      operationMessage: "Enter your credentials",
      operationMessageType: "warning",
      action: null,
      actions: ["login", "signup", "reset-password"],
      apiUrls: {
        login: "login",
        signup: "signup",
        resetPassword: "request-password-reset"
      }
    };
  },
  components: {
    AxiosComponent,
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
      this.$store.state.homeUrl = `/auth`;
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
              this.ac = response.data.ac_info;
              this.$store.commit("updatePayload", response.data);
              var redirect = this.$store.state.authRouteRequested;
              this.$store.state.authRouteRequested = null;
              this.$router.push(redirect ? redirect : "/dashboard");
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

<template>
  <v-flex xs12 sm10 md8 lg6>
    <v-card class="elevation-1">
      <v-toolbar dark color="indigo">
        <v-toolbar-title>
          <v-icon>person</v-icon>
          {{message}}
        </v-toolbar-title>
      </v-toolbar>

      <v-container v-if="loading" mt-3>
        <v-progress-circular :width="2" indeterminate color="blue-grey"></v-progress-circular>
      </v-container>

      <v-container v-if="!loading">
        <v-alert
          value="true"
          :type="operationMessageType"
          transition="fade-transition"
        >{{operationMessage}}</v-alert>
      </v-container>

      <v-container v-if="!loading && $store.getters.isGuest">
        <v-flex xs12>
          <router-link to="/login" tag="span" style="cursor: pointer">
            <v-btn class="white--text primary">
              <v-icon small>lock</v-icon>&nbsp;Go to Login Page
            </v-btn>
          </router-link>
        </v-flex>
      </v-container>

      <AxiosComponent ref="axios" v-on:finish="handleHttpResponse($event)"/>
    </v-card>
  </v-flex>
</template>

<script>
export default {
  data() {
    return {
      message: "Verifying request information",
      operationMessage: "",
      operationMessageType: "",
      token: null,
      loading: true,
      url: ""
    };
  },
  mounted() {
    this.token = this.$route.params.token;
    this.url = window.location.href.replace(this.$route.path, "/login");
    this.submit();
  },
  methods: {
    handleHttpResponse(event) {
      this.loading = false;
      this.snackbar = true;

      if (event.data.result.code === 200) {
        this.operationMessage = response.msg;
        this.operationMessageType = response.code;
      } else {
        this.operationMessage = "Your request could not be executed.";
        this.operationMessageType = "error";
      }
    },
    submit() {
      this.loading = true;
      var config = {
        method: "post",
        url: "accept-invitation",
        params: {
          token: this.token,
          url: this.url
        }
      };
      this.$refs.axios.submit(config);
    }
  }
};
</script>
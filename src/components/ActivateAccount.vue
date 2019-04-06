<template>
  <v-flex xs12 lg8 offset-lg2>
    <v-card class="elevation-2 pb-3">
      <v-toolbar dark color="indigo">
        <v-toolbar-title>
          <v-icon>person</v-icon>
          {{ message }}
        </v-toolbar-title>
      </v-toolbar>

      <VProgress v-if="loading" :message="null" class="mt-3"/>

      <v-container v-else>
        <v-alert
          value="true"
          :type="operationMessageType"
          transition="fade-transition"
        >{{operationMessage}}</v-alert>
      </v-container>
    </v-card>

    <AxiosComponent ref="axios" v-on:finish="handleHttpResponse($event)"/>
  </v-flex>
</template>

<script>
export default {
  data() {
    return {
      message: "User Account Activation",
      operationMessage: null,
      operationMessageType: null,
      token: null,
      loading: true
    };
  },
  mounted() {
    this.token = this.$route.params.token;
    this.submit();
  },
  methods: {
    submit() {
      var config = {
        method: "post",
        url: "activate-account",
        params: {
          token: this.token
        }
      };
      this.$refs.axios.submit(config);
    },
    handleHttpResponse(event) {
      this.loading = false;

      if (event.data.result.code === 200) {
        var response = event.data.result.response;
        this.operationMessage = response.msg;
        this.operationMessageType = response.code;

        switch (event.url.substring(event.url.lastIndexOf("/") + 1)) {
          case "activate-account":
            if (response.code === "success") {
              this.loading = false;
              this.snackbar = true;
              if (response.data) {
                this.$store.commit('setAuthRouteRequested', null);
                let that = this;
                setTimeout(function() {
                  that.$router.push(response.data.redirect);
                }, 5000);
              }
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
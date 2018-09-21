<template>
  <span v-show="false"></span>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      loading: false,
      reqConfig: {}
    };
  },
  methods: {
    setRequestConfig(config) {
      this.reqConfig = config;
      this.reqConfig.baseURL = this.$store.state.baseUrl;
      if (!this.reqConfig.headers) {
        this.reqConfig.headers = {};
      }
      if (!this.reqConfig.method) {
        this.reqConfig.method = "get";
      }
      if (this.$store.state.debug) {
        this.reqConfig.params.XDEBUG_SESSION_START = "netbeans-xdebug";
      }
      this.reqConfig.headers["Authorization"] =
        "Bearer " + this.$store.state.payload.jwt;
      this.reqConfig.onUploadProgress = function(progressEvent) {};
      this.reqConfig.data = this.reqConfig.params;
    },
    submit(config) {
      this.setRequestConfig(config);
      this.submitAsync().then(result => {
        this.$emit("finish", { data: result, url: config.url });
        this.loading = false;
      });
    },
    submitAsync() {
      this.loading = true;
      return new Promise((resolve, reject) => {
        axios(this.reqConfig)
          .then(function(response) {
            let result = { code: 200, response: response.data };
            resolve({ result });
          })
          .catch(function(error) {
            let result = { code: 500, response: error };
            resolve({ result });
          });
      });
    }
  }
};
</script>

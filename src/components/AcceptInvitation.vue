<template>
  <v-container fluid mt-5>
    <v-layout justify-center>
      <v-flex xs12 sm10 md8 lg6 mt-5>
        <v-card class="elevation-12">
          
          <v-toolbar dark color="indigo">
            <v-toolbar-title><v-icon>person</v-icon> {{message}}</v-toolbar-title>
          </v-toolbar>

          <v-container v-if="loading" mt-3>
            <icon name="circle-notch" scale=2 spin style="color: gray;"></icon>
          </v-container>
          
          <v-container v-if="!loading">
            <v-alert value="true" :type="operationMessageType" transition="fade-transition">
              {{operationMessage}}
            </v-alert>
          </v-container>
          
          <v-container v-if="!loading && isGuest">
            <v-flex xs12>
              <router-link to="/login" tag="span" style="cursor: pointer">
                <v-btn class="white--text primary"><v-icon small="">lock</v-icon>&nbsp;Go to Login Page</v-btn>
              </router-link>
            </v-flex>
          </v-container>

        </v-card>
      </v-flex>
      </v-layout>
	</v-container>
</template>

<script>
import axios from "axios";

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
  props: {
    source: String
  },
  created() {
    this.token = this.$route.params.token;
    this.url = window.location.href.replace(this.$route.path, "/login");
    this.submit();
  },
  methods: {
    submit() {
      this.loading = true;
      var requestConfig = {
        headers: {
          Authorization: "Bearer " + this.$store.state.payload.jwt
        }
      };
      var requestParams = {
        token: this.token,
        url: this.url
      };
      var that = this;

      axios
        .post(
          this.$store.state.baseUrl +
            "accept-invitation?XDEBUG_SESSION_START=netbeans-xdebug",
          requestParams,
          requestConfig
        )
        .then(function(response) {
          that.loading = false;
          that.operationMessageType = response.data.code;
          that.operationMessage = response.data.msg;
          if (response.data.data) {
          }
        })
        .catch(function(error) {
          that.loading = false;
          that.operationMessageType = "error";
          that.operationMessage = "Unable to process your request.";
        });
    }
  },
  computed: {
    validationMessage: function() {
      return this.validationStatus ? "Good to go!" : "Incomplete data";
    },
    validationIcon: function() {
      return this.validationStatus ? "check" : "clear";
    },
    validationColor: function() {
      return this.validationStatus ? "indigo" : "red";
    },
    isGuest() {
      return this.$store.state.payload.is_guest;
    }
  }
};
</script>
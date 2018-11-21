<template>
  <v-container fluid mt-5>
    <v-layout justify-center class="animated fadeIn">
      <v-flex xs12 sm10 md6 lg4 mt-5>
        <v-card class="elevation-12">
          
          <v-toolbar dark color="indigo">
            <v-toolbar-title>{{message}}</v-toolbar-title>
          </v-toolbar>

          <template v-if="loadingVerification">
            <v-container>
              <icon name="circle-notch" scale=2 spin style="color: gray;"></icon>
            </v-container>
          </template>
          
          <template v-else>
            <template v-if="validToken">
              <v-card-text>
                <v-form v-model="validationStatus" ref="form">
                  <v-layout row>
                    <v-flex v-if="validToken" lg12>
                      <v-text-field validate-on-blur v-model="password" prepend-icon="lock" name="password" label="Password" id="password" :rules="passwordRules" :append-icon="e1 ? 'visibility' : 'visibility_off'" @click:append="() => (e1 = !e1)" :type="e1 ? 'password' : 'text'" hint="At least 6 characters" min="6"></v-text-field>
                      <v-text-field validate-on-blur v-model="password_confirm" prepend-icon="lock" name="passwordConfirm" label="Password Confirmation" id="passwordConfirm" :rules="passwordConfirmRules" :append-icon="e2 ? 'visibility' : 'visibility_off'" @click:append="() => (e2 = !e2)" :type="e2 ? 'password' : 'text'" hint="Re-type your password"></v-text-field>
                    </v-flex>
                  </v-layout>
                </v-form>
              </v-card-text>
              
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-tooltip bottom :color="validationColor">
                  <v-btn v-on:click="submit" :disabled="loading" class="white--text mr-2" :class="{ red: !validationStatus, indigo: validationStatus }" slot="activator">
                    <icon v-if="loading" name="circle-notch" spin class="gray--text"></icon>
                    <v-icon v-else size="22">done</v-icon>&nbsp;Submit
                  </v-btn>
                  <span>{{validationMessage}}</span>
                </v-tooltip>
              </v-card-actions>
            </template>
          </template>

          <v-container v-if="alert">
            <v-alert :value="true" :type="operationMessageType" dismissible transition="fade-transition" icon="info">
              {{operationMessage}}
            </v-alert>
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
      message: "Reset password",
      e1: true,
      e2: true,
      password: "",
      password_confirm: "",
      homeUrl: "",
      alert: false,
      loading: false,
      loadingVerification: true,
      validationStatus: false,
      passwordRules: [
        v => !!v || "This field is required",
        v => (v && v.length > 5) || "Password requires at least 6 characters"
      ],
      passwordConfirmRules: [
        v => !!v || "This field is required",
        v => v === this.password || "Passwords do not match"
      ],
      operationMessage: null,
      operationMessageType: null,
      token: null,
      validToken: false
    };
  },
  props: {
    source: String
  },
  mounted() {
    this.token = this.$route.params.token;
    this.verifyToken();
  },
  methods: {
    verifyToken() {
      var that = this;
      axios
        .post(this.$store.state.baseUrl + "verify-token", {
          password: this.password,
          token: this.token
        })
        .then(function(response) {
          that.validToken = (response.data.code === 'success');
          that.alert = !that.validToken;
          that.operationMessageType = response.data.code;
          that.operationMessage = response.data.msg;
          that.loadingVerification = false;
          that.homeUrl = response.data.home_url;
        })
        .catch(function(error) {
          that.validToken = false;
          that.operationMessage = "There was an error on the remote endpoint. Try again later.";
          that.operationMessageType = "error";
          that.alert = true;
          that.loadingVerification = false;
        });
    },
    submit() {
      if (this.$refs.form.validate()) {
        this.loading = true;
        var that = this;
        axios
          .post(this.$store.state.baseUrl + "reset-password?XDEBUG_SESSION_START=netbeans-xdebug", {
            password: this.password,
            password_confirm: this.password_confirm,
            token: this.token,
            home_url: window.location.href.replace(this.$route.path, this.homeUrl)
          })
          .then(function(response) {
            that.loading = false;
            that.operationMessageType = response.data.code;
            that.operationMessage = response.data.msg;
            that.alert = true;
          })
          .catch(function(error) {
            that.loading = false;
            that.operationMessage = "There was an error on the remote endpoint. Try again later.";
            that.operationMessageType = "error";
            that.alert = true;
          });
      }
    },
    reset() {
      this.$refs.form.reset();
    }
  },
  computed: {
    validationMessage: function() {
      return this.validationStatus
        ? "Good to go!"
        : "Incomplete data";
    },
    validationColor: function() {
      return this.validationStatus ? "indigo" : "red";
    }
  }
};
</script>

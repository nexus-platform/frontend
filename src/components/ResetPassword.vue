<template>
  <v-container fluid mt-5>
    <v-layout justify-center class="animated fadeIn">
      <v-flex xs12 sm10 md6 lg4 mt-5>
        <v-card class="elevation-12">
          
          <v-toolbar dark color="indigo">
            <v-toolbar-title>{{message}}</v-toolbar-title>
          </v-toolbar>
            
          <v-card-text>
            <v-form v-model="validationStatus" ref="form">
              <v-layout row>
                <v-flex v-if="validToken" lg12>
                  <v-text-field v-model="password" prepend-icon="lock" name="password" label="Password" id="password" :rules="passwordRules" :append-icon="e1 ? 'visibility' : 'visibility_off'" :append-icon-cb="() => (e1 = !e1)" :type="e1 ? 'password' : 'text'" hint="At least 6 characters" min="6"></v-text-field>
                  <v-text-field v-model="password_confirm" prepend-icon="lock" name="passwordConfirm" label="Password Confirmation" id="passwordConfirm" :rules="passwordConfirmRules" :append-icon="e1 ? 'visibility' : 'visibility_off'" :append-icon-cb="() => (e1 = !e1)" :type="e1 ? 'password' : 'text'" hint="Re-type your password"></v-text-field>
                </v-flex>
              </v-layout>
            </v-form>
          </v-card-text>

          <v-card-actions v-if="validToken">
            <v-spacer></v-spacer>
            <v-tooltip bottom :color="validationColor">
              <v-btn v-on:click="submit" :disabled="loading" class="white--text" :class="{ red: !validationStatus, indigo: validationStatus }" slot="activator">
                <v-icon small>{{validationIcon}}</v-icon>&nbsp;Submit
              </v-btn>
              <v-btn v-on:click="reset" class="white--text primary" slot="activator">
                <v-icon small>cancel</v-icon>&nbsp;Clear
              </v-btn>
              <span>{{validationMessage}}</span>
            </v-tooltip>
          </v-card-actions>

          <v-container>
            <icon v-if="loadingVerification" name="circle-notch" scale=3 spin style="color: gray;"></icon>
            <v-alert v-model="alert" :value="true" :type="operationMessageType" dismissible transition="fade-transition" icon="warning">
              {{operationMessage}}
            </v-alert>
          </v-container>

          <v-layout row wrap>
              <v-flex xs12 sm12 md12 lg12>
                <v-container fluid>
                  <a><router-link to="/login" tag="span" style="cursor: pointer">&nbsp;Login Page</router-link></a>
                  </v-container>
              </v-flex>
          </v-layout>

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
      e2: false,
      e3: false,
      e4: false,
      password: "",
      password_confirm: "",
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
      operationMessage: "Enter  your credentials",
      operationMessageType: "warning",
      login_url: null,
      token: null,
      validToken: false
    };
  },
  props: {
    source: String
  },
  mounted() {
    this.login_url = window.location.href.replace(this.$route.path, '/login');
    this.token = this.$route.params.token;
    this.verifyToken();
  },
  methods: {
    verifyToken() {
      var that = this;
      axios
        .post(this.$store.state.baseUrl + "verify-token", {
          password: this.password,
          token: this.token,
          login_url: this.login_url
        })
        .then(function(response) {
          that.validToken = (response.data.code === 'success');
          that.operationMessageType = response.data.code;
          that.operationMessage = response.data.msg;
          that.alert = true;
          that.loadingVerification = false;
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
          .post(this.$store.state.baseUrl + "reset-password", {
            password: this.password,
            token: this.token,
            login_url: this.login_url
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
    validationIcon: function() {
      return this.validationStatus ? "check" : "clear";
    },
    validationColor: function() {
      return this.validationStatus ? "indigo" : "red";
    }
  }
};
</script>

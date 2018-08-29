<template>
  <v-container fluid mt-5 class="animated fadeIn">
    <v-layout align-center justify-center>
      <v-flex xs12 sm8 md6 lg4 mt-5>
        <v-card class="elevation-12">
          
          <v-toolbar dark color="indigo">
            <v-toolbar-title>Reset your password</v-toolbar-title>
          </v-toolbar>
          
          <v-card-text>
            <v-form v-model="validationStatus" ref="form">
              <v-text-field ref="email" v-on:keyup.enter="submit" v-model="email" prepend-icon="mail" name="email" label="Email" type="text" required :rules="emailRules"></v-text-field>
            </v-form>
          </v-card-text>
          
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-tooltip bottom :color="validationColor">
              <v-btn :disabled="loading" v-on:click="submit" class="white--text" :class="{ red: !validationStatus, indigo: validationStatus }" slot="activator">
                <icon v-if="loading" name="circle-notch" spin class="gray--text"></icon>
                <v-icon v-else>{{validationIcon}}</v-icon>
                &nbsp;Submit
              </v-btn>
              <span>{{validationMessage}}</span>
            </v-tooltip>
          </v-card-actions>

          <v-container>
            <v-layout row wrap>
              <v-flex xs12>
                <v-alert v-model="alert" :value="true" :type="operationMessageType" dismissible transition="fade-transition" icon="warning">
                  {{operationMessage}}
                </v-alert>
              </v-flex>
            </v-layout>
            <v-layout row wrap mt-3>
              <v-flex xs12>
                <span>Already have an account?</span><a><router-link to="/login" tag="span" style="cursor: pointer">&nbsp;Log in</router-link></a>
              </v-flex>
            </v-layout>
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
      loading: false,
      alert: false,
      email: "",
      validationStatus: false,
      emailRules: [
        v => !!v || "This field is required",
        v =>
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v) ||
          "E-mail must be valid"
      ],
      activationUrl: null,
      operationMessage: "Enter  your credentials",
      operationMessageType: "warning"
    };
  },
  mounted() {
    this.$nextTick(this.$refs.email.focus);
    this.activationUrl = window.location.href.replace(
      this.$route.path,
      "/reset-password"
    );
  },
  computed: {
    validationMessage: function() {
      return this.validationStatus ? "Good to go!" : "Provide a valid email";
    },
    validationIcon: function() {
      return this.validationStatus ? "done" : "error_outline";
    },
    validationColor: function() {
      return this.validationStatus ? "indigo" : "red";
    }
  },
  methods: {
    submit() {
      if (this.$refs.form.validate()) {
        this.loading = true;
        var that = this;

        axios
          .post(this.$store.state.baseUrl + "request-password-reset", {
            email: this.email,
            url: this.activationUrl
          })
          .then(function(response) {
            that.alert = true;
            that.operationMessage = response.data.msg;
            that.operationMessageType = response.data.code;
            that.loading = false;
          })
          .catch(function(error) {
            that.alert = true;
            that.operationMessage = "There was an error on the remote endpoint. Try again later.";
            that.operationMessageType = "error";
            that.loading = false;
          });
      }
    }
  }
};
</script>
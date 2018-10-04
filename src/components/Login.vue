<template>
  <v-container fluid mt-5>
    
    <v-layout ref="loginForm" align-center justify-center class="animated fadeIn">
      <v-flex xs12 sm8 md6 lg4 mt-5>
        <v-card class="elevation-8">
          
          <v-toolbar dark color="indigo">
            <v-toolbar-title>{{appMessage}}</v-toolbar-title>
          </v-toolbar>

          <v-card-text>
            <v-form v-model="validationStatus" ref="form">
              <v-layout row>
                <v-flex lg12>
                  <v-text-field ref="username" v-on:keyup.enter="submit" v-model="email" prepend-icon="mail" name="email" label="Email" type="text" required :rules="emailRules" hint="Enter your registered email address"></v-text-field>
                  <v-text-field ref="password" v-on:keyup.enter="submit" @input="showCapsLockMsg($event)" v-model="password" prepend-icon="lock" name="password" label="Password" id="password" type="password" required :rules="passwordRules" hint="Enter your password"></v-text-field>
                </v-flex>
              </v-layout>
            </v-form>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-tooltip bottom :color="validationColor">
              <v-btn :disabled="loading" v-on:click="submit" class="white--text" :class="{ red: !validationStatus, indigo: validationStatus }" slot="activator">
                <icon v-if="loading" name="circle-notch" spin class="gray--text"></icon>
                <v-icon size="22" v-if="!loading && validationStatus">done</v-icon>
                <v-icon size="22" v-if="!loading && !validationStatus">error_outline</v-icon>
                &nbsp;Submit
              </v-btn>
              <span>{{validationMessage}}</span>
            </v-tooltip>
          </v-card-actions>

          <v-container>
            <v-layout row>
              <v-flex xs12>
                <v-alert v-model="alert" :value="true" :type="loginMessageType" dismissible transition="fade-transition" icon="warning">
                  {{loginMessage}}
                  <v-tooltip v-if="speechSupported" bottom>
                    <span slot="activator" @click="playText(loginMessage)" style="position: absolute; margin: 0 7px; cursor: pointer; border-radius: 5px; padding: 3px 3px 0 2px; background-color: #755a04; height: 22px; width: 22px;">
                      <icon align-start color="white" v-if="playingText" name="volume-up"></icon>
                      <icon color="white" v-else name="volume-off"></icon>
                    </span>
                    <span><v-icon class="white--text" size="15">headset</v-icon> Listen to this text</span>
                  </v-tooltip>
                </v-alert>
              </v-flex>
            </v-layout>
            <v-layout row mt-3>
              <v-flex xs12>
                <a><router-link to="/signup" tag="span" style="cursor: pointer">Signup</router-link></a>&nbsp;|
                <a><router-link to="/request-password-reset" tag="span" style="cursor: pointer">Reset password</router-link></a>
              </v-flex>
            </v-layout>
          </v-container>

        </v-card>
      </v-flex>
    </v-layout>
    <speech-component ref="speech" @voices-loaded="playText(appMessage)" @speech-end="playingText = false"></speech-component>
    
    <v-snackbar :timeout="5000" :bottom="true" :right="true" v-model="capsLockAlert" color="warning">
      <v-icon color="white">warning</v-icon> Caps Lock is active
      <v-btn flat @click.native="capsLockAlert = false"><icon name="times"></icon></v-btn>
    </v-snackbar>

	</v-container>
</template>

<script>
import axios from "axios";
import { now } from "moment";
import SpeechComponent from "@/components/SpeechComponent";

export default {
  data() {
    return {
      capsLockAlert: false,
      loading: false,
      alert: false,
      appMessage: "Welcome to Nexus",
      loginMessage: null,
      loginMessageType: "warning",
      email: "",
      password: "",
      validationStatus: false,
      emailRules: [
        v => !!v || "This field is required",
        v =>
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v) ||
          "E-mail must be valid"
      ],
      passwordRules: [v => !!v || "This field is required"],
      drawer: null,
      timer: "",
      speechSupported: false,
      playingText: false
    };
  },
  components: { SpeechComponent },
  mounted() {
    this.$nextTick(this.$refs.username.focus);
    this.speechSupported = this.$refs.speech.speechSupported();
    if (this.speechSupported) {
      this.$refs.speech.speak();
    }
  },
  methods: {
    showCapsLockMsg(e) {
      var lastChar = e.substring(e.length - 1);
      this.capsLockAlert = (lastChar.toUpperCase() === lastChar && lastChar.toLowerCase() !== lastChar);
    },
    playText(text) {
      this.playingText = true;
      this.$refs.speech.speak(text);
    },
    submit() {
      if (this.$refs.form.validate()) {
        this.loading = true;
        this.alert = false;
        var that = this;
        axios
          .post(
            this.$store.state.baseUrl +
              "login?XDEBUG_SESSION_START=netbeans-xdebug",
            {
              email: this.email,
              password: this.password
            }
          )
          .then(function(response) {
            if (response.data.code === "success") {
              that.$store.commit("updatePayload", response.data.data);
              var redirect = that.$store.state.authRouteRequested;
              that.$store.state.authRouteRequested = null;
              that.$router.push(redirect ? redirect : "/");
            } else {
              that.alert = true;
              that.loginMessage = response.data.msg;
              that.loginMessageType = response.data.code;
              that.$store.commit("logout");
              that.$nextTick(that.$refs.password.focus);
            }
            that.loading = false;
          })
          .catch(function(error) {
            that.alert = true;
            that.loginMessage =
              "There was an error on the remote endpoint. Try again later.";
            that.loginMessageType = "error";
            that.loading = false;
          });
      }
    }
  },
  computed: {
    validationMessage: function() {
      return this.validationStatus
        ? "Now you're good to go!"
        : "Please, provide your credentials";
    },
    validationColor: function() {
      return this.validationStatus ? "indigo" : "red";
    }
  }
};
</script>
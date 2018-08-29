<template>
  <v-container fluid mt-5>
    <v-layout justify-center class="animated fadeIn">
      <v-flex xs12 sm10 md8 lg8 mt-5>
        <v-card class="elevation-12">
          
          <v-toolbar dark color="indigo">
            <v-toolbar-title>Signup to Nexus</v-toolbar-title>
          </v-toolbar>

          <v-container v-if="loadingInitialElements" mt-4>
            <icon name="circle-notch" scale=2 spin style="color: gray;"></icon>
          </v-container>
            
          <v-card-text v-if="!loadingInitialElements">
            <v-layout row wrap v-if="universityToken && validParameters">
              <v-flex lg6>
                <v-text-field v-model="university.country" prepend-icon="public" name="university_country" label="Country" type="text" disabled></v-text-field>
              </v-flex>
              <v-flex lg6>
                <v-text-field v-model="university.name" prepend-icon="school" name="university_name" label="University" type="text" disabled></v-text-field>
              </v-flex>
            </v-layout>

            <v-container v-if="!validParameters && universityToken">
              <v-alert value="true" type="error" dismissible transition="fade-transition" icon="warning">
                {{message}}
              </v-alert>
            </v-container>

            <v-form v-model="validationStatus" ref="form" v-if="validParameters">
              <v-layout row wrap v-if="!universityToken">
                <v-flex lg6>
                  <v-autocomplete :hint="loadingUniversities ? 'Loading universities...' : ''" v-on:input="loadUniversities" prepend-icon="public" :items="countries" v-model="country_id" label="Select a country"></v-autocomplete>
                </v-flex>
                <v-flex lg6>
                  <v-autocomplete :rules="universityRules" prepend-icon="school" :items="universities" :disabled="loadingUniversities" v-model="university_id" label="Select an university"></v-autocomplete>
                </v-flex>
              </v-layout>

              <v-layout row wrap>
                <v-flex lg6>
                  <v-text-field v-model="name" prepend-icon="edit" name="name" label="First name" type="text" :rules="nameRules"></v-text-field>
                  <v-text-field v-model="last_name" prepend-icon="edit" name="last_name" label="Last name" type="text" :rules="lastNameRules"></v-text-field>
                  <v-text-field @blur="test" v-model="postcode" prepend-icon="place" name="postcode" label="Postcode" :hint="loadingPostcodeInfo ? 'Loading postcode...' : 'Enter a postcode to lookup'" single-line id="postcode" type="text"></v-text-field>
                  <v-text-field v-model="address" prepend-icon="fas fa-map-signs" name="address" label="Address" id="address" type="text" :rules="addressRules"></v-text-field>
                </v-flex>
                <v-flex lg6>
                  <v-text-field v-model="email" prepend-icon="email" name="email" label="Email" id="email" type="email" :rules="emailRules"></v-text-field>
                  <v-text-field v-model="password" prepend-icon="lock" name="password" label="Password" id="password" :rules="passwordRules" :append-icon="e1 ? 'visibility' : 'visibility_off'" @click:append="() => (e1 = !e1)" :type="e1 ? 'password' : 'text'" hint="At least 6 characters" min="6"></v-text-field>
                  <v-text-field v-model="password_confirm" prepend-icon="lock" name="passwordConfirm" label="Password Confirmation" id="passwordConfirm" :rules="passwordConfirmRules" :append-icon="e1 ? 'visibility' : 'visibility_off'" @click:append="() => (e1 = !e1)" :type="e1 ? 'password' : 'text'" hint="Re-type your password"></v-text-field>
                </v-flex>
              </v-layout>
            </v-form>
          </v-card-text>

          <v-card-actions v-if="!loadingInitialElements && validParameters">
            <v-spacer></v-spacer>
            <v-tooltip bottom :color="validationColor">
              <v-btn v-on:click="submit" :disabled="loading" class="white--text" :class="{ red: !validationStatus, indigo: validationStatus }" slot="activator">
                <icon v-if="!loading && !validationStatus" name="times" style="color: white;"></icon>
                <icon v-if="!loading && validationStatus" name="check" style="color: white;"></icon>
                <icon v-if="loading" name="circle-notch" spin style="color: gray;"></icon>
                &nbsp;Submit
              </v-btn>
              <v-btn v-on:click="reset" class="white--text primary" slot="activator">
                <v-icon small>cancel</v-icon>&nbsp;Reset
              </v-btn>
              <span>{{validationMessage}}</span>
            </v-tooltip>
          </v-card-actions>

          <v-container v-if="alert">
            <v-alert v-model="alert" :value="true" :type="operationMessageType" dismissible transition="fade-transition" icon="warning">
              {{operationMessage}}
            </v-alert>
          </v-container>

          <v-layout row wrap>
            <v-flex xs12 sm12 md12 lg12>
              <v-container fluid>
                <span>Already have an account?</span><a><router-link to="/login" tag="span" style="cursor: pointer">&nbsp;Log in</router-link></a>
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
      universityToken: null,
      university: {},
      universities: [],
      country_id: [],
      university_id: null,
      countries: [],
      validParameters: false,
      validationStatus: false,
      e1: true,
      e2: false,
      e3: false,
      e4: false,
      alert: false,
      loading: false,
      loadingInitialElements: true,
      loadingUniversities: false,
      loadingPostcodeInfo: false,
      name: "",
      last_name: "",
      password: "",
      password_confirm: "",
      email: "",
      address: "",
      postcode: "",
      message: "",
      universityRules: [v => !!v || "This field is required"],
      nameRules: [v => !!v || "This field is required"],
      lastNameRules: [v => !!v || "This field is required"],
      passwordRules: [
        v => !!v || "This field is required",
        v => (v && v.length > 5) || "Password requires at least 6 characters"
      ],
      passwordConfirmRules: [
        v => !!v || "This field is required",
        v => v === this.password || "Passwords do not match"
      ],
      emailRules: [
        v => !!v || "E-mail is required",
        v =>
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v) ||
          "E-mail must be valid"
      ],
      addressRules: [v => !!v || "This field is required"],
      operationMessage: "Enter  your credentials",
      operationMessageType: "warning",
      activationUrl: null
    };
  },
  props: {
    source: String
  },
  created() {
    this.activationUrl = window.location.href.replace(this.$route.path, '/activate-account');
    this.universityToken = this.$route.params.university_token
      ? this.$route.params.university_token
      : null;
    if (this.universityToken) {
      this.getUniversity().then(data => {
        if (data.item.data) {
          this.university = data.item.data;
          this.university_id = this.university.id;
          this.validParameters = true;
        } else {
          this.message = data.item.msg;
        }
        this.loadingInitialElements = false;
      });
    } else {
      this.getCountries().then(data => {
        if (data.items.data) {
          this.countries = data.items.data;
          this.validParameters = true;
          this.loadingInitialElements = false;
        }
      });
    }
  },
  methods: {
    test() {
      console.log('Looking up postcode...');
    },
    loadUniversities() {
      this.getUniversities().then(data => {
        if (data.items.data) {
          this.universities = data.items.data;
          this.validParameters = true;
        }
      });
    },
    getUniversity() {
      this.loading = true;
      return new Promise((resolve, reject) => {
        var that = this;
        let config = {
          params: {
            XDEBUG_SESSION_START: "netbeans-xdebug",
            university_token: that.universityToken
          }
        };

        axios
          .get(this.$store.state.baseUrl + "get-university", config)
          .then(function(response) {
            let item = response.data;

            setTimeout(() => {
              that.loading = false;
              resolve({
                item
              });
            }, 1);
          })
          .catch(function(error) {
            let item = {};
            setTimeout(() => {
              that.loading = false;
              resolve({
                item
              });
            }, 10);
          });
      });
    },
    getCountries() {
      this.loadingInitialElements = true;
      return new Promise((resolve, reject) => {
        var that = this;
        let config = {
          params: {
            XDEBUG_SESSION_START: "netbeans-xdebug"
          }
        };

        axios
          .get(this.$store.state.baseUrl + "get-countries", config)
          .then(function(response) {
            let items = response.data;

            setTimeout(() => {
              resolve({
                items
              });
            }, 1);
          })
          .catch(function(error) {
            let items = {};
            setTimeout(() => {
              resolve({
                items
              });
            }, 10);
          });
      });
    },
    getUniversities() {
      this.loadingUniversities = true;
      return new Promise((resolve, reject) => {
        var that = this;
        let config = {
          params: {
            XDEBUG_SESSION_START: "netbeans-xdebug",
            country_id: this.country_id
          }
        };

        axios
          .get(this.$store.state.baseUrl + "get-universities", config)
          .then(function(response) {
            let items = response.data;

            setTimeout(() => {
              that.loadingUniversities = false;
              resolve({
                items
              });
            }, 1);
          })
          .catch(function(error) {
            let items = {};
            setTimeout(() => {
              that.loadingUniversities = false;
              resolve({
                items
              });
            }, 10);
          });
      });
    },
    submit() {
      if (this.$refs.form.validate()) {
        this.loading = true;
        var that = this;
        let config = {
          name: this.name,
          last_name: this.last_name,
          email: this.email,
          password: this.password,
          address: this.address,
          activation_url: this.activationUrl,
          university_id: this.university_id,
          form_url: this.$store.state.authRouteRequested
        };

        axios
          .post(
            this.$store.state.baseUrl +
              "signup?XDEBUG_SESSION_START=netbeans-xdebug",
            config
          )
          .then(function(response) {
            that.loading = false;
            that.operationMessageType = response.data.code;
            that.operationMessage = response.data.msg;
            that.alert = true;
          })
          .catch(function(error) {
            that.loading = false;
            that.operationMessage =
              "There was an error on the remote endpoint. Try again later.";
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
      return this.validationStatus ? "Good to go!" : "Incomplete data";
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
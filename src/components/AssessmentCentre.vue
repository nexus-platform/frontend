<template>
  <v-container style="margin-top: 60px;" class="animated fadeIn">
    <v-card class="pb-4">
      <v-layout row wrap mb-3>
        <v-flex xs12 sm8 offset-sm2 mt-4>
          <h3 class="primary--text" :class="loadingInitialElements ? 'uppercase' : ''"><v-icon v-if="!loadingInitialElements" color="primary">location_city</v-icon> {{ac.name}}</h3>
        </v-flex>
      </v-layout>
      <v-layout row v-if="loadingInitialElements" wrap mt-2>
        <v-flex xs12>
          <icon name="circle-notch" scale=2 spin style="color: gray;"></icon>
        </v-flex>
      </v-layout>
      <v-layout row v-else wrap class="text-xs-center">
        <v-flex xs12 v-if="ac.admin">
          <h3><v-icon color="primary">business_center</v-icon> <b>Manager:</b> {{ac.admin}}</h3>
        </v-flex>
        <v-flex xs12>
          <h3><v-icon color="primary">phone</v-icon> <b>Telephone:</b> {{ac.phone}}</h3>
        </v-flex>
        <v-flex xs12>
          <h3><v-icon color="primary">location_on</v-icon> <b>Address:</b> {{ac.address}}</h3>
        </v-flex>
      </v-layout>

      <template v-if="!loadingInitialElements">
        <template v-if="!ac.registered">
          <v-container pa-5>
            <v-form v-model="validationStatus" ref="form">
              <v-layout row wrap>
                <v-flex sm5 md5>
                  <v-text-field :disabled="!isGuest" v-model="ac.user_data.name" prepend-icon="edit" name="name" label="First name" type="text" :rules="nameRules"></v-text-field>
                  <v-text-field :disabled="!isGuest" v-model="ac.user_data.last_name" prepend-icon="edit" name="last_name" label="Last name" type="text" :rules="lastNameRules"></v-text-field>
                  <v-text-field :disabled="!isGuest" @blur="test" v-model="ac.user_data.postcode" prepend-icon="place" name="postcode" label="Postcode" :rules="postcodeRules" :hint="loadingPostcodeInfo ? 'Loading postcode...' : 'Enter a postcode to lookup'" type="text"></v-text-field>
                  <v-text-field :disabled="!isGuest" v-model="ac.user_data.address" prepend-icon="fas fa-map-signs" name="address" label="Address" id="address" type="text" :rules="addressRules"></v-text-field>
                </v-flex>
                <v-flex offset-sm2 sm5>
                  <v-text-field :disabled="!isGuest" v-model="ac.user_data.email" prepend-icon="email" name="email" label="Email" id="email" type="email" :rules="emailRules"></v-text-field>
                  <v-text-field :disabled="!isGuest" v-model="ac.user_data.password" prepend-icon="lock" name="password" label="Password" id="password" :rules="passwordRules" :append-icon="e1 ? 'visibility' : 'visibility_off'" @click:append="() => (e1 = !e1)" :type="e1 ? 'password' : 'text'" hint="At least 6 characters" min="6"></v-text-field>
                  <v-text-field :disabled="!isGuest" v-model="ac.user_data.password_confirm" prepend-icon="lock" name="passwordConfirm" label="Password Confirmation" id="passwordConfirm" :rules="passwordConfirmRules" :append-icon="e1 ? 'visibility' : 'visibility_off'" @click:append="() => (e1 = !e1)" :type="e1 ? 'password' : 'text'" hint="Re-type your password"></v-text-field>
                  <v-text-field :readonly="true" v-model="dsaLetterName" label="DSA Letter" :rules="dsaLetterRules" prepend-icon="attach_file" append-icon="folder" @click="uploadDialog = true" @click:append="() => (uploadDialog = true)" type="text" hint="Upload a copy of your DSA letter"></v-text-field>
                </v-flex>
              </v-layout>
              <v-layout row wrap mt-5>
                <v-flex xs12>
                  <v-tooltip bottom :color="validationColor">
                    <v-btn :disabled="loading" v-on:click="submit" class="white--text" :class="{ red: !validationStatus, indigo: validationStatus }" slot="activator">
                      <icon v-if="loading" name="circle-notch" spin class="gray--text"></icon>
                      <v-icon size="22" v-if="!loading && validationStatus">done</v-icon>
                      <v-icon size="22" v-if="!loading && !validationStatus">error_outline</v-icon>
                      &nbsp;Register with this Centre
                    </v-btn>
                    <span>{{validationMessage}}</span>
                  </v-tooltip>
                </v-flex>
              </v-layout>
            </v-form>
          </v-container>

          <v-dialog width="500" v-model="uploadDialog" persistent>
            <v-card>
              <v-card-title class="headline grey lighten-2">
                Upload file
                <v-spacer></v-spacer>
                <a @click="uploadDialog = false"><icon name="times" class="fa"></icon></a>
              </v-card-title>
              <v-container>
                <file-upload v-on:set-file="setDSALetter($event)"></file-upload>
              </v-container>
            </v-card>
          </v-dialog>
        </template>

        <template v-else-if="ac.registered && !ac.is_admin">
          <v-container>
            <v-layout row wrap>
              <v-flex sm5 md5>
                <v-btn color="error" @click="test()"><icon class="fa" name="times"></icon> Cancel Registration</v-btn>
              </v-flex>
              <v-flex offset-sm1 sm5>
                <v-text-field :readonly="true" v-model="dsaLetterName" label="DSA Letter" :rules="dsaLetterRules" prepend-icon="attach_file" append-icon="folder" @click="uploadDialog = true" @click:append="() => (uploadDialog = true)" type="text" hint="Upload a copy of your DSA letter"></v-text-field>
              </v-flex>
            </v-layout>
          </v-container>
        </template>

        <template v-else-if="ac.registered && ac.is_admin">
          <v-container>
            <v-layout row wrap>
              <v-flex>
                <v-btn color="primary" @click="test()"><icon class="fa" name="envelope"></icon> Invite users</v-btn>
              </v-flex>
            </v-layout>
          </v-container>
        </template>
        
      </template>

      <v-snackbar :timeout="5000" :bottom="true" :right="true" v-model="snackbar" :color="operationMessageType">
        <icon class="fa" name="info-circle"></icon> {{ operationMessage }}
        <v-btn flat @click.native="snackbar = false"><icon name="times"></icon></v-btn>
      </v-snackbar>

    </v-card>
	</v-container>
</template>

<script>
import axios from "axios";
import FileUpload from "@/components/FileUpload";

export default {
  data() {
    return {
      e1: true,
      uploadDialog: false,
      validationStatus: false,
      loadingInitialElements: true,
      acSlug: null,
      acAction: null,
      snackbar: false,
      loading: false,
      loadingPostcodeInfo: false,
      nameRules: [v => !!v || "This field is required"],
      lastNameRules: [v => !!v || "This field is required"],
      dsaLetterRules: [v => !!v || "This field is required"],
      passwordRules: [
        v => !!v || "This field is required",
        v => (v && v.length > 5) || "Password requires at least 6 characters"
      ],
      passwordConfirmRules: [
        v => !!v || "This field is required",
        v => v === this.ac.user_data.password || "Passwords do not match"
      ],
      emailRules: [
        v => !!v || "E-mail is required",
        v =>
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v) ||
          "E-mail must be valid"
      ],
      postcodeRules: [v => !!v || "This field is required"],
      addressRules: [v => !!v || "This field is required"],
      operationMessage: "Enter your credentials",
      operationMessageType: "warning",
      dsaLetterName: "",
      ac: {
        id: null,
        name: "Loading Assessment Centre information",
        address: null,
        phone: null,
        admin: null
      }
    };
  },
  created() {
    this.activationUrl = window.location.href.replace(
      this.$route.path,
      "/activate-account"
    );
    this.setInitialData();
  },
  components: { FileUpload },
  computed: {
    isGuest() {
      return this.$store.state.payload.is_guest;
    },
    validationMessage: function() {
      return this.validationStatus ? "Good to go!" : "The form is incomplete";
    },
    validationColor: function() {
      return this.validationStatus ? "indigo" : "red";
    }
  },
  methods: {
    setInitialData() {
      this.acSlug = this.$route.params.slug;
      this.acAction = this.$route.params.action
        ? this.$route.params.action
        : "index";
      this.getAC().then(data => {
        if (data.item.data) {
          this.ac = data.item.data;
          if (this.ac.registered && this.acAction === "signup") {
            this.$router.push("/assessment-centre/" + this.acSlug);
          } else if (!this.ac.registered && this.acAction === "index") {
            this.$router.push("/assessment-centre/" + this.acSlug + "/signup");
          } else {
          }
        } else {
          this.$router.push("/not-found");
        }
        this.loadingInitialElements = false;
      });
    },
    setDSALetter(event) {
      this.ac.user_data.dsa_letter = event;
      if (event) {
        this.dsaLetterName = event.name;
        this.uploadDialog = false;
      } else {
        this.dsaLetterName = "";
      }
    },
    submit() {
      if (this.$refs.form.validate()) {
        this.loading = true;
        var requestConfig = {
          headers: {
            Authorization: "Bearer " + this.$store.state.payload.jwt,
            "Content-Type": "multipart/form-data"
          }
        };
        var formData = new FormData();
        formData.append("dsa_letter", this.ac.user_data.dsa_letter);
        formData.append("ac", JSON.stringify(this.ac));
        formData.append("url", this.activationUrl);

        var that = this;
        axios
          .post(
            this.$store.state.baseUrl +
              "register-with-ac?XDEBUG_SESSION_START=netbeans-xdebug",
            formData,
            requestConfig
          )
          .then(function(response) {
            that.loading = false;
            that.operationMessage = response.data.msg;
            that.operationMessageType = response.data.code;
            that.snackbar = true;
            if (response.data.code === "success") {
              that.ac.registered = true;
              if (that.isGuest) {
                that.$store.state.authRouteRequested =
                  "/assessment-centre/" + that.acSlug;
                setTimeout(function() {
                  that.$router.push("/login");
                }, 5000);
              } else {
                that.$router.push("/assessment-centre/" + that.acSlug);
              }
            }
          })
          .catch(function(error) {
            that.loading = false;
            that.operationMessage =
              "There was an error on the remote endpoint. Try again later.";
            that.operationMessageType = "error";
            that.snackbar = true;
          });
      }
    },
    test() {
      console.log("Test");
    },
    getAC() {
      return new Promise((resolve, reject) => {
        var requestConfig = {
          headers: {
            Authorization: "Bearer " + this.$store.state.payload.jwt
          },
          params: {
            slug: this.acSlug,
            XDEBUG_SESSION_START: "netbeans-xdebug"
          }
        };
        axios
          .get(this.$store.state.baseUrl + "get-ac-info", requestConfig)
          .then(function(response) {
            let item = response.data;
            resolve({
              item
            });
          })
          .catch(function(error) {
            let item = {};
            resolve({
              item
            });
          });
      });
    }
  }
};
</script>
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
            <v-layout row wrap>
              <v-flex sm5 md5>
                <v-text-field :disabled="!isGuest" v-model="ac.user_data.name" prepend-icon="edit" name="name" label="First name" type="text" :rules="nameRules"></v-text-field>
                <v-text-field :disabled="!isGuest" v-model="ac.user_data.last_name" prepend-icon="edit" name="last_name" label="Last name" type="text" :rules="lastNameRules"></v-text-field>
                <v-text-field :disabled="!isGuest" @blur="test" v-model="ac.user_data.postcode" prepend-icon="place" name="postcode" label="Postcode" :hint="loadingPostcodeInfo ? 'Loading postcode...' : 'Enter a postcode to lookup'" single-line id="postcode" type="text"></v-text-field>
                <v-text-field :disabled="!isGuest" v-model="ac.user_data.address" prepend-icon="fas fa-map-signs" name="address" label="Address" id="address" type="text" :rules="addressRules"></v-text-field>
              </v-flex>
              <v-flex offset-sm2 sm5 offset-md2 md5>
                <v-text-field :disabled="!isGuest" v-model="ac.user_data.email" prepend-icon="email" name="email" label="Email" id="email" type="email" :rules="emailRules"></v-text-field>
                <v-text-field :disabled="!isGuest" v-model="ac.user_data.password" prepend-icon="lock" name="password" label="Password" id="password" :rules="passwordRules" :append-icon="e1 ? 'visibility' : 'visibility_off'" @click:append="() => (e1 = !e1)" :type="e1 ? 'password' : 'text'" hint="At least 6 characters" min="6"></v-text-field>
                <v-text-field :disabled="!isGuest" v-model="ac.user_data.password_confirm" prepend-icon="lock" name="passwordConfirm" label="Password Confirmation" id="passwordConfirm" :rules="passwordConfirmRules" :append-icon="e1 ? 'visibility' : 'visibility_off'" @click:append="() => (e1 = !e1)" :type="e1 ? 'password' : 'text'" hint="Re-type your password"></v-text-field>
                <file-select v-on:file-changed="setDSALetter($event)"></file-select>
              </v-flex>
            </v-layout>
          </v-container>
        </template>

      </template>

    </v-card>
	</v-container>
</template>

<script>
import axios from "axios";
import FileSelect from "@/components/FileSelect";

export default {
  data() {
    return {
      e1: true,
      loadingInitialElements: true,
      acSlug: null,
      apiUrl: null,
      acAction: null,
      loadingPostcodeInfo: false,
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
    this.apiUrl =
      this.$store.state.baseUrl +
      "send-dsa-form-comment?XDEBUG_SESSION_START=netbeans-xdebug";
    this.setInitialData();
  },
  components: { FileSelect },
  computed: {
    isGuest() {
      return this.$store.state.payload.is_guest;
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
      console.log('Yea');
    },
    test() {
      console.log("Test");
    },
    getAC() {
      this.loading = true;
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
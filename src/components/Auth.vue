<template>
  <v-flex xs12>
    <v-layout justify-center class="animated fadeIn">
      <v-flex md10>
        <v-toolbar tabs color="indigo">
          <v-toolbar-title class="white--text">
            <v-icon class="white--text">school</v-icon>
            {{ parentName }}
          </v-toolbar-title>
        </v-toolbar>
        <v-card>
          <v-tabs v-model="activeTab" centered color="transparent" icons-and-text>
            <v-tabs-slider color="indigo"></v-tabs-slider>
            <v-tab @click="redirect('login')" href="#tab-login">
              Log in
              <v-icon>verified_user</v-icon>
            </v-tab>
            <v-tab v-if="target !== 'public'" @click="redirect('signup')" href="#tab-signup">
              Sign up
              <v-icon>account_circle</v-icon>
            </v-tab>
            <v-tab @click="redirect('reset-password')" href="#tab-reset-password">
              Reset password
              <v-icon>email</v-icon>
            </v-tab>

            <v-tab-item value="tab-login">
              <v-layout align-center justify-center>
                <v-flex md6 mt-3>
                  <v-card-text>
                    <v-form v-model="loginValidationStatus" ref="loginForm">
                      <v-layout row>
                        <v-flex lg12>
                          <v-text-field
                            validate-on-blur
                            @keyup.enter="login()"
                            v-model="email"
                            prepend-icon="mail"
                            name="email"
                            label="Email"
                            type="text"
                            required
                            :rules="emailRules"
                            hint="Enter your registered email address"
                          ></v-text-field>
                          <v-text-field
                            ref="loginPassword"
                            @keyup.enter="login()"
                            @input="showCapsLockMsg($event)"
                            v-model="password"
                            prepend-icon="lock"
                            name="password"
                            label="Password"
                            type="password"
                            required
                            :rules="passwordRules"
                            hint="Enter your password"
                          ></v-text-field>
                        </v-flex>
                      </v-layout>
                    </v-form>
                  </v-card-text>
                  <v-card-actions class="pb-5">
                    <v-spacer></v-spacer>
                    <v-tooltip bottom :color="loginValidationColor">
                      <v-btn
                        :disabled="loading"
                        v-on:click="login()"
                        class="white--text mr-3"
                        :class="{ red: !loginValidationStatus, indigo: loginValidationStatus }"
                        slot="activator"
                      >
                        <v-progress-circular
                          v-if="loading"
                          :width="2"
                          size="18"
                          indeterminate
                          class="gray--text fa"
                        ></v-progress-circular>
                        <v-icon size="22" v-if="!loading && loginValidationStatus">done</v-icon>
                        <v-icon size="22" v-if="!loading && !loginValidationStatus">error_outline</v-icon>&nbsp;Log in
                      </v-btn>
                      <span>{{loginValidationMessage}}</span>
                    </v-tooltip>
                  </v-card-actions>
                </v-flex>
              </v-layout>
            </v-tab-item>

            <v-tab-item value="tab-signup" v-if="target !== 'public'">
              <v-layout justify-center>
                <v-flex xs10 mt-3>
                  <v-card-text>
                    <v-form v-model="signupValidationStatus" ref="signupForm">
                      <v-layout row wrap>
                        <v-flex sm12 md11 lg6>
                          <v-text-field
                            v-model="name"
                            prepend-icon="edit"
                            name="name"
                            label="First name"
                            type="text"
                            :rules="nameRules"
                          ></v-text-field>
                          <v-text-field
                            v-model="last_name"
                            prepend-icon="edit"
                            name="last_name"
                            label="Last name"
                            type="text"
                            :rules="lastNameRules"
                          ></v-text-field>
                          <v-text-field
                            v-model="password"
                            prepend-icon="lock"
                            name="password"
                            label="Password"
                            :rules="passwordRules"
                            :append-icon="e1 ? 'visibility' : 'visibility_off'"
                            @click:append="() => (e1 = !e1)"
                            :type="e1 ? 'password' : 'text'"
                            hint="At least 6 characters"
                            min="6"
                          ></v-text-field>
                          <v-text-field
                            v-model="password_confirm"
                            prepend-icon="lock"
                            name="passwordConfirm"
                            label="Password Confirmation"
                            :rules="passwordConfirmRules"
                            :append-icon="e2 ? 'visibility' : 'visibility_off'"
                            @click:append="() => (e2 = !e2)"
                            :type="e2 ? 'password' : 'text'"
                            hint="Re-type your password"
                          ></v-text-field>
                        </v-flex>
                        <v-flex sm12 md11 lg6>
                          <v-text-field
                            :disabled="emailDisabled"
                            validate-on-blur
                            v-model="email"
                            prepend-icon="email"
                            name="email"
                            label="Email"
                            type="email"
                            :rules="emailRules"
                          ></v-text-field>
                          <v-text-field
                            v-model="telephone"
                            prepend-icon="phone"
                            name="telephone"
                            label="Telephone"
                            single-line
                            type="text"
                          ></v-text-field>
                          <v-text-field
                            @blur="test()"
                            v-model="postcode"
                            prepend-icon="place"
                            name="postcode"
                            label="Postcode"
                            :hint="loadingPostcodeInfo ? 'Loading postcode...' : 'Enter a postcode to lookup'"
                            single-line
                            type="text"
                          ></v-text-field>
                          <v-text-field
                            v-model="address"
                            prepend-icon="fas fa-map-signs"
                            name="address"
                            label="Address"
                            type="text"
                            :rules="addressRules"
                          ></v-text-field>
                        </v-flex>
                      </v-layout>
                    </v-form>
                  </v-card-text>

                  <v-card-actions class="pb-5">
                    <v-spacer></v-spacer>
                    <v-tooltip bottom :color="signupValidationColor">
                      <v-btn
                        @click="signup()"
                        :disabled="loading"
                        class="white--text mr-3"
                        :class="{ red: !signupValidationStatus, indigo: signupValidationStatus }"
                        slot="activator"
                      >
                        <v-icon size="22" v-if="!loading && signupValidationStatus">done</v-icon>
                        <v-icon size="22" v-if="!loading && !signupValidationStatus">error_outline</v-icon>
                        <v-progress-circular
                          v-if="loading"
                          :width="2"
                          size="18"
                          indeterminate
                          class="gray--text fa"
                        ></v-progress-circular>Sign up
                      </v-btn>
                      <span>{{signupValidationMessage}}</span>
                    </v-tooltip>
                    <v-btn
                      @click="resetSignupForm()"
                      class="white--text warning ml-2 mr-3"
                      slot="activator"
                    >
                      <v-icon class="fa" size="22">cancel</v-icon>Reset
                    </v-btn>
                  </v-card-actions>
                </v-flex>
              </v-layout>
            </v-tab-item>

            <v-tab-item value="tab-reset-password">
              <v-layout align-center justify-center row>
                <v-flex xs6 mt-3>
                  <v-card-text>
                    <v-form v-model="resetPasswordValidationStatus" ref="resetPasswordForm">
                      <v-layout row>
                        <v-flex lg12>
                          <v-text-field
                            v-model="email"
                            ref="resetPasswordEmail"
                            @keyup.enter="requestPasswordReset()"
                            validate-on-blur
                            prepend-icon="email"
                            name="email"
                            label="Email"
                            type="email"
                            :rules="emailRules"
                          ></v-text-field>
                        </v-flex>
                      </v-layout>
                    </v-form>
                  </v-card-text>
                  <v-card-actions class="pb-5">
                    <v-spacer></v-spacer>
                    <v-tooltip bottom :color="resetPasswordValidationColor">
                      <v-btn
                        :disabled="loading"
                        v-on:click="requestPasswordReset()"
                        class="white--text mr-3"
                        :class="{ red: !resetPasswordValidationStatus, indigo: resetPasswordValidationStatus }"
                        slot="activator"
                      >
                        <v-progress-circular
                          v-if="loading"
                          :width="2"
                          size="18"
                          indeterminate
                          class="gray--text fa"
                        ></v-progress-circular>
                        <v-icon size="22" v-if="!loading && resetPasswordValidationStatus">done</v-icon>
                        <v-icon
                          size="22"
                          v-if="!loading && !resetPasswordValidationStatus"
                        >error_outline</v-icon>&nbsp;Send request
                      </v-btn>
                      <span>{{resetPasswordValidationMessage}}</span>
                    </v-tooltip>
                  </v-card-actions>
                </v-flex>
              </v-layout>
            </v-tab-item>
          </v-tabs>
        </v-card>
      </v-flex>
    </v-layout>

    <AxiosComponent ref="axios" v-on:finish="handleHttpResponse($event)"/>
  </v-flex>
</template>

<script>

export default {
  data() {
    return {
      e1: true,
      e2: true,
      capsLockAlert: false,
      loading: false,
      loadingPostcodeInfo: false,
      operationMessage: null,
      operationMessageType: null,
      name: "",
      last_name: "",
      password: "",
      password_confirm: "",
      email: "",
      telephone: "",
      address: "",
      postcode: "",
      loginValidationStatus: false,
      signupValidationStatus: false,
      resetPasswordValidationStatus: false,
      nameRules: [v => !!v || "This field is required"],
      lastNameRules: [v => !!v || "This field is required"],
      passwordRules: [
        v => !!v || "This field is required"
        //v => (v && v.length > 5) || "Password requires at least 6 characters"
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
      activeTab: null,
      emailDisabled: false
    };
  },
  props: [
    "parentName",
    "apiUrls",
    "slug",
    "currTab",
    "target",
    "emailProp",
    "invitationToken"
  ],
  mounted() {
    this.activeTab = this.currTab;
    if (this.emailProp) {
      this.email = this.emailProp;
      this.emailDisabled = true;
    }
  },
  methods: {
    redirect(action) {
      this.$router.push(`${this.$store.getters.getHomeUrl}/${action}`)
    },
    handleHttpResponse(event) {
      this.loading = false;
      if (event.data.result.code !== 500) {
        var response = event.data.result.response;
        this.$emit("finish", event);
      } else {
        alert(event.data.result.response.message);
      }
    },
    showCapsLockMsg(e) {
      var lastChar = e.substring(e.length - 1);
      this.capsLockAlert =
        lastChar.toUpperCase() === lastChar &&
        lastChar.toLowerCase() !== lastChar;
    },
    login() {
      if (this.$refs.loginForm.validate()) {
        this.loading = true;

        var config = {
          url: this.apiUrls.login,
          method: "post",
          params: {
            slug: this.slug,
            email: this.email,
            password: this.password,
            target: this.target
          }
        };
        this.$refs.axios.submit(config);
      }
    },
    signup() {
      if (this.$refs.signupForm.validate()) {
        this.loading = true;
        var activationUrl = window.location.href.replace(
          this.$route.path,
          "/activate-account"
        );
        var homeUrl = window.location.href.replace(
          this.$route.path,
          `${this.$store.getters.getHomeUrl}/index`
        );
        var config = {
          url: this.apiUrls.signup,
          method: "post",
          params: {
            name: this.name,
            last_name: this.last_name,
            email: this.email,
            telephone: this.telephone,
            password: this.password,
            address: this.address,
            postcode: this.postcode,
            activation_url: activationUrl,
            home_url: homeUrl,
            slug: this.slug,
            redirect_url: this.$store.getters.getAuthRouteRequested
              ? this.$store.getters.getAuthRouteRequested
              : homeUrl,
            target: this.target,
            invitation_token: this.invitationToken
          }
        };
        this.$refs.axios.submit(config);
      }
    },
    requestPasswordReset() {
      if (this.$refs.resetPasswordForm.validate()) {
        this.loading = true;
        var activationUrl = window.location.href.replace(
          this.$route.path,
          "/reset-password"
        );
        var config = {
          url: this.apiUrls.resetPassword,
          method: "post",
          params: {
            email: this.email,
            activation_url: activationUrl,
            home_url: window.location.href.replace(
              this.$route.path,
              this.$store.getters.getHomeUrl
            )
          }
        };
        this.$refs.axios.submit(config);
      }
    },
    resetSignupForm() {
      this.$refs.signupForm.reset();
    },
    test() {
      console.log("Looking up postcode...");
    }
  },
  computed: {
    loginValidationMessage: function() {
      return this.loginValidationStatus
        ? "Good to go!"
        : "Verify your information";
    },
    loginValidationColor: function() {
      return this.loginValidationStatus ? "indigo" : "red";
    },
    signupValidationMessage: function() {
      return this.signupValidationStatus ? "Good to go!" : "Verify your data";
    },
    signupValidationColor: function() {
      return this.signupValidationStatus ? "indigo" : "red";
    },
    resetPasswordValidationMessage: function() {
      return this.resetPasswordValidationStatus
        ? "Good to go!"
        : "Verify your data";
    },
    resetPasswordValidationColor: function() {
      return this.resetPasswordValidationStatus ? "indigo" : "red";
    }
  }
};
</script>
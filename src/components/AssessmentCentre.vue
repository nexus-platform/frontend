<template>
  <v-container fluid mt-5 class="animated fadeIn">
    <template v-if="loadingInitialElements">
      <v-layout row wrap mt-4>
        <v-flex xs12 sm8 offset-sm2>
          <h3 class="primary--text" :class="loadingInitialElements ? 'uppercase' : ''">
            <v-icon v-if="!loadingInitialElements" color="primary">location_city</v-icon>
            {{ac.settings.name}}
          </h3>
        </v-flex>
        <v-flex xs12 mt-3>
          <v-progress-circular indeterminate color="blue-grey"></v-progress-circular>
        </v-flex>
      </v-layout>
    </template>

    <template v-else>
      <template v-if="validParams">
        <!--Anonymous user-->
        <template v-if="isGuest">
          <auth-component
            ref="auth"
            v-on:finish="handleHttpResponse($event)"
            target="ac"
            :invitationToken="invitationToken"
            :emailProp="ac.user_data.email"
            :currTab="currTab"
            :parentName="ac.name"
            :apiUrls="apiUrls"
            :slug="acSlug"
          />
        </template>

        <!--Authenticated user-->
        <template v-else>
          <template v-if="acAction === 'booking'">
            <!--The user has submitted the form-->
            <template v-if="ac.user_data.ac_form_full_submit">
              <!--Booking enabled for user-->
              <template v-if="ac.user_data.ac_booking_enabled">
                <v-layout v-if="loadingEA" row wrap mt-4>
                  <v-flex xs12 sm10 offset-sm1>
                    <h3 class="primary--text uppercase">Loading Information</h3>
                  </v-flex>
                  <v-flex xs12 mt-3>
                    <v-progress-circular indeterminate color="blue-grey"></v-progress-circular>
                  </v-flex>
                </v-layout>
                <v-layout row wrap mt-4>
                  <iframe-component :eaUrl="eaUrl"/>
                </v-layout>
              </template>

              <!--Booking needs to be authorized-->
              <template v-else>
                <v-layout row wrap mt-3 class="animated fadeIn">
                  <v-flex md6 offset-md3>
                    <v-toolbar tabs color="indigo">
                      <v-toolbar-title class="white--text">
                        <v-icon class="white--text fa">school</v-icon>
                        {{ ac.name }}
                      </v-toolbar-title>
                    </v-toolbar>
                    <v-card>
                      <v-card-text>
                        <h3>Your request form has been successfully submitted.
                          <br>You'll be notified when the Manager approves or denies it.
                        </h3>
                      </v-card-text>
                    </v-card>
                  </v-flex>
                </v-layout>
              </template>
            </template>

            <!--The user needs to submit the form-->
            <template v-else>
              <v-container>
                <v-layout row wrap>
                  <v-flex sm12>
                    <v-card-text>
                      <h3
                        class="uppercase"
                      >You need to submit this Assessment Form before booking an appointment</h3>
                    </v-card-text>
                  </v-flex>
                </v-layout>

                <template v-if="ac.user_data.ac_form">
                  <v-layout row wrap>
                    <v-flex sm12>
                      <v-card-text>
                        <h3>You have an unfinished form.
                          <br>How do you want to proceed?
                        </h3>
                      </v-card-text>
                    </v-flex>
                    <v-flex sm12>
                      <v-btn @click="showAcForm('resume')" small color="info">
                        <v-icon small class="fa">refresh</v-icon>Resume it
                      </v-btn>
                      <v-btn @click="showAcForm('new')" small color="error">
                        <v-icon small class="fa">new_releases</v-icon>Start a new one
                      </v-btn>
                    </v-flex>
                  </v-layout>
                </template>

                <template v-else>
                  <v-layout row wrap>
                    <v-flex sm12>
                      <v-alert
                        :value="acFormErrors.length > 0"
                        type="error"
                        transition="scale-transition"
                      >
                        <h4>Your form contains the following errors:</h4>
                        <div
                          v-for="(acError, acErrorIndex) in acFormErrors"
                          :key="`acError-${acErrorIndex}`"
                        >
                          <a
                            class="white--text"
                            @click="setActiveTab(acError.tab)"
                            v-html="acError.error"
                          ></a>
                        </div>
                      </v-alert>
                    </v-flex>
                  </v-layout>

                  <v-form v-model="validationStatus" ref="acForm">
                    <v-layout row wrap>
                      <v-flex sm12>
                        <v-card class="animated fadeIn">
                          <v-tabs
                            color="blue-grey darken-3"
                            v-model="active"
                            centered
                            icons-and-text
                            dark
                            slider-color="yellow"
                          >
                            <v-tab
                              :disabled="loading"
                              @click="submitACForm(false, i)"
                              v-for="(item, i) in items"
                              :key="i + 1"
                              ripple
                            >
                              <span class="hidden-xs-only non-uppercase">{{item.title}}</span>
                              <span class="hidden-sm-and-up">{{i + 1}}</span>
                              <v-tooltip v-if="tabComplete(i) === 2" top color="success">
                                <v-icon slot="activator" color="success">check_circle</v-icon>
                                <span>No empty fields</span>
                              </v-tooltip>
                              <v-tooltip v-else-if="tabComplete(i) === 1" top color="warning">
                                <v-icon slot="activator" color="warning">warning</v-icon>
                                <span>{{missingFields(i)}} empty field(s)</span>
                              </v-tooltip>
                              <v-tooltip v-else top color="error">
                                <v-icon slot="activator" color="error">warning</v-icon>
                                <span>{{missingFields(i)}} empty field(s)</span>
                              </v-tooltip>
                            </v-tab>

                            <v-tab-item
                              v-for="(item, i) in items"
                              :key="i + 1"
                              :id="'tab-' + (i + 1)"
                            >
                              <v-card flat>
                                <div class="text-xs-justify padding-20">
                                  <p class="header-title hidden-sm-and-up">{{item.title}}</p>
                                  <v-layout row wrap v-for="(row) in item.components" :key="row.id">
                                    <v-flex
                                      v-for="(col) in row"
                                      :key="col.id"
                                      xs12
                                      :md1="col.class === 'md1'"
                                      :md2="col.class === 'md2'"
                                      :md3="col.class === 'md3'"
                                      :md4="col.class === 'md4'"
                                      :md5="col.class === 'md5'"
                                      :md6="col.class === 'md6'"
                                      :md7="col.class === 'md7'"
                                      :md8="col.class === 'md8'"
                                      :md9="col.class === 'md9'"
                                      :md10="col.class === 'md10'"
                                      :md11="col.class === 'md11'"
                                      :md12="col.class === 'md12'"
                                    >
                                      <template v-if="col.content_type === 'html'">
                                        <p v-html="col.html"></p>
                                      </template>

                                      <template v-else>
                                        <template
                                          v-if="(col.input.type === 'text' || col.input.type === 'number' || col.input.type === 'double') && col.input.max_length <= 255"
                                        >
                                          <v-text-field
                                            outline
                                            :background-color="col.input.has_error ? 'error' : 'default'"
                                            :type="col.input.type === 'number' ? 'number' : 'text'"
                                            :readonly="col.input.read_only"
                                            :required="col.input.required"
                                            :disabled="col.input.disabled"
                                            v-model="col.input.value"
                                            :hint="col.input.title"
                                            :label="col.input.title + (col.input.required ? ' (*)' : '')"
                                            :maxlength="col.input.max_length"
                                          ></v-text-field>
                                        </template>

                                        <template v-else-if="col.input.max_length > 255">
                                          <v-textarea
                                            outline
                                            :background-color="col.input.has_error ? 'error' : 'default'"
                                            v-if="(col.input.type === 'text' || col.input.type === 'number' || col.input.type === 'double') && col.input.max_length > 255"
                                            :readonly="col.input.read_only"
                                            :required="col.input.required"
                                            :disabled="col.input.disabled"
                                            v-model="col.input.value"
                                            :hint="col.input.title"
                                            :label="col.input.title + (col.input.required ? ' (*)' : '')"
                                            :maxlength="col.input.max_length"
                                            :rows="col.input.rows"
                                          ></v-textarea>
                                        </template>

                                        <template
                                          v-else-if="col.input.type === 'date' || col.input.type === 'month'"
                                        >
                                          <v-menu
                                            :disabled="col.input.read_only"
                                            v-model="col.input.modal"
                                            :close-on-content-click="false"
                                            :nudge-right="40"
                                            :return-value.sync="date"
                                            lazy
                                            transition="scale-transition"
                                            full-width
                                            min-width="290px"
                                          >
                                            <v-text-field
                                              outline
                                              :background-color="col.input.has_error ? 'error' : 'default'"
                                              :required="col.input.required"
                                              :disabled="col.input.disabled"
                                              :hint="col.input.title"
                                              slot="activator"
                                              v-model="col.input.value"
                                              :label="col.input.title + (col.input.required ? ' (*)' : '')"
                                              readonly
                                            ></v-text-field>
                                            <v-date-picker
                                              v-if="!col.input.disabled"
                                              no-title
                                              :show-current="true"
                                              :disabled="col.input.disabled"
                                              :readonly="col.input.read_only"
                                              v-model="col.input.value"
                                              :type="col.input.type"
                                            >
                                              <v-spacer></v-spacer>
                                              <v-btn
                                                flat
                                                color="primary"
                                                @click="col.input.modal = !col.input.modal"
                                              >OK</v-btn>
                                            </v-date-picker>
                                          </v-menu>
                                        </template>

                                        <template v-else-if="col.input.type === 'checkbox'">
                                          <v-checkbox
                                            :background-color="col.input.has_error ? 'error' : 'default'"
                                            v-model="col.input.value"
                                            :label="col.input.title"
                                            :hint="col.input.title"
                                          ></v-checkbox>
                                        </template>

                                        <template v-if="col.input.type === 'radio_group'">
                                          <p v-html="col.input.title" style="width: 100%"></p>
                                          <v-radio-group v-model="col.input.value">
                                            <v-radio
                                              v-for="l in col.input.options"
                                              :key="l"
                                              :label="l"
                                              :value="l"
                                            ></v-radio>
                                          </v-radio-group>
                                        </template>
                                      </template>
                                    </v-flex>
                                  </v-layout>
                                </div>
                              </v-card>
                            </v-tab-item>
                          </v-tabs>

                          <v-tooltip bottom color="black">
                            <v-btn
                              slot="activator"
                              color="blue-grey darken-3"
                              :disabled="loading"
                              class="mb-5 white--text"
                              @click="previousTab()"
                            >
                              <v-icon>chevron_left</v-icon>
                            </v-btn>
                            <span>Previous tab</span>
                          </v-tooltip>

                          <v-tooltip bottom color="black">
                            <v-btn
                              slot="activator"
                              color="blue-grey darken-3"
                              :disabled="loading"
                              class="mb-5 white--text"
                              @click="nextTab()"
                            >
                              <v-icon>chevron_right</v-icon>
                            </v-btn>
                            <span>Next tab</span>
                          </v-tooltip>
                        </v-card>
                      </v-flex>
                    </v-layout>
                    <v-layout row wrap>
                      <v-flex sm4 offset-sm4 mt-3>
                        <v-tooltip bottom color="black">
                          <v-text-field
                            slot="activator"
                            :readonly="true"
                            v-model="dsaLetterName"
                            label="DSA Letter"
                            :rules="dsaLetterRules"
                            prepend-icon="attach_file"
                            append-icon="folder"
                            @click="uploadDlg = true"
                            @click:append="() => (uploadDlg = true)"
                            type="text"
                            hint="Upload a copy of your DSA letter"
                          ></v-text-field>
                          <span>Attach a copy of your DSA Letter</span>
                        </v-tooltip>
                      </v-flex>
                      <v-flex sm4 offset-sm4 mt-3>
                        <v-btn
                          :disabled="loading"
                          large
                          v-on:click="submitACForm(true, active)"
                          class="white--text indigo full-width"
                          slot="activator"
                        >
                          <icon v-if="loading" name="circle-notch" spin class="fa gray--text"></icon>
                          <v-icon v-else class="fa" size="22">done</v-icon>Submit form
                        </v-btn>
                      </v-flex>
                    </v-layout>
                  </v-form>
                </template>
              </v-container>

              <v-dialog width="500" v-model="uploadDlg" persistent>
                <v-card>
                  <v-card-title class="headline grey lighten-2">Upload file
                    <v-spacer></v-spacer>
                    <a @click="uploadDlg = false">
                      <icon name="times" class="fa"></icon>
                    </a>
                  </v-card-title>
                  <v-container>
                    <file-upload v-on:set-file="setDSALetter($event)"></file-upload>
                  </v-container>
                </v-card>
              </v-dialog>
            </template>
          </template>

          <template v-else-if="acAction === 'ac-forms'">
            <v-layout row wrap mt-4>
              <v-flex sm10 offset-sm1>
                <!--Viewing a specific form-->
                <template v-if="userToken !== 'booking'">
                  <v-card-text v-if="loadingSubmittedForm">
                    <v-progress-circular indeterminate color="blue-grey"></v-progress-circular>
                  </v-card-text>
                  <ac-submitted-form v-else :items="acSubmittedFormItems"></ac-submitted-form>
                </template>

                <!--Viewing all forms-->
                <template v-else>
                  <v-card>
                    <ac-submitted-forms
                      :slug="acSlug"
                      v-on:show-ac-submitted-form="showACSubmittedForm($event)"
                    ></ac-submitted-forms>
                  </v-card>
                </template>
              </v-flex>
            </v-layout>
          </template>
        </template>
      </template>

      <template v-else>
        <v-container fluid>
          <v-layout align-center justify-center class="animated fadeIn">
            <v-flex md10>
              <v-toolbar tabs :color="operationMessageType">
                <v-toolbar-title class="white--text">
                  <v-icon class="white--text fa">warning</v-icon>Oops!
                </v-toolbar-title>
              </v-toolbar>
              <v-card>
                <v-card-text>
                  <h3 v-html="operationMessage"></h3>
                </v-card-text>
              </v-card>
            </v-flex>
          </v-layout>
        </v-container>
      </template>
    </template>

    <v-snackbar
      :timeout="5000"
      :bottom="true"
      :right="true"
      v-model="snackbar"
      :color="operationMessageType"
    >
      <icon class="fa" name="info-circle"></icon>
      {{ operationMessage }}
      <v-btn flat @click.native="snackbar = false">
        <icon name="times"></icon>
      </v-btn>
    </v-snackbar>

    <axios-component ref="axios" v-on:finish="handleHttpResponse($event)"/>
  </v-container>
</template>

<script>
import FileUpload from "@/components/FileUpload";
import axios from "axios";
import AxiosComponent from "@/components/AxiosComponent";
import moment from "moment";
import Vue from "vue";
import CameraCapture from "@/components/CameraCapture";
import SignaturePad from "@/components/SignaturePad";
import SignatureUpload from "@/components/SignatureUpload";
import VueQrcode from "@xkeshi/vue-qrcode";
import AuthComponent from "@/components/AuthComponent";
import AcceptInvitation from "@/components/AcceptInvitation";
import AcSubmittedForms from "@/components/ACSubmittedForms";
import AcSubmittedForm from "@/components/ACSubmittedForm";
import IframeComponent from "@/components/IframeComponent";

export default {
  data() {
    return {
      acFormErrors: [],
      loadingSubmittedForm: false,
      validParams: false,
      date: null,
      active: null,
      items: [],
      loadingEA: false,
      uploadDlg: false,
      validationStatus: false,
      loadingInitialElements: true,
      acSlug: null,
      acAction: null,
      snackbar: false,
      loading: false,
      dsaLetterRules: [v => !!v || "This field is required"],
      operationMessage: "Enter your credentials",
      operationMessageType: "warning",
      dsaLetterName: "",
      ac: {
        id: null,
        settings: {
          name: "Validating Assessment Centre Information",
          admin: null
        }
      },
      invitationToken: null,
      userToken: null,
      eaUrl: "",
      componentMounted: false,
      anonymActions: ["login", "signup", "reset-password"],
      authActions: ["booking", "ac-forms"],
      apiUrls: {
        login: "login",
        signup: "signup",
        resetPassword: "request-password-reset"
      },
      acSubmittedFormItems: []
    };
  },
  components: {
    FileUpload,
    AxiosComponent,
    CameraCapture,
    SignaturePad,
    SignatureUpload,
    VueQrcode,
    AuthComponent,
    AcceptInvitation,
    AcSubmittedForms,
    AcSubmittedForm,
    IframeComponent
  },
  mounted() {
    this.refreshInterface(this.$route);
    if (window.addEventListener) {
      window.addEventListener("message", this.eaFrameResize, false);
    }
  },
  beforeRouteUpdate(to, from, next) {
    this.refreshInterface(to);
    next();
  },
  methods: {
    showACSubmittedForm(event) {
      this.loadingSubmittedForm = true;
      var config = {
        url: "get-ac-submitted-form",
        params: {
          token: event
        }
      };
      this.$refs.axios.submit(config);
    },
    test() {
      console.log("test");
    },
    showAcForm(action) {
      if (action === "resume") {
        this.items = this.ac.star_assessment_form_filled;
      } else {
        this.items = this.ac.star_assessment_form;
        this.dsaLetterName = null;
      }
      this.ac.user_data.ac_form = null;
    },
    refreshInterface(route) {
      this.$store.state.authType = "ac";
      this.activationUrl = window.location.href.replace(
        route.path,
        "/activate-account"
      );
      var prevAcSlug = this.acSlug;
      this.acSlug = route.params.slug;
      this.acAction = route.params.action;
      if (this.acAction === "ac-forms") {
        this.userToken = route.params.token;
      } else {
        this.invitationToken = route.params.token;
      }

      if (this.isGuest && this.authActions.includes(this.acAction)) {
        this.$store.state.authRouteRequested = route.path;
      } else if (!this.isGuest && this.anonymActions.includes(this.acAction)) {
        this.acAction = "index";
      } else {
        this.currTab = `tab-${this.acAction}`;
      }

      if (!this.componentMounted || prevAcSlug !== this.acSlug) {
        this.loadingInitialElements = true;
        this.ac = {
          id: null,
          settings: {
            name: "Validating Assessment Centre",
            admin: null
          }
        };
        var config = {
          url: "get-ac-info",
          params: {
            slug: this.acSlug,
            invitation_token: this.invitationToken
          }
        };
        this.$refs.axios.submit(config);
        this.componentMounted = true;
      }
    },
    eaFrameResize(event) {
      this.loadingEA = false;
      if (this.$refs.iframe) {
        this.$refs.iframe.style.height = event.data.height + "px";
      }
    },
    setDSALetter(event) {
      this.ac.user_data.dsa_letter = event;
      if (event) {
        this.dsaLetterName = event.name;
        this.uploadDlg = false;
      } else {
        this.dsaLetterName = null;
      }
    },
    handleHttpResponse(event) {
      this.loading = false;
      this.loadingInitialElements = false;

      if (event.data.result.code === 200) {
        var response = event.data.result.response;
        this.operationMessage = response.msg;
        this.operationMessageType = response.code;

        switch (event.url.substring(event.url.lastIndexOf("/") + 1)) {
          case "get-ac-info":
            if (response.code === "success") {
              this.validParams = true;
              this.ac = response.data;
              this.items = this.ac.star_assessment_form;
              this.acRole = this.ac.role;
              this.dsaLetterName = this.ac.user_data.dsa_letter;
              this.eaUrl =
                this.$store.state.eaUrl +
                (this.acRole === "student"
                  ? "appointments/index/"
                  : "backend/index/");
              this.eaUrl += `?ac=${this.acSlug}&jwt=${
                this.$store.state.payload.jwt
              }&XDEBUG_SESSION_START=netbeans-xdebug&base_url=${
                this.$store.state.baseUrl
              }`;
              this.$store.state.homeUrl = `/assessment-centre/${this.acSlug}`;

              if (this.ac.registered && this.acAction === "signup") {
                this.$router.push(
                  "/assessment-centre/" + this.acSlug + "/index/"
                );
              } else if (!this.ac.registered && this.acAction === "index") {
                var url = "/assessment-centre/" + this.acSlug + "/login/";
                var urlOk = true;
                if (this.acRole === "na") {
                  if (this.invitationToken) {
                    url += this.invitationToken;
                  } else {
                    urlOk = false;
                  }
                }
                this.$router.push(urlOk ? url : "/");
              } else if (this.ac.registered) {
                this.loadingEA = true;
              }
            } else {
              this.$store.state.homeUrl = this.$store.state.homeUrl
                ? this.$store.state.homeUrl
                : "";
            }
            this.loadingInitialElements = false;
            break;
          case this.apiUrls.login:
            if (response.code === "success") {
              this.ac = response.data.ac_info;
              this.items = this.ac.star_assessment_form;
              this.$store.commit("updatePayload", response.data);
              this.eaUrl =
                this.$store.state.eaUrl +
                (this.isStudent ? "appointments/index/" : "backend/index/");
              this.eaUrl += `?ac=${this.acSlug}&jwt=${
                this.$store.state.payload.jwt
              }&XDEBUG_SESSION_START=netbeans-xdebug&base_url=${
                this.$store.state.baseUrl
              }`;
              this.loadingEA = true;
              var redirect = this.$store.state.authRouteRequested;
              this.$store.state.authRouteRequested = null;
              this.$router.push(
                redirect ? redirect : `${this.$store.state.homeUrl}/index`
                //redirect ? redirect : '/dashboard'
              );
            } else {
              this.snackbar = true;
              this.$store.commit("logout");
            }
            break;
          case this.apiUrls.resetPassword:
            this.snackbar = true;
            break;
          case "submit-ac-form":
            this.snackbar = true;
            if (response.code === "success") {
              this.ac.user_data.ac_form_full_submit =
                response.data.ac_form_full_submit;
              this.ac.user_data.ac_booking_enabled =
                response.data.ac_booking_enabled;
            }
            break;
          case "get-ac-submitted-form":
            this.acSubmittedFormItems = response.data;
            this.loadingSubmittedForm = false;
            break;
          default:
            this.snackbar = true;
            break;
        }
      } else {
        this.operationMessage = "Your request could not be executed.";
        this.operationMessageType = "error";
        this.snackbar = true;
      }
    },
    missingFields(i) {
      var rows = this.items[i].components;
      var inputsCount = 0;
      var inputsFilled = 0;
      for (var j in rows) {
        var row = rows[j];
        for (var k in row) {
          var component = row[k];
          if (component.content_type === "input") {
            inputsCount++;
            if (component.input.value) {
              inputsFilled++;
            }
          } else if (component.content_type === "input_group") {
            for (var l in component.rows) {
              var inputRow = component.rows[l];
              for (var m in inputRow) {
                var inputItem = inputRow[m];
                if (inputItem.content_type === "input") {
                  inputsCount++;
                  if (inputItem.input.value) {
                    inputsFilled++;
                  }
                }
              }
            }
          }
        }
      }
      return inputsCount - inputsFilled;
    },
    tabComplete(i) {
      var rows = this.items[i].components;
      var inputsCount = 0,
        inputsFilled = 0;
      for (var j in rows) {
        var row = rows[j];
        for (var k in row) {
          var component = row[k];
          if (component.content_type === "input") {
            inputsCount++;
            if (component.input.value) {
              inputsFilled++;
            }
          } else if (component.content_type === "input_group") {
            for (var l in component.rows) {
              var inputRow = component.rows[l];
              for (var m in inputRow) {
                var inputItem = inputRow[m];
                if (inputItem.content_type === "input") {
                  inputsCount++;
                  if (inputItem.input.value) {
                    inputsFilled++;
                  }
                }
              }
            }
          }
        }
      }
      return inputsCount === inputsFilled ? 2 : inputsFilled === 0 ? 0 : 1;
    },
    setActiveTab(tab) {
      this.active = tab;
    },
    nextTab(i) {
      var active = parseInt(this.active);
      this.setActiveTab(active < this.items.length - 1 ? active + 1 : 0);
      this.submitACForm(false, i);
    },
    previousTab(i) {
      var active = parseInt(this.active);
      this.setActiveTab(active > 0 ? active - 1 : this.items.length - 1);
      this.submitACForm(false, i);
    },
    submitACForm(fullSubmit, step) {
      if (
        this.isStudent &&
        !this.ac.user_data.ac_form_full_submit &&
        (step != this.active || (fullSubmit && this.$refs.acForm.validate()))
      ) {
        var totalInputs = 0;
        var filledInputs = 0;
        var data = {};
        this.acFormErrors = [];

        for (var i in this.items) {
          var rows = this.items[i].components;
          for (var j in rows) {
            var row = rows[j];
            for (var k in row) {
              var component = row[k];
              if (component.content_type === "input") {
                totalInputs++;
                if (
                  component.input.required &&
                  !component.input.value &&
                  fullSubmit
                ) {
                  this.acFormErrors.push({
                    tab: parseInt(i),
                    error: `${component.input.title} is required.`
                  });
                  this.items[i].components[j][k].input.has_error = true;
                } else if (component.input.value) {
                  this.items[i].components[j][k].input.has_error = false;
                  filledInputs++;
                  data[component.input.name] = component.input.value;
                }
              } else if (component.content_type === "input_group") {
                for (var l in component.rows) {
                  var inputRow = component.rows[l];
                  for (var m in inputRow) {
                    var inputItem = inputRow[m];
                    if (
                      inputItem.content_type === "input" &&
                      inputItem.input.value
                    ) {
                      totalInputs++;
                      if (inputItem.input.value) {
                        filledInputs++;
                        data[inputItem.input.name] = inputItem.input.value;
                        data[component.name] = component.rows.length; //saving rows number
                      }
                    }
                  }
                }
              }
            }
          }
        }

        if (this.acFormErrors.length === 0 && Object.keys(data).length > 0) {
          data.full_submit = fullSubmit;
          data.total_inputs = totalInputs;
          data.filled_inputs = filledInputs;
          this.snackbar = false;
          this.loading = true;

          var headers = {
            "Content-Type": "multipart/form-data"
          };

          var formData = new FormData();
          formData.append("dsa_letter", this.ac.user_data.dsa_letter);
          formData.append("data", JSON.stringify(data));
          formData.append("slug", this.acSlug);

          var config = {
            method: "form",
            url: "submit-ac-form",
            params: formData,
            headers: headers
          };
          this.$refs.axios.submit(config);
        }
      }
    }
  },
  computed: {
    validationMessage: function() {
      return this.validationStatus ? "Good to go!" : "The form is incomplete";
    },
    validationColor: function() {
      return this.validationStatus ? "indigo" : "red";
    },
    settingsValidationColor: function() {
      return this.settingsValidationStatus ? "indigo" : "red";
    },
    isGuest() {
      return this.$store.state.payload.is_guest;
    },
    isAC() {
      return this.$store.state.payload.roles.includes("ac");
    },
    isStudent() {
      return this.$store.state.payload.roles.includes("student");
    }
  }
  /*watch: {
    items: function (newValue, oldValue) {
      console.log(oldValue);
      console.log(newValue);
    }
  }*/
};
</script>

<style scoped>
.v-input--selection-controls.v-input .v-label {
  font-size: 14px !important;
}
.v-input__control,
.v-datatable .v-input--selection-controls {
  margin-top: -9px !important;
  max-height: 20px !important;
}
.padding-20 {
  padding: 20px 40px;
}

pre {
  overflow: auto;
}
pre .string {
  color: #885800;
}
pre .number {
  color: blue;
}
pre .boolean {
  color: magenta;
}
pre .null {
  color: red;
}
pre .key {
  color: green;
}

h1 {
  text-align: center;
  font-size: 36px;
  margin-top: 20px;
  margin-bottom: 10px;
  font-weight: 500;
}

fieldset {
  border: 0;
}

.panel {
  margin-bottom: 20px;
  background-color: #fff;
  border: 1px solid transparent;
  border-radius: 4px;
  -webkit-box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
  border-color: #ddd;
}

.panel-heading {
  color: #333;
  background-color: #f5f5f5;
  border-color: #ddd;

  padding: 10px 15px;
  border-bottom: 1px solid transparent;
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
}

.panel-body {
  padding: 15px;
}

.field-checklist .wrapper {
  width: 100%;
}
</style>

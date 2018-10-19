<template>
  <v-container style="margin-top: 60px;" class="animated fadeIn">
    
    <template v-if="loadingInitialElements">
      <v-layout row wrap mt-2>
        <v-flex xs12 sm8 offset-sm2 mt-4>
          <h3 class="primary--text" :class="loadingInitialElements ? 'uppercase' : ''">
            <v-icon v-if="!loadingInitialElements" color="primary">location_city</v-icon> {{ac.settings.name}}
          </h3>
        </v-flex>
        <v-flex xs12 mt-3>
          <v-progress-circular indeterminate color="blue-grey"></v-progress-circular>
        </v-flex>
      </v-layout>
    </template>

    <template v-else>
      
      <template v-if="!ac.registered">
        <v-container pa-5>
          <v-form v-model="validationStatus" ref="form">
            <v-layout row wrap v-if="acRole === 'na'">
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
              </v-flex>
            </v-layout>

            <v-layout row wrap v-else-if="acRole === 'student'">
              <v-card class="animated fadeIn">
                <v-tabs color="blue-grey darken-3" v-model="active" show-arrows icons-and-text fixed-tabs dark slider-color="yellow">
                  <v-tab v-for="(item, i) in items" :key="i + 1" ripple>
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
                  
                  <v-tab-item v-for="(item, i) in items" :key="i + 1" :id="'tab-' + (i + 1)">
                    <v-card flat>
                      <div class="text-xs-justify padding-20">
                        <p class="header-title hidden-sm-and-up">{{item.title}}</p>
                        <v-layout row wrap v-for="(row, j) in item.components" :key="row.id">
                      
                          <v-flex v-for="(col, k) in row" :key="col.id" xs12 :md1="col.class === 'md1'" :md2="col.class === 'md2'" :md3="col.class === 'md3'" :md4="col.class === 'md4'" :md5="col.class === 'md5'" :md6="col.class === 'md6'" :md7="col.class === 'md7'" :md8="col.class === 'md8'" :md9="col.class === 'md9'" :md10="col.class === 'md10'" :md11="col.class === 'md11'" :md12="col.class === 'md12'">
                            <p v-if="col.content_type === 'html'" v-html="col.html"></p>

                            <template v-if="col.content_type === 'input'">

                              <template v-if="(col.input.type === 'text' || col.input.type === 'number' || col.input.type === 'double') && col.input.max_length <= 255">
                                <v-text-field outline :type="col.input.type === 'number' ? 'number' : 'text'" :readonly="col.input.read_only" :required="col.input.required" :disabled="col.input.disabled" v-model="col.input.value" :hint="col.input.hint ? col.input.hint : col.input.title" :label="col.input.title" :maxlength="col.input.max_length"></v-text-field>
                              </template>

                              <template v-if="col.input.type === 'password'">
                                <v-text-field outline :type="col.input.type" :readonly="col.input.read_only" :required="col.input.required" :disabled="col.input.disabled" v-model="col.input.value" :hint="col.input.hint ? col.input.hint : col.input.title" :label="col.input.title" :maxlength="col.input.max_length"></v-text-field>
                              </template>

                              <template v-if="col.input.max_length > 255">
                                <v-textarea outline v-if="(col.input.type === 'text' || col.input.type === 'number' || col.input.type === 'double') && col.input.max_length > 255" :readonly="col.input.read_only" :required="col.input.required" :disabled="col.input.disabled" v-model="col.input.value" :hint="col.input.hint ? col.input.hint : col.input.title" :label="col.input.title" :maxlength="col.input.max_length" :rows="col.input.rows"></v-textarea>
                              </template>

                              <template v-if="col.input.type === 'date' || col.input.type === 'month'">
                                <v-menu :disabled="col.input.read_only" v-model="col.input.modal" :close-on-content-click="false" :nudge-right="40" :return-value.sync="date" lazy transition="scale-transition" full-width min-width="290px">
                                  <v-text-field outline :required="col.input.required" :disabled="col.input.disabled" :hint="col.input.hint ? col.input.hint : col.input.title" slot="activator" v-model="col.input.value" :label="col.input.title" readonly></v-text-field>
                                  <v-date-picker v-if="!col.input.disabled" no-title :show-current="true" :disabled="col.input.disabled" :readonly="col.input.read_only" v-model="col.input.value" :type="col.input.type">
                                    <v-spacer></v-spacer>
                                    <v-btn flat color="primary" @click="col.input.modal = !col.input.modal">OK</v-btn>
                                  </v-date-picker>
                                </v-menu>
                              </template>

                              <template v-if="col.input.type === 'checkbox'">
                                <v-checkbox v-model="col.input.value" :label="col.input.title" :hint="col.input.title"></v-checkbox>
                              </template>

                              <template v-if="col.input.type === 'signature' || col.input.type === 'image'">
                                <v-flex>
                                  <v-tooltip right color="black">
                                    <img v-if="col.input.value" slot="activator" class="mt-3 thumbnail" :src="col.input.value" />
                                    <span v-html="'Image preview'"></span>
                                  </v-tooltip>
                                </v-flex>
                                <v-flex>
                                  <v-tooltip right color="black">
                                    <v-menu slot="activator" bottom offset-y>
                                      <v-btn slot="activator" class="primary" style="margin-left: 0;">
                                        <icon name="edit" class="fa"></icon>{{col.input.title}}
                                      </v-btn>
                                      <v-list class="primary--text">
                                        <v-list-tile v-on:click="showDrawpad(i, j, k)" v-if="col.input.type === 'signature'"><v-list-tile-title><icon name="edit" class="fa"></icon>Drawpad</v-list-tile-title></v-list-tile>
                                        <v-list-tile v-on:click="showUpload(i, j, k)"><v-list-tile-title><icon name="upload" class="fa"></icon>Local drive</v-list-tile-title></v-list-tile>
                                        <v-list-tile v-on:click="showCamera(i, j, k)"><v-list-tile-title><icon name="camera" class="fa"></icon>Device camera</v-list-tile-title></v-list-tile>
                                        <v-list-tile v-on:click="showQrCode(i, j, k)" :disabled="loadingQrCode" ><v-list-tile-title><icon name="mobile-alt" class="fa"></icon>Import from mobile</v-list-tile-title></v-list-tile>
                                      </v-list>
                                    </v-menu>
                                    <span v-html="'Choose your input method'"></span>
                                  </v-tooltip>
                                </v-flex>
                              </template>

                            </template>
                          </v-flex>
                        </v-layout>
                      </div>
                      
                      <template v-if="i === items.length - 1">
                        <v-layout row wrap>
                          <v-flex md4 style="margin-left: 33px;">
                            <v-tooltip right color="black">
                              <v-text-field slot="activator" :readonly="true" v-model="dsaLetterName" label="DSA Letter" :rules="dsaLetterRules" prepend-icon="attach_file" append-icon="folder" @click="uploadDlg = true" @click:append="() => (uploadDlg = true)" type="text" hint="Upload a copy of your DSA letter"></v-text-field>
                              <span>Attach a copy of your DSA Letter</span>
                            </v-tooltip>
                          </v-flex>
                        </v-layout>
                        <v-layout row wrap mt-5>
                          <v-flex xs12>
                            <v-btn :disabled="loading" v-on:click="registerWithAC()" class="white--text indigo" slot="activator">
                              <icon v-if="loading" name="circle-notch" spin class="gray--text"></icon>
                              <v-icon v-else size="22">done</v-icon>&nbsp;Register with this Centre
                            </v-btn>
                          </v-flex>
                        </v-layout>
                        <p></p>
                      </template>
                    </v-card>
                  </v-tab-item>
                </v-tabs>

                <v-tooltip bottom color="black">
                  <v-btn slot="activator" color="cyan" :disabled="loading" class="mb-5 white--text" @click="previousTab()">
                    <v-icon>chevron_left</v-icon>
                  </v-btn>
                  <span>Previous tab</span>
                </v-tooltip>

                <v-tooltip bottom color="black">
                  <v-btn slot="activator" color="cyan" :disabled="loading" class="mb-5 white--text" @click="nextTab()">
                    <v-icon>chevron_right</v-icon>
                  </v-btn>
                  <span>Next tab</span>
                </v-tooltip>
              </v-card>
            </v-layout>
          </v-form>

        </v-container>

        <v-dialog width="500" v-model="uploadDlg" persistent>
          <v-card>
            <v-card-title class="headline grey lighten-2">
              Upload file
              <v-spacer></v-spacer>
              <a @click="uploadDlg = false"><icon name="times" class="fa"></icon></a>
            </v-card-title>
            <v-container>
              <file-upload v-on:set-file="setDSALetter($event)"></file-upload>
            </v-container>
          </v-card>
        </v-dialog>
      </template>
      
      <template v-else>
        <v-layout row wrap mt-2 v-if="loadingEA">
          <v-flex xs12 sm8 offset-sm2 mt-4>
            <h3 class="primary--text uppercase">Loading Appointments information</h3>
          </v-flex>
          <v-flex xs12 mt-3>
            <v-progress-circular indeterminate color="blue-grey"></v-progress-circular>
          </v-flex>
        </v-layout>
        <v-layout row wrap>
          <v-flex xs12>
            <iframe class="animated fadeIn" ref="iframe" style="border: none; width: 100%; padding-bottom: 5px;" :src="eaUrl" scrolling="no"></iframe>          </v-flex>
        </v-layout>
      </template>

    </template>

    <v-snackbar :timeout="5000" :bottom="true" :right="true" v-model="snackbar" :color="operationMessageType">
      <icon class="fa" name="info-circle"></icon> {{ operationMessage }}
      <v-btn flat @click.native="snackbar = false"><icon name="times"></icon></v-btn>
    </v-snackbar>
    
    <axios-component ref="axios" v-on:finish="handleHttpResponse($event)" />

    <v-dialog v-model="drawpadDialog" persistent fullscreen>
      <v-card>
        <signature-pad ref="drawpad" v-on:clear-signature="clearSignature()" v-on:set-signature="setSignatureFromDrawpad($event)" v-on:close-dialog="drawpadDialog = false"></signature-pad>
      </v-card>
    </v-dialog>

    <v-dialog width="500" v-model="uploadDialog" persistent>
      <v-card>
        <v-card-title class="headline grey lighten-2">
          Upload Signature
          <v-spacer></v-spacer>
          <a @click="uploadDialog = false"><icon name="times" class="fa"></icon></a>
        </v-card-title>
        <v-container>
          <signature-upload :bus="bus" v-on:set-signature="setSignatureFromUpload($event)" v-on:close-dialog="uploadDialog = false"></signature-upload>
        </v-container>
      </v-card>
    </v-dialog>

    <v-dialog v-model="cameraDialog" persistent fullscreen>
      <v-card style="background-color: #1e1e1e; padding: 0;">
        <camera-capture v-on:set-signature="setSignatureFromCamera($event)" v-on:close="cameraDialog = false"></camera-capture>
      </v-card>
    </v-dialog>

    <v-dialog width="500" v-model="qrCodeDialog" persistent>
      <v-card>
        <v-card-title class="headline grey lighten-2">
          QR Code
          <v-spacer></v-spacer>
          <a @click="qrCodeDialog = false"><icon name="times" class="fa"></icon></a>
        </v-card-title>
        <v-container>
          <v-layout row v-if="loadingQrCode">
            <v-flex xs12>
              <h3>Generating Code...</h3>
              <icon name="circle-notch" scale=2 spin style="color: gray; margin-top: 20px;"></icon>
            </v-flex>
          </v-layout>
          <template v-else>
            <v-layout row>
              <v-flex xs12>
                <img :src="qrCodeImage" class="animated fadeIn" alt="Scan this code with your smartphone" />
                <h3>Scan this code from <a>{{scannerUrl}}</a> and follow the instructions on screen.<br/><span class="red--text">DO NOT close this window. Press the button below after submitting your signature from your mobile device.</span></h3>
              </v-flex>
            </v-layout>
            <v-layout row>
              <v-flex xs12>
                <v-btn :disabled="loadingSignatureByQrCode" @click="setSignatureFromQr()" color="info">
                  <icon v-if="loadingSignatureByQrCode" name="circle-notch" spin class="gray--text fa"></icon>
                  <icon v-else name="download" class="fa"></icon>
                  Retrieve data
                </v-btn>
              </v-flex>
            </v-layout>
          </template>
        </v-container>
      </v-card>
    </v-dialog>

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

export default {
  data() {
    return {
      loadingSignatureByQrCode: false,
      loadingQrCode: false,
      qrCodeDialog: false,
      drawpadDialog: false,
      uploadDialog: false,
      cameraDialog: false,
      date: null,
      active: null,
      image: "",
      qrCodeImage: "",
      scannerUrl: "",
      bus: new Vue(),
      items: [],
      appointments: [],
      loadingEA: false,
      dlgViewCalendar: false,
      dlgWorkingPlan: false,
      newUnavPeriodError: false,
      calendarEvents: [],
      newUnavPeriodErrors: [],
      newUnavailablePeriod: {},
      unavPeriodValidation: false,
      dlgSetUnavPeriod: false,
      confirmAppointmentDlg: false,
      newAppointmentValidation: false,
      loadingHours: false,
      newAppointment: { service: {}, assessor: {}, date: null, hour: null },
      tabs: null,
      e1: true,
      selectedServices: [],
      showBookingDlg: false,
      uploadDlg: false,
      naServicesDlg: false,
      cancelRegistrationDlg: false,
      updateServiceDlg: false,
      cancelUserRegDlg: false,
      inviteUsersDlg: false,
      validationStatus: false,
      settingsValidationStatus: false,
      loadingInitialElements: true,
      currentUser: { name: "" },
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
      durationRules: [
        v => !!v || "This field is required",
        v => (v && v > 4 && v < 481) || "This value is not allowed"
      ],
      attendantsRules: [
        v => !!v || "This field is required",
        v => (v && v > 0) || "This value is not allowed"
      ],
      priceRules: [
        v => !!v || "This field is required",
        v => (v && v >= 0) || "This value is not allowed"
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
      invitation: {
        name: "",
        email: "",
        text: ""
      },
      ac: {
        id: null,
        settings: {
          name: "Validating Assessment Centre Information",
          admin: null
        },
        appointment_restrictions: {
          min_date: null,
          max_date: null,
          allowed_dates: [],
          available_hours: [],
          needs_assessors: []
        }
      },
      currentServiceIndex: -1,
      currentService: {},
      invitationToken: null,
      currentServiceAction: "",
      eaUrl: ""
    };
  },
  components: {
    FileUpload,
    AxiosComponent,
    CameraCapture,
    SignaturePad,
    SignatureUpload,
    VueQrcode
  },
  mounted() {
    this.activationUrl = window.location.href.replace(
      this.$route.path,
      "/activate-account"
    );
    this.acSlug = this.$route.params.slug;
    this.acAction = this.$route.params.action;
    this.invitationToken = this.$route.params.token;

    var config = {
      url: "get-ac-info",
      params: {
        slug: this.acSlug,
        invitation_token: this.invitationToken
      }
    };
    this.$refs.axios.submit(config);

    if (window.addEventListener) {
      window.addEventListener("message", this.eaFrameResize, false);
    }
  },
  methods: {
    eaFrameResize(event) {
      this.loadingEA = false;
      if (this.$refs.iframe) {
        this.$refs.iframe.style.height = event.data.height + "px";
      }
    },
    toggleUserStatus(userId, status) {
      var config = {
        method: "post",
        url: "set-ac-user-status",
        params: {
          user_id: userId,
          ac_id: this.ac.id,
          status: status
        }
      };
      this.loading = true;
      this.$refs.axios.submit(config);
    },
    validateUnavailablePeriod() {
      var startDate = moment(
        this.newUnavailablePeriod.start_date +
          " " +
          this.newUnavailablePeriod.start_hour,
        "YYYY-MM-DD HH:mm"
      );
      var endDate = moment(
        this.newUnavailablePeriod.end_date +
          " " +
          this.newUnavailablePeriod.end_hour,
        "YYYY-MM-DD HH:mm"
      );
      if (startDate.isValid() && endDate.isValid()) {
        var diff = endDate.diff(startDate) / 60000;
        if (diff < 1) {
          this.newUnavPeriodErrors = ["Invalid date range"];
          this.newUnavPeriodError = true;
        } else if (diff < 5) {
          this.newUnavPeriodErrors = ["Select a range greater than 5 minutes"];
          this.newUnavPeriodError = true;
        } else {
          this.newUnavPeriodErrors = [];
          this.newUnavPeriodError = false;
        }
      } else {
        this.newUnavPeriodError = true;
      }
    },
    setUnavailablePeriod() {
      this.validateUnavailablePeriod();
      if (!this.newUnavPeriodError) {
        var config = {
          method: "post",
          url: "set-unavailable-period",
          params: {
            period: this.newUnavailablePeriod,
            ac_id: this.ac.id
          }
        };
        this.loading = true;
        this.$refs.axios.submit(config);
      }
    },
    resetNewAppointmentInfo() {
      this.resetNewAppDateAndTime();
      this.ac.appointment_restrictions.needs_assessors = [];
      this.newAppointment.assessor = null;
      if (
        this.newAppointment.service &&
        this.ac.settings.availability_type !== "Combined"
      ) {
        this.ac.needs_assessors.forEach(assessor => {
          if (assessor.status === 1) {
            assessor.services.forEach(service => {
              if (service.id === this.newAppointment.service.id) {
                this.ac.appointment_restrictions.needs_assessors.push({
                  id: assessor.id,
                  name: assessor.name
                });
              }
            });
          }
        });
      }
    },
    saveAppointment() {
      var config = {
        method: "post",
        url: "create-appointment",
        params: {
          appointment: this.newAppointment,
          home_url: window.location.href.replace(this.$route.path, "")
        }
      };
      this.loading = true;
      this.$refs.axios.submit(config);
    },
    resetNewAppDateAndTime() {
      this.newAppointment.date = null;
      this.newAppointment.hour = null;
    },
    allowedDates(val) {
      return this.ac.appointment_restrictions.allowed_dates.includes(val);
    },
    getAvailableHours() {
      this.newAppointment.hour = null;
      if (
        this.newAppointment.service &&
        this.newAppointment.date &&
        (this.newAppointment.assessor ||
          this.ac.settings.availability_type === "Combined")
      ) {
        var config = {
          url: "get-available-hours",
          params: {
            service_id: this.newAppointment.service.id,
            assessor_id: this.newAppointment.assessor
              ? this.newAppointment.assessor.id
              : null,
            date: this.newAppointment.date
          }
        };
        this.loadingHours = true;
        this.$refs.axios.submit(config);
      } else {
        this.snackbar = true;
        this.operationMessageType = "warning";
        this.operationMessage = "Select a service and an assessor -if allowed";
      }
    },
    toggleBookingDlg() {
      if (this.showBookingDlg) {
        this.ac.needs_assessors.splice(this.ac.needs_assessors.length - 1, 1);
      } else {
        this.ac.needs_assessors.push({ id: -1, name: "- Any assessor -" });
      }
      this.newAppointment = {};
      this.showBookingDlg = !this.showBookingDlg;
    },
    updateACSettings() {
      if (this.$refs.settingsForm.validate()) {
        this.loading = true;
        var config = {
          method: "post",
          url: "update-ac-settings",
          params: {
            ac_id: this.ac.id,
            settings: this.ac.settings
          }
        };
        this.$refs.axios.submit(config);
      }
    },
    updateNAServices() {
      this.loading = true;
      var config = {
        method: "post",
        url: "update-na-services",
        params: {
          ac_id: this.ac.id,
          user_id: this.currentNA.id,
          services: this.selectedServices
        }
      };
      this.$refs.axios.submit(config);
    },
    showNAServices(index, item) {
      this.currentNAIndex = index;
      this.currentNA = item;
      this.selectedServices = this.currentNA.services;
      this.naServicesDlg = true;
    },
    updateService() {
      if (this.$refs.updateServiceForm.validate()) {
        this.loading = true;
        var config = {
          method: "post",
          url: "update-ac-service",
          params: {
            ac_id: this.ac.id,
            item: this.currentService,
            action: this.currentServiceAction
          }
        };
        this.$refs.axios.submit(config);
      }
    },
    showUpdateServiceForm(index, item, mode) {
      this.currentServiceIndex = index;
      this.currentService = JSON.parse(JSON.stringify(item));
      this.currentServiceAction = mode;
      this.updateServiceDlg = true;
      if (mode !== "Delete service") {
        this.$nextTick(this.$refs.currentServiceName.focus);
      }
    },
    setCurrentUser(index, user, userType) {
      this.currentUserIndex = index;
      this.currentUser = user;
      this.currentUserType = userType;
      this.cancelUserRegDlg = true;
    },
    setDSALetter(event) {
      this.ac.user_data.dsa_letter = event;
      if (event) {
        this.dsaLetterName = event.name;
        this.uploadDlg = false;
      } else {
        this.dsaLetterName = "";
      }
    },
    inviteUser() {
      if (this.$refs.inviteForm.validate()) {
        this.loading = true;
        var config = {
          method: "post",
          url: "invite-user",
          params: {
            invitation: this.invitation,
            ac_id: this.ac.id,
            url: window.location.href.replace(
              this.$route.path,
              "/assessment-centre/" + this.ac.settings.token + "/signup/"
            )
          }
        };
        this.$refs.axios.submit(config);
      }
    },
    cancelUserRegistration() {
      this.loading = true;
      var config = {
        method: "post",
        url: "unregister-user-from-ac",
        params: {
          user_id: this.currentUser.id,
          ac_id: this.ac.id
        }
      };
      this.$refs.axios.submit(config);
    },
    cancelRegistration() {
      this.loading = true;
      var config = {
        method: "post",
        url: "unregister-from-ac",
        params: {
          ac_id: this.ac.id
        }
      };
      this.$refs.axios.submit(config);
    },
    registerWithAC() {
      if (this.$refs.form.validate()) {
        var data = {};

        for (var i in this.items) {
          var rows = this.items[i].components;
          for (var j in rows) {
            var row = rows[j];
            for (var k in row) {
              var component = row[k];
              if (component.content_type === "input"/* && component.input.value*/) {
                this.ac.user_data[component.input.name] = component.input.value;
              }
            }
          }
        }

        if (!this.ac.user_data.password) {
          this.operationMessage = "Password missing";
          this.validationStatus = false;
        }
        else if (!this.ac.user_data.password_confirm) {
          this.operationMessage = "Password confirmation missing";
          this.validationStatus = false;
        }
        else if (!this.ac.user_data.name) {
          this.operationMessage = "Student's name missing";
          this.validationStatus = false;
        }
        else if (!this.ac.user_data.email) {
          this.operationMessage = "Email missing";
          this.validationStatus = false;
        }
        else if (this.ac.user_data.password !== this.ac.user_data.password_confirm) {
          this.operationMessage = "Passwords do not match";
          this.validationStatus = false;
        }
        else {
          this.validationStatus = true;
        }

        if (this.validationStatus) {
          this.loading = true;
          var headers = {
            "Content-Type": "multipart/form-data"
          };
          var formData = new FormData();
          formData.append("dsa_letter", this.ac.user_data.dsa_letter);
          //formData.append("data", JSON.stringify(data));
          formData.append("ac", JSON.stringify(this.ac));
          formData.append("url", this.activationUrl);
          formData.append("role", this.acRole);
          formData.append("invitation_token", this.invitationToken);
          var config = {
            method: "form",
            url: "register-with-ac",
            params: formData,
            headers: headers
          };
          this.$refs.axios.submit(config);
        } else {
          this.operationMessageType = "warning";
          this.snackbar = true;
        }
      }
    },
    handleHttpResponse(event) {
      if (event.data.result.code === 200) {
        this.operationMessage = event.data.result.response.msg;
        this.operationMessageType = event.data.result.response.code;
        this.loading = false;
        this.loadingHours = false;

        switch (event.url.substring(event.url.lastIndexOf("/") + 1)) {
          case "get-ac-info":
            if (event.data.result.response.code === "success") {
              this.ac = event.data.result.response.data;
              this.items = this.ac.star_assessment_form;
              this.acRole = this.ac.role;
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
              if (this.ac.registered && this.acAction === "signup") {
                this.$router.push(
                  "/assessment-centre/" + this.acSlug + "/index/"
                );
              } else if (!this.ac.registered && this.acAction === "index") {
                this.$router.push(
                  "/assessment-centre/" +
                    this.acSlug +
                    "/signup/" +
                    this.invitationToken
                );
              } else if (this.ac.registered) {
                this.loadingEA = true;
              }
            } else {
              this.$router.push("/not-found");
            }
            this.loadingInitialElements = false;
            break;
          case "get-available-hours":
            this.ac.appointment_restrictions.available_hours =
              event.data.result.response.code === "success"
                ? event.data.result.response.data
                : [];
            this.loadingHours = false;
            break;
          case "update-na-services":
            if (event.data.result.response.code === "success") {
              this.currentNA.services = this.selectedServices;
              this.naServicesDlg = false;
            }
            this.snackbar = true;
            break;
          case "update-ac-settings":
          case "create-appointment":
          case "set-unavailable-period":
            if (event.data.result.response.code === "success") {
              //Appointments
              this.confirmAppointmentDlg = false;
              this.naServicesDlg = false;
              this.newAppointment = { service: null, assessor: null };
              //Unavailable periods
              this.dlgSetUnavPeriod = false;
              this.newUnavailablePeriod = {};
              this.newUnavPeriodError = true;
            }
            this.snackbar = true;
            break;
          case "update-ac-service":
            if (event.data.result.response.code === "success") {
              switch (this.currentServiceAction) {
                case "Add service":
                  this.currentService.id = event.data.result.response.data;
                  this.ac.services.push(this.currentService);
                  this.currentService = { id: -1, currency: "GBP" };
                  this.$nextTick(this.$refs.currentServiceName.focus);
                  break;
                case "Update service":
                  this.ac.services.splice(
                    this.currentServiceIndex,
                    1,
                    this.currentService
                  );
                  this.$nextTick(this.$refs.currentServiceName.focus);
                  break;
                case "Delete service":
                  this.ac.services.splice(this.currentServiceIndex, 1);
                  break;
                default:
                  break;
              }
              this.updateServiceDlg = false;
            }
            this.snackbar = true;
            break;
          case "invite-user":
            if (event.data.result.response.code === "success") {
              this.inviteUsersDlg = false;
            }
            this.snackbar = true;
            break;
          case "unregister-user-from-ac":
            if (event.data.result.response.code === "success") {
              if (this.currentUserType === "student") {
                this.ac.students.splice(this.currentUserIndex, 1);
              } else {
                this.ac.needs_assessors.splice(this.currentUserIndex, 1);
              }
              this.cancelUserRegDlg = false;
            }
            this.snackbar = true;
            break;
          case "unregister-from-ac":
            if (event.data.result.response.code === "success") {
              this.ac.registered = false;
              this.cancelRegistrationDlg = false;
            }
            this.snackbar = true;
            break;
          case "register-with-ac":
            this.snackbar = true;
            if (event.data.result.response.code === "success") {
              this.ac.registered = true;
              if (this.isGuest) {
                this.$store.state.authRouteRequested =
                  "/assessment-centre/" + this.acSlug + "/index";
                setTimeout(function() {
                  this.$router.push("/login");
                }, 5000);
              } else {
                this.$router.push(
                  "/assessment-centre/" + this.acSlug + "/index"
                );
              }
            }
            break;
          case "set-ac-user-status":
            this.snackbar = true;
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
    test(event) {
      console.log(event);
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
    nextTab(i) {
      const active = parseInt(this.active);
      this.active = active < this.items.length - 1 ? active + 1 : 0;
      this.submit(false, i);
    },
    previousTab(i) {
      const active = parseInt(this.active);
      this.active = active > 0 ? active - 1 : this.items.length - 1;
      this.submit(false, i);
    },
    setCurrentCoordinates(iVal, jVal, kVal) {
      this.i = iVal;
      this.j = jVal;
      this.k = kVal;
    },
    showDrawpad(i, j, k) {
      this.setCurrentCoordinates(i, j, k);
      this.$refs.drawpad.setImage(this.items[i].components[j][k].input.value);
      this.drawpadDialog = true;
    },
    showCamera(i, j, k) {
      this.setCurrentCoordinates(i, j, k);
      this.cameraDialog = true;
    },
    showUpload(i, j, k) {
      this.setCurrentCoordinates(i, j, k);
      var requestConfig = {
        headers: { Authorization: "Bearer " + this.$store.state.payload.jwt }
      };
      var requestParams = {};
      this.bus.$emit("setRequestConfig", requestConfig);
      this.bus.$emit("setRequestParams", requestParams);
      this.uploadDialog = true;
    },
    showQrCode(i, j, k) {
      if (!this.loadingQrCode) {
        this.setCurrentCoordinates(i, j, k);
        this.loadingQrCode = true;
        this.qrCodeDialog = true;

        var requestConfig = {
          headers: {
            Authorization: "Bearer " + this.$store.state.payload.jwt
          },
          params: {
            XDEBUG_SESSION_START: "netbeans-xdebug"
          }
        };
        var that = this;

        axios
          .get(this.$store.state.baseUrl + "generate-qr-code", requestConfig)
          .then(function(response) {
            if (response.data.code === "success") {
              that.qrCodeImage = response.data.data.qr_code;
              that.randomQrCode = response.data.data.random_code;
            }
            that.loadingQrCode = false;
          })
          .catch(function(error) {
            that.qrCodeImage = "";
            that.randomQrCode = "";
            that.loadingQrCode = false;
          });
      }
    },
    setSignatureFromUpload(event) {
      this.items[this.i].components[this.j][this.k].input.value = event;
      this.uploadDialog = false;
    },
    setSignatureFromQr() {
      if (!this.loadingSignatureByQrCode) {
        this.loadingSignatureByQrCode = true;
        var requestConfig = {
          headers: {
            Authorization: "Bearer " + this.$store.state.payload.jwt
          },
          params: {
            XDEBUG_SESSION_START: "netbeans-xdebug",
            random_code: this.randomQrCode
          }
        };
        var that = this;

        axios
          .get(
            this.$store.state.baseUrl + "get-signature-by-random-code",
            requestConfig
          )
          .then(function(response) {
            if (response.data.code === "success") {
              that.items[that.i].components[that.j][that.k].input.value =
                response.data.data;
              that.qrCodeDialog = false;
            }
            that.operationMessage = response.data.msg;
            that.operationMessageType = response.data.code;
            that.snackbar = true;
            that.loadingSignatureByQrCode = false;
          })
          .catch(function(error) {
            that.loadingSignatureByQrCode = false;
            that.operationMessage =
              "There was an error on the remote endpoint. Try again later.";
            that.operationMessageType = "error";
            that.snackbar = true;
          });
      }
    },
    onFileChange(e) {
      var files = e.target.files || e.dataTransfer.files;
      if (!files.length) return;
      this.createImage(files[0]);
    },
    createImage(file) {
      var image = new Image();
      var reader = new FileReader();
      var vm = this;

      reader.onload = e => {
        vm.image = e.target.result;
      };
      reader.readAsDataURL(file);
    },
    removeImage: function(e) {
      this.image = "";
    },
    setSignatureFromCamera(value) {
      this.items[this.i].components[this.j][this.k].input.value = value;
      this.cameraDialog = false;
    },
    setSignatureFromDrawpad(event) {
      this.items[this.i].components[this.j][this.k].input.value = event;
      this.drawpadDialog = false;
    },
    clearSignature() {
      this.items[this.i].components[this.j][this.k].input.value = null;
    },
    validationErrors() {
      return false;
      for (var i in this.items) {
        var rows = this.items[i].components;
        for (var j in rows) {
          var row = rows[j];
          for (var k in row) {
            var component = row[k];
            if (
              component.content_type === "input" &&
              component.input.required &&
              !component.input.value
            ) {
              return true;
            } else if (component.content_type === "input_group") {
              for (var l in component.rows) {
                var inputRow = component.rows[l];
                for (var m in inputRow) {
                  var inputItem = inputRow[m];
                  if (
                    inputItem.content_type === "input" &&
                    inputItem.input.required &&
                    !inputItem.input.value
                  ) {
                    return true;
                  }
                }
              }
            }
          }
        }
      }
      return false;
    }
  },
  computed: {
    serviceDurationHint() {
      var res =
        this.currentService.duration % 60 === 0
          ? this.currentService.duration / 60
          : (this.currentService.duration / 60).toFixed(2);
      return res + (res > 1 ? " hours" : " hour");
    },
    isGuest() {
      return this.$store.state.payload.is_guest;
    },
    settingsValidationMessage: function() {
      return this.settingsValidationStatus
        ? "Good to go!"
        : "The form is incomplete";
    },
    validationMessage: function() {
      return this.validationStatus ? "Good to go!" : "The form is incomplete";
    },
    validationColor: function() {
      return this.validationStatus ? "indigo" : "red";
    },
    settingsValidationColor: function() {
      return this.settingsValidationStatus ? "indigo" : "red";
    }
  }
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
</style>

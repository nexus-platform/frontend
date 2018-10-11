<template>
  <v-container style="margin-top: 60px;" class="animated fadeIn">
      <v-layout row v-if="loadingInitialElements" wrap mt-2>
        <v-flex xs12 sm8 offset-sm2 mt-4>
          <h3 class="primary--text" :class="loadingInitialElements ? 'uppercase' : ''">
            <v-icon v-if="!loadingInitialElements" color="primary">location_city</v-icon> {{ac.settings.name}}
          </h3>
        </v-flex>
        <v-flex xs12 mt-3>
          <v-progress-circular indeterminate color="blue-grey"></v-progress-circular>
        </v-flex>
      </v-layout>
      <!--<v-layout row v-else wrap class="text-xs-center">
        <v-flex xs12 v-if="ac.admin">
          <h3><v-icon color="primary">business_center</v-icon> <b>Manager:</b> {{ac.admin}}</h3>
        </v-flex>
        <v-flex xs12>
          <h3><v-icon color="primary">phone</v-icon> <b>Telephone:</b> {{ac.settings.telephone}}</h3>
        </v-flex>
        <v-flex xs12>
          <h3><v-icon color="primary">location_on</v-icon> <b>Address:</b> {{ac.settings.address}}</h3>
        </v-flex>
      </v-layout>-->

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
                  <v-text-field v-if="acRole === 'student'" :readonly="true" v-model="dsaLetterName" label="DSA Letter" :rules="dsaLetterRules" prepend-icon="attach_file" append-icon="folder" @click="uploadDlg = true" @click:append="() => (uploadDlg = true)" type="text" hint="Upload a copy of your DSA letter"></v-text-field>
                </v-flex>
              </v-layout>
              <v-layout row wrap mt-5>
                <v-flex xs12>
                  <v-tooltip bottom :color="validationColor">
                    <v-btn :disabled="loading" v-on:click="registerWithAC()" class="white--text" :class="{ red: !validationStatus, indigo: validationStatus }" slot="activator">
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
          <v-container>
            <v-layout row wrap>
              <v-flex xs12>
                <div class="iframe-container">
                  <iframe id="iframe" ref="iframe" style="border: none; width: 100%; padding-bottom: 5px;" :src="eaUrl" scrolling="no"></iframe>
                </div>
              </v-flex>
            </v-layout>
          </v-container>
        </template>

      </template>

      <v-snackbar :timeout="5000" :bottom="true" :right="true" v-model="snackbar" :color="operationMessageType">
        <icon class="fa" name="info-circle"></icon> {{ operationMessage }}
        <v-btn flat @click.native="snackbar = false"><icon name="times"></icon></v-btn>
      </v-snackbar>
    
    <axios-component ref="axios" v-on:finish="handleHttpResponse($event)" />

	</v-container>
</template>

<script>
import FileUpload from "@/components/FileUpload";
import axios from "axios";
import AxiosComponent from "@/components/AxiosComponent";
import moment from "moment";

export default {
  data() {
    return {
      appointments: [],
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
          name: "Loading Assessment Centre information",
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
  components: { FileUpload, AxiosComponent },
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
      window.addEventListener("message", this.zino_resize, false);
    }
  },
  methods: {
    zino_resize(event) {
      var zino_iframe = document.getElementById("iframe");
      if (zino_iframe) {
        zino_iframe.style.height = event.data.height + "px";
      }
    },
    resizeIframe() {
      var frame = document.getElementById("iframe");
      var doc = frame.contentDocument || frame.contentWindow.document;
      frame.style.height = frame.contentDocument.body.scrollHeight + "px";
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
        this.loading = true;
        var headers = {
          "Content-Type": "multipart/form-data"
        };
        var formData = new FormData();
        formData.append("dsa_letter", this.ac.user_data.dsa_letter);
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
              this.acRole = this.ac.role;
              this.eaUrl =
                `${this.$store.state.baseUrl}../../ea/index.php/` +
                (this.acRole === "student"
                  ? "appointments/index/"
                  : "backend/index/");
              this.eaUrl += `?ac=${this.ac.token}&jwt=${
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
              } else {
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
/*.iframe-container {
  overflow: hidden;
  padding-top: 75%;
  position: relative;
}
.iframe-container iframe {
  border: 0;
  height: 80%;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
}*/
</style>

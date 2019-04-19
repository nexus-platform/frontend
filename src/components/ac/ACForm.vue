<template>
  <v-flex xs12>
    <v-flex xs12>
      <p
        class="text-uppercase subheading primary--text text-xs-center"
      >You need to submit this form before booking an appointment</p>
    </v-flex>

    <template v-if="localAC.user_data.ac_form">
      <p class="text-xs-center">
        <v-layout row wrap>
          <v-flex sm12>
            <v-card-text>
              <h3>
                You have an unfinished form.
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
      </p>
    </template>

    <template v-else>
      <v-layout row wrap>
        <v-flex sm12>
          <v-alert
            :value="this.localFormErrors.length > 0"
            type="error"
            transition="scale-transition"
          >
            <h4>Your form contains the following errors:</h4>
            <div
              v-for="(acError, acErrorIndex) in this.localFormErrors"
              :key="`acError-${acErrorIndex}`"
            >
              <a class="white--text" @click="setActiveTab(acError.tab)" v-html="acError.error"></a>
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
                  v-for="(item, i) in localItems"
                  :key="`v-tab-${i + 1}`"
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

                <v-tab-item v-for="(item, i) in localItems" :key="`v-tab-${i + 1}`">
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

              <p class="text-xs-center">
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
              </p>
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
              <v-progress-circular
                size="18"
                v-if="loading"
                :width="2"
                indeterminate
                class="grey--text fa"
              ></v-progress-circular>
              <v-icon v-else class="fa" size="22">done</v-icon>Submit form
            </v-btn>
          </v-flex>
        </v-layout>
      </v-form>
    </template>

    <v-dialog width="500" v-model="uploadDlg" persistent>
      <v-card>
        <v-card-title class="headline grey lighten-2">
          Upload file
          <v-spacer></v-spacer>
          <a @click="uploadDlg = false">
            <v-icon class="fa">close</v-icon>
          </a>
        </v-card-title>
        <v-container>
          <FileUpload v-on:set-file="setDSALetter($event)"/>
        </v-container>
      </v-card>
    </v-dialog>

    <v-snackbar
      :timeout="5000"
      :bottom="true"
      :right="true"
      v-model="snackbar"
      :color="operationMessageType"
    >
      <v-icon class="fa">info</v-icon>
      {{ operationMessage }}
      <v-btn flat @click.native="snackbar = false">
        <v-icon>close</v-icon>
      </v-btn>
    </v-snackbar>

    <AxiosComponent ref="axios" v-on:finish="handleHttpResponse($event)"/>
  </v-flex>
</template>

<script>
import FileUpload from "@/components/FileUpload";
import moment from "moment";
import Vue from "vue";
import CameraCapture from "@/components/CameraCapture";
import SignaturePad from "@/components/SignaturePad";
import SignatureUpload from "@/components/SignatureUpload";

export default {
  data() {
    return {
      localFormErrors: [],
      date: null,
      active: null,
      uploadDlg: false,
      validationStatus: false,
      snackbar: false,
      loading: false,
      dsaLetterRules: [v => !!v || "This field is required"],
      operationMessage: "Enter your credentials",
      operationMessageType: "warning",
      dsaLetterName: "",
      localAC: null,
      localItems: []
    };
  },
  components: {
    FileUpload
  },
  props: ["ac", "acFormErrors", "items", "slug"],
  created() {
    this.localFormErrors = this.acFormErrors;
    this.localAC = this.ac;
    this.localItems = this.items;
  },
  methods: {
    showAcForm(action) {
      if (action === "resume") {
        this.localItems = this.localAC.star_assessment_form_filled;
      } else {
        this.localItems = this.localAC.star_assessment_form;
        this.dsaLetterName = null;
      }
      this.localAC.user_data.ac_form = null;
    },
    setDSALetter(event) {
      this.localAC.user_data.dsa_letter = event;
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
          case "submit-ac-form":
            this.snackbar = true;
            if (response.code === "success") {
              this.localAC.user_data.ac_form_full_submit =
                response.data.ac_form_full_submit;
              this.localAC.user_data.ac_booking_enabled =
                response.data.ac_booking_enabled;
              this.$emit("submit-ac-form", response.data);
            }
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
      var rows = this.localItems[i].components;
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
      var rows = this.localItems[i].components;
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
      this.setActiveTab(active < this.localItems.length - 1 ? active + 1 : 0);
      this.submitACForm(false, i);
    },
    previousTab(i) {
      var active = parseInt(this.active);
      this.setActiveTab(active > 0 ? active - 1 : this.localItems.length - 1);
      this.submitACForm(false, i);
    },
    submitACForm(fullSubmit, step) {
      if (
        this.$store.getters.isStudent &&
        !this.localAC.user_data.ac_form_full_submit &&
        (step != this.active || (fullSubmit && this.$refs.acForm.validate()))
      ) {
        var totalInputs = 0;
        var filledInputs = 0;
        var data = {};
        this.localFormErrors = [];

        for (var i in this.localItems) {
          var rows = this.localItems[i].components;
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
                  this.localFormErrors.push({
                    tab: parseInt(i),
                    error: `${component.input.title} is required.`
                  });
                  this.localItems[i].components[j][k].input.has_error = true;
                } else if (component.input.value) {
                  this.localItems[i].components[j][k].input.has_error = false;
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

        if (this.localFormErrors.length === 0 && Object.keys(data).length > 0) {
          data.full_submit = fullSubmit;
          data.total_inputs = totalInputs;
          data.filled_inputs = filledInputs;
          this.snackbar = false;
          this.loading = true;

          var formData = new FormData();
          formData.append("dsa_letter", this.localAC.user_data.dsa_letter);
          formData.append("data", JSON.stringify(data));
          formData.append("slug", this.slug);

          var config = {
            method: "form",
            url: "submit-ac-form",
            params: formData,
            headers: {}
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

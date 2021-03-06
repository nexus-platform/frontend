<template>
  <v-flex xs12>
    <v-tabs
      v-model="activeTab"
      color="blue-grey"
      dark
      slider-color="white"
      centered
      class="elevation-1"
    >
      <v-tab ripple href="#ac-form">
        <v-icon class="fa">picture_as_pdf</v-icon>Assessment Form
      </v-tab>
      <v-tab ripple href="#report-form">
        <v-icon class="fa">picture_as_pdf</v-icon>Report Form
      </v-tab>
      <v-tab v-if="$store.getters.isAC" ripple href="#assessment">
        <v-icon class="fa">assessment</v-icon>Assessment
      </v-tab>
      
      <v-tab-item value="ac-form" class="pt-3 pb-5">
        <v-flex sm12 lg10 offset-lg1>
          <ACSubmitedForm/>
        </v-flex>
      </v-tab-item>

      <v-tab-item value="report-form" class="pa-3">
        <VProgress v-if="loading" message="Loading report" />
        <v-flex v-else mt-3 sm12 lg10 offset-lg1 class="animated fadeIn">
          <p v-if="reportForm.status !== 2" class="text-xs-center title">
            No report has been submitted yet.
          </p>
          <v-form v-else ref="repForm">
            <v-textarea :readonly="!$store.getters.isNA"
              outline
              label="Assessment Venue Address (if different from main centre)"
              v-model="reportForm.content.venue_address"
            ></v-textarea>
            <v-textarea :readonly="!$store.getters.isNA"
              outline
              label="Reason for Assessment conducted as an ISR"
              v-model="reportForm.content.reason_isr"
            ></v-textarea>
            <v-textarea :readonly="!$store.getters.isNA"
              outline
              label="Assessor / Assessment Centre Disclosure"
              v-model="reportForm.content.disclosure"
            ></v-textarea>
            <v-btn
            v-if="$store.getters.isNA"
              large
              class="primary"
              :disabled="!validReportForm || sendingReport"
              @click="submitNAReport()"
            >
              <v-icon v-if="!sendingReport">check</v-icon>
              <v-progress-circular size="18" v-else :width="2" indeterminate class="grey--text fa"></v-progress-circular>Submit Report
            </v-btn>
          </v-form>
        </v-flex>
      </v-tab-item>
      
      <v-tab-item value="assessment" class="pt-3 pb-5">
        <v-flex sm12 lg10 offset-lg1>
          <p>Datetime:</p>
          <p>Location:</p>
          <p>Assessor:</p>
          <p>Invoicing balance:</p>
          <p>Status:</p>
        </v-flex>
      </v-tab-item>
    </v-tabs>

    <v-snackbar
      :timeout="5000"
      :bottom="true"
      :right="true"
      v-model="snackbar"
      :color="operationMessageType"
    >
      <v-icon small class="white--text fa">info</v-icon>
      {{ operationMessage }}
      <v-btn flat @click.native="snackbar = false">
        <v-icon small class="fa">close</v-icon>
      </v-btn>
    </v-snackbar>

    <AxiosComponent ref="axios" v-on:finish="handleHttpResponse($event)"/>
  </v-flex>
</template>

<script>
import ACSubmitedForm from "@/components/ac/ACSubmittedForm";

export default {
  data() {
    return {
      activeTab: 'ac-form',
      activeReportFormStep: null,
      token: null,
      loading: false,
      snackbar: false,
      sendingReport: false,
      operationMessage: null,
      operationMessageType: null,
      reportForm: {
        status: 0,
        content: {
          venue_address: null,
          reason_isr: null,
          disclosure: null
        }
      }
    };
  },
  components: { ACSubmitedForm },
  computed: {
    validReportForm() {
      return (
        this.reportForm.content.venue_address ||
        this.reportForm.content.reason_isr ||
        this.reportForm.content.disclosure
      );
    }
  },
  created() {
    this.activeTab = this.$route.params.tab;
  },
  mounted() {
    this.token = this.$route.params.token;
    this.getNAReportByStudent();
  },
  methods: {
    handleHttpResponse(event) {
      if (event.data.result.code === 200) {
        var response = event.data.result.response;
        this.operationMessage = response.msg;
        this.operationMessageType = response.code;
        switch (event.url.substring(event.url.lastIndexOf("/") + 1)) {
          case "get-na-report-by-student":
            this.loading = false;
            this.reportForm = response.data;
            break;
          case "submit-na-report":
            this.sendingReport = false;
            this.snackbar = true;
            break;
          default:
            this.snackbar = true;
            break;
        }
      } else {
        this.operationMessage = "Your request could not be executed.";
        this.operationMessageType = "error";
      }
    },
    getNAReportByStudent() {
      this.loading = true;
      var config = {
        url: "get-na-report-by-student",
        params: {
          token: this.token
        }
      };
      this.$refs.axios.submit(config);
    },
    submitNAReport() {
      if (this.validReportForm && !this.sendingReport) {
        this.sendingReport = true;
        var config = {
          url: "submit-na-report",
          method: "post",
          params: {
            token: this.token,
            report: this.reportForm
          }
        };
        this.$refs.axios.submit(config);
      }
    }
  }
};
</script>

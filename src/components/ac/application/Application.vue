<template>
  <v-flex xs12>
    <v-tabs
      dark
      centered
      icons-and-text
      show-arrows
      color="blue-grey"
      slider-color="white"
      class="elevation-1"
    >
      <!--Tabs-->
      <v-tab ripple key="tab-requests">
        Requests
        <v-icon class="fa">record_voice_over</v-icon>
      </v-tab>

      <v-tab ripple key="tab-up-assess">
        Upcoming assessments
        <v-icon class="fa">date_range</v-icon>
      </v-tab>

      <v-tab ripple key="tab-report-pend">
        Report pending
        <v-icon class="fa">report_problem</v-icon>
      </v-tab>

      <v-tab ripple key="tab-subm-due">
        Submission due
        <v-icon class="fa">assignment_late</v-icon>
      </v-tab>

      <v-tab ripple key="tab-submitted">
        Submitted
        <v-icon class="fa">assignment_turned_in</v-icon>
      </v-tab>

      <!--Tab items-->

      <v-tab-item class="pa-4" key="tab-requests">tab-requests</v-tab-item>

      <v-tab-item class="pt-3 pr-4 pb-4 pl-3" key="tab-up-assess">
        <Appointments :loading="loading" :items="items.upcoming" tab="upcoming" />
      </v-tab-item>

      <v-tab-item class="pt-3 pr-4 pb-4 pl-3" key="tab-report-pend">
        <Appointments :loading="loading" :items="items.pending" tab="pending"/>
      </v-tab-item>

      <v-tab-item class="pa-4" key="tab-subm-due">
        <Appointments :loading="loading" :items="items.submission_due" tab="submission_due" v-on:report-submitted="reportSubmittedToDSA($event)"/>
      </v-tab-item>

      <v-tab-item class="pa-4" key="tab-submitted">
        <Appointments :loading="loading" :items="items.submitted" tab="submitted" />
      </v-tab-item>
    </v-tabs>

    <AxiosComponent ref="axios" v-on:finish="handleHttpResponse($event)"/>
  </v-flex>
</template>

<script>
/*import UpcomingAssessments from "@/components/ac/application/UpcomingAssessments";
import ReportPending from "@/components/ac/application/ReportPending";*/
import Appointments from "@/components/ac/application/Appointments";

export default {
  data() {
    return {
      loading: false,
      items: []
    };
  },
  components: { Appointments },
  mounted() {
    this.fetchData();
  },
  methods: {
    reportSubmittedToDSA(event) {
      let item = this.items.submission_due[event];
      this.items.submission_due.splice(event, 1);
      if (!this.items.submmitted) {
        this.items.submitted = [];
      }
      this.items.submitted.push(item);
    },
    fetchData() {
      this.loading = true;
      this.items = [];
      var config = {
        url: "get-ac-appointments",
        params: {}
      };
      this.$refs.axios.submit(config);
    },
    handleHttpResponse(event) {
      if (event.data.result.code === 200) {
        var response = event.data.result.response;
        this.operationMessage = response.msg;
        this.operationMessageType = response.code;
        switch (event.url.substring(event.url.lastIndexOf("/") + 1)) {
          case "get-ac-appointments":
            this.items = response.data;
            this.loading = false;
            break;
          default:
            this.loading = false;
            break;
        }
      } else {
        this.operationMessage = "Your request could not be executed.";
        this.operationMessageType = "error";
        this.loading = false;
      }
    }
  }
};
</script>

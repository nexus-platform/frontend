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
      <v-tab ripple key="ac-form">
        <v-icon class="fa">picture_as_pdf</v-icon>Student Assessment Form
      </v-tab>
      <v-tab ripple key="report-form">
        <v-icon class="fa">picture_as_pdf</v-icon>Report Form
      </v-tab>
      <v-tab-item key="ac-form" class="pt-3 pb-5">
        <v-flex sm12 lg10 offset-lg1>
          <ACSubmitedForm/>
        </v-flex>
      </v-tab-item>
      <v-tab-item key="report-form" class="pa-3">
        <v-flex sm12 lg10 offset-lg1>
          <v-card flat class="text-xs-center mt-3">
            <v-tabs
              v-model="activeReportFormStep"
              color="blue-grey darken-3"
              dark
              slider-color="white"
              centered
              class="elevation-0"
            >
              <v-tab ripple key="report-step1">Step 1</v-tab>
              <v-tab ripple key="report-step2">Step 2</v-tab>
              <v-tab-item key="report-step1" class="pt-3 pb-5">Step 1 content</v-tab-item>
              <v-tab-item key="report-step2" class="pa-3">Step 2 content</v-tab-item>
            </v-tabs>
          </v-card>
        </v-flex>
      </v-tab-item>
    </v-tabs>
  </v-flex>
</template>

<script>
import ACSubmitedForm from "@/components/ACSubmittedForm";

export default {
  data() {
    return {
      activeTab: null,
      activeReportFormStep: null,
      token: null,
      loading: false
    };
  },
  components: { ACSubmitedForm },
  methods: {
    getStudentsByAC() {
      this.loading = true;
      this.items = [];
      var config = {
        url: "get-ac-students",
        params: { slug: this.acSlug }
      };
      this.$refs.axios.submit(config);
    },
    handleHttpResponse(event) {
      this.loading = false;

      if (event.data.result.code === 200) {
        var response = event.data.result.response;
        this.operationMessage = response.msg;
        this.operationMessageType = response.code;

        switch (event.url.substring(event.url.lastIndexOf("/") + 1)) {
          case "get-ac-students":
            const { sortBy, descending, page, rowsPerPage } = this.pagination;
            let items = response.data;
            const total = items.length;
            if (this.pagination.sortBy) {
              items = items.sort((a, b) => {
                const sortA = a[sortBy];
                const sortB = b[sortBy];
                if (descending) {
                  if (sortA < sortB) return 1;
                  if (sortA > sortB) return -1;
                  return 0;
                } else {
                  if (sortA < sortB) return -1;
                  if (sortA > sortB) return 1;
                  return 0;
                }
              });
            }

            if (rowsPerPage > 0) {
              items = items.slice((page - 1) * rowsPerPage, page * rowsPerPage);
            }
            this.items = items;
            this.totalItems = items.length;
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
    }
  }
};
</script>

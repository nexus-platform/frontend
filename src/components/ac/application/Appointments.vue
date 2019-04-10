<template>
  <v-flex xs12>
    <v-data-table
      :headers="tableHeaders"
      :items="items"
      :loading="loading"
      class="elevation-1 ml-2"
      :no-results-text="loading ? 'Loading records' : 'No matching records found'"
      :no-data-text="loading ? 'Loading records' : 'No matching records found'"
    >
      <template slot="items" slot-scope="props">
        <td class="text-xs-left">
          <v-icon size="18" class="fa">room_service</v-icon>
          {{ props.item.service }}
        </td>
        <td class="text-xs-left">
          <v-icon size="18" class="fa">person</v-icon>
          {{ props.item.provider }}
        </td>
        <td class="text-xs-left">
          <v-icon size="18" class="fa">today</v-icon>
          {{ props.item.start }}
        </td>
        <td class="text-xs-left">
          <v-tooltip bottom color="black">
            <a slot="activator" @click="redirect(props.item.user_token)">{{ props.item.student}}</a>
            <span>Open Student Page</span>
          </v-tooltip>
        </td>
        <td class="text-xs-left" v-if="tab === 'submission_due'">
          <v-tooltip bottom color="black">
            <a slot="activator" @click="dlgSubmitToDSA = true"><v-icon>file_upload</v-icon></a>
            <span>Submit to DSA</span>
          </v-tooltip>
          <v-dialog width="500" v-model="dlgSubmitToDSA" persistent>
            <v-card class="text-xs-center">
              <v-card-title class="headline grey lighten-2">
                Submit report
                <v-spacer></v-spacer>
                <a @click="dlgSubmitToDSA = false">
                  <v-icon class="fa">close</v-icon>
                </a>
              </v-card-title>
              <v-container>
                <h3>Are you sure you want to submit this report?</h3>
                <v-btn :disabled="submittingReportToDSA" @click="submitReportToDSA(props.item.user_token, props.index)" color="info">
                  <v-icon v-if="!submittingReportToDSA" class="fa">thumb_up</v-icon>
                  <v-progress-circular
                    v-else
                    size="18"
                    indeterminate
                    :width="2"
                    class="grey--text fa"
                  ></v-progress-circular>Yes
                </v-btn>
                <v-btn @click="dlgSubmitToDSA = false" color="error">
                  <v-icon class="fa">thumb_down</v-icon>No
                </v-btn>
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

        </td>
      </template>

      <template slot="progress">
        <v-alert :value="true" class="black--text text-xs-center" color="default">
          <v-progress-circular :width="2" indeterminate class="grey--text mt-3"></v-progress-circular>
        </v-alert>
      </template>
    </v-data-table>
  </v-flex>
</template>

<script>
export default {
  data() {
    return {
      userIndex: null,
      operationMessage: null,
      operationMessageType: null,
      snackbar: false,
      dlgSubmitToDSA: false,
      submittingReportToDSA: false,
      tableHeaders: [
        { text: "Service", value: "service" },
        { text: "Provider", value: "provider" },
        { text: "Date", value: "start" },
        { text: "Student", value: "student" }
      ]
    };
  },
  props: ["items", "loading", "tab"],
  mounted() {
    if (this.tab === "submission_due") {
      this.tableHeaders.push({ text: "Actions", value: "actions" });
    }
  },
  methods: {
    redirect(token) {
      this.$router.push(`/assessment-centre/student/${token}`);
    },
    submitReportToDSA(token, index) {
      if (!this.submittingReportToDSA) {
        this.userIndex = index;
        this.submittingReportToDSA = true;
        var config = {
          method: "post",
          url: "submit-report-to-dsa",
          params: {
            token: token
          }
        };
        this.$refs.axios.submit(config);
      }
    },
    handleHttpResponse(event) {
      this.loading = false;

      if (event.data.result.code === 200) {
        var response = event.data.result.response;
        this.operationMessage = response.msg;
        this.operationMessageType = response.code;

        switch (event.url.substring(event.url.lastIndexOf("/") + 1)) {
          case "submit-report-to-dsa":
            this.submittingReportToDSA = false;
            if (response.code === "success") {
              this.$emit('report-submitted', this.userIndex);
            }
            this.snackbar = true;
            break;
          case "get-ac-submitted-forms":
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

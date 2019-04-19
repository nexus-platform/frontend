<template>
  <v-flex xs12>
    <v-data-table
      :headers="headers"
      :items="items"
      :pagination.sync="pagination"
      :total-items="totalItems"
      :loading="loading"
      class="elevation-1"
    >
      <template slot="items" slot-scope="props">
        <td>{{ props.item.student_name }}</td>
        <td class="text-xs-left">{{ props.item.univ_name }}</td>
        <td class="text-xs-left">{{ props.item.pdf_name }}</td>
        <td class="text-xs-left">{{ props.item.status_desc }}</td>
        <td class="text-xs-left">{{ props.item.created_at }}</td>
        <td class="text-xs-left">
          <v-tooltip bottom color="black">
            <v-btn
              @click="reviewForm(props.item.route)"
              :disabled="props.item.status === 3"
              small
              flat
              slot="activator"
              class="btn-sm"
              color="warning"
            >
              <v-icon small class="fa">edit</v-icon>
            </v-btn>
            <span>Review</span>
          </v-tooltip>
          <v-tooltip bottom color="black">
            <v-btn
              @click="showApproveDialog(props.item.id, props.index)"
              :disabled="props.item.status !== 1"
              small
              flat
              slot="activator"
              class="btn-sm"
              color="success"
            >
              <v-icon small class="fa">thumb_up</v-icon>
            </v-btn>
            <span>Approve</span>
          </v-tooltip>
          <v-tooltip bottom color="black">
            <v-btn
              @click="downloadFile(props.item.id, props.item.filename)"
              :disabled="props.item.status !== 3 || downloading"
              small
              flat
              slot="activator"
              class="btn-sm"
              color="info"
            >
              <v-icon v-if="!downloading" small class="fa">file_download</v-icon>
              <v-progress-circular v-else :width="2" size="18" indeterminate class="gray--text fa"></v-progress-circular>
            </v-btn>
            <span>Download</span>
          </v-tooltip>
        </td>
      </template>

      <v-alert
        slot="no-results"
        :value="true"
        class="black--text"
        color="default"
      >Your search for "{{ search }}" found no results.</v-alert>

      <template slot="no-data">
        <v-alert :value="true" class="black--text text-xs-center" color="default">
          <v-progress-circular v-if="loading" :width="2" indeterminate class="primary--text"></v-progress-circular>
          <span v-else>There are no items to display</span>
        </v-alert>
      </template>
    </v-data-table>

    <v-dialog width="500" v-model="approveDialog" persistent>
      <v-card>
        <v-card-title class="headline grey lighten-2">
          Approve Form
          <v-spacer></v-spacer>
          <a @click="approveDialog = false">
            <v-icon small class="fa">close</v-icon>
          </a>
        </v-card-title>
        <v-container>
          <h3 class="text-xs-center">Are you sure you want to approve this form?</h3>
          <div class="text-xs-center">
            <v-btn :disabled="approvingForm" @click="approveForm()" color="info">
              <v-icon v-if="!approvingForm" small class="fa">thumb_up</v-icon>
              <v-progress-circular v-else :width="2" size="18" indeterminate class="gray--text fa"></v-progress-circular>Yes
            </v-btn>
            <v-btn @click="approveDialog = false" color="error">
              <v-icon small class="fa">thumb_down</v-icon>Not yet
            </v-btn>
          </div>
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
      <v-icon small class="fa">info</v-icon>
      {{ operationMessage }}
      <v-btn flat @click.native="snackbar = false">
        <v-icon small class="fa">close</v-icon>
      </v-btn>
    </v-snackbar>

    <AxiosComponent ref="axios" v-on:finish="handleHttpResponse($event)"/>
  </v-flex>
</template>

<script>
import { saveAs } from "file-saver";

export default {
  data() {
    return {
      search: "",
      formIndex: null,
      formId: null,
      totalItems: 0,
      items: [],
      loading: true,
      approvingForm: false,
      downloading: false,
      currFileName: null,
      approveDialog: false,
      operationMessage: "",
      operationMessageType: "error",
      snackbar: false,
      pagination: {},
      headers: [
        { text: "Student Name", value: "student_name" },
        { text: "Institute", value: "univ_name" },
        { text: "Form Name", value: "pdf_name" },
        { text: "Status", value: "status_desc" },
        { text: "Last modified", value: "created_at" },
        { text: "Actions", value: "actions" }
      ]
    };
  },
  watch: {
    pagination: {
      handler() {
        this.getDataFromApi();
      },
      deep: true
    }
  },
  mounted() {
    this.getDataFromApi();
  },
  computed: {
    pages() {
      if (
        this.pagination.rowsPerPage == null ||
        this.pagination.totalItems == null
      )
        return 0;
      return Math.ceil(
        this.pagination.totalItems / this.pagination.rowsPerPage
      );
    }
  },
  methods: {
    handleHttpResponse(event) {
      this.loading = false;

      if (event.data.result.code === 200) {
        var response = event.data.result.response;
        this.operationMessage = response.msg;
        this.operationMessageType = response.code;

        switch (event.url.substring(event.url.lastIndexOf("/") + 1)) {
          case "do-approve-form":
            this.snackbar = true;
            this.approvingForm = false;
            this.approveDialog = false;
            if (response.code === "success") {
              this.items[this.formIndex].status = response.data;
              this.items[this.formIndex].filename = response.filename;
            }
            break;
          case "get-do-dsa-forms":
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
          case "get-filled-pdf":
            this.downloading = false;
            if (response) {
              let blob = new Blob([response], {
                type: "application/pdf"
              });
              saveAs(blob, this.currFileName);
            } else {
              this.snackbar = true;
              this.operationMessage = "Your file could not be downloaded.";
              this.operationMessageType = "error";
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
    approveForm() {
      if (!this.approvingForm && this.formId) {
        this.approvingForm = true;

        var config = {
          method: "post",
          url: "do-approve-form",
          params: {
            form_id: this.formId
          }
        };
        this.$refs.axios.submit(config);
      }
    },
    reviewForm(route) {
      this.$router.push(route);
    },
    showApproveDialog(formId, index) {
      this.formId = formId;
      this.formIndex = index;
      this.approveDialog = true;
    },
    searchItems() {
      if (!this.loading) {
        this.getDataFromApi();
      }
    },
    getDataFromApi() {
      this.loading = true;
      var config = {
        url: "get-do-dsa-forms",
        params: {}
      };
      this.$refs.axios.submit(config);
    },
    downloadFile(id, filename) {
      if (!this.downloading) {
        this.downloading = true;
        this.currFileName = filename;
        var config = {
          method: "get",
          url: "get-filled-pdf",
          params: {
            file: id
          },
          responseType: "arraybuffer"
        };
        this.$refs.axios.submit(config);
      }
    }
  }
};
</script>

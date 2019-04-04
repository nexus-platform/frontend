<template>
  <v-flex xs12>
    <v-card-title>
      <strong>Submitted Forms</strong>
    </v-card-title>

    <v-data-table
      :headers="headers"
      :items="items"
      :pagination.sync="pagination"
      :total-items="totalItems"
      :loading="loading"
      class="elevation-0"
    >
      <template slot="items" slot-scope="props">
        <td class="text-xs-left">{{ props.item.student_name }}</td>
        <td class="text-xs-left">{{ props.item.univ_name }}</td>
        <td class="text-xs-left">{{ props.item.status_desc }}</td>
        <td class="text-xs-left">
          <v-tooltip bottom color="black">
            <v-btn
              @click="redirect(props.item.route)"
              small
              flat
              slot="activator"
              class="btn-sm"
              color="info"
            >
              <v-icon class="fa">arrow_forward</v-icon>
            </v-btn>
            <span>View form</span>
          </v-tooltip>
          <v-tooltip bottom color="black" v-if="$store.getters.isAC">
            <v-btn
              :disabled="props.item.status"
              @click="showApproveDialog(props.item.token, props.index)"
              small
              flat
              slot="activator"
              class="btn-sm"
              color="success"
            >
              <v-icon class="fa">thumb_up</v-icon>
            </v-btn>
            <span>Approve</span>
          </v-tooltip>
        </td>
      </template>

      <template slot="no-data">
        <v-alert :value="true" class="black--text text-xs-center" color="default">
          <v-progress-circular :width="2" v-if="loading" indeterminate color="blue-grey"></v-progress-circular>
          <span v-if="!loading">There are no items to display</span>
        </v-alert>
      </template>
    </v-data-table>

    <v-dialog width="500" v-model="approveDialog" persistent>
      <v-card class="text-xs-center">
        <v-card-title class="headline grey lighten-2">
          Approve Form
          <v-spacer></v-spacer>
          <a @click="approveDialog = false">
            <v-icon class="fa">close</v-icon>
          </a>
        </v-card-title>
        <v-container>
          <h3>Are you sure you want to approve this form?</h3>
          <v-btn :disabled="approvingForm" @click="approveForm()" color="info">
            <v-icon v-if="!approvingForm" class="fa">thumb_up</v-icon>
            <v-progress-circular v-else size="18" indeterminate :width="2" class="grey--text fa"></v-progress-circular>
            Yes
          </v-btn>
          <v-btn @click="approveDialog = false" color="error">
            <v-icon class="fa">thumb_down</v-icon>Not yet
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
  </v-flex>
</template>

<script>
export default {
  data() {
    return {
      formIndex: null,
      formId: null,
      totalItems: 0,
      items: [],
      loading: true,
      approvingForm: false,
      downloading: false,
      approveDialog: false,
      operationMessage: "",
      operationMessageType: "error",
      snackbar: false,
      pagination: {},
      headers: [
        { text: "Student Name", value: "student_name" },
        { text: "Institute", value: "univ_name" },
        { text: "Status", value: "status_desc" },
        { text: "Actions", value: "actions" }
      ]
    };
  },
  props: ["slug"],
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
    showApproveDialog(formId, index) {
      this.formId = formId;
      this.formIndex = index;
      this.approveDialog = true;
    },
    redirect(route) {
      this.$router.push(route);
      //this.$emit("show-ac-submitted-form", this.$route.params.token);
    },
    handleHttpResponse(event) {
      this.loading = false;

      if (event.data.result.code === 200) {
        var response = event.data.result.response;
        this.operationMessage = response.msg;
        this.operationMessageType = response.code;

        switch (event.url.substring(event.url.lastIndexOf("/") + 1)) {
          case "ac-approve-form":
            this.approvingForm = false;
            if (response.code === "success") {
              this.items[this.formIndex].status = response.data;
              this.approveDialog = false;
            }
            this.snackbar = true;
            break;
          case "get-ac-forms":
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
    },
    getDataFromApi() {
      this.loading = true;
      var config = {
        url: "get-ac-forms",
        params: {}
      };
      this.$refs.axios.submit(config);
    },
    approveForm() {
      if (!this.approvingForm && this.formId) {
        this.approvingForm = true;
        var config = {
          method: "post",
          url: "ac-approve-form",
          params: {
            form_id: this.formId
          }
        };
        this.$refs.axios.submit(config);
      }
    }
  }
};
</script>

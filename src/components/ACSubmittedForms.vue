<template>
  <v-container class="animated fadeIn">
    <v-layout row wrap>
      <v-flex xs12>
        <v-card-title>
          <strong>Submitted Forms</strong>
        </v-card-title>

        <v-data-table :headers="headers" :items="desserts" :pagination.sync="pagination" :total-items="totalDesserts" :loading="loading" class="elevation-0">
          
          <template slot="items" slot-scope="props">
            <td class="text-xs-left">{{ props.item.student_name }}</td>
            <td class="text-xs-left">{{ props.item.univ_name }}</td>
            <td class="text-xs-left">{{ props.item.status_desc }}</td>
            <td class="text-xs-left">
              <v-tooltip bottom color="black">
                <v-btn @click="redirect(props.item.route)" small flat slot="activator" class="btn-sm" color="info">
                  <icon class="fa" name="arrow-right"></icon>
                </v-btn>
                <span>View form</span>
              </v-tooltip>
              <v-tooltip bottom color="black" v-if="isAC">
                <v-btn @click="showApproveDialog(props.item.token, props.index)" small flat slot="activator" class="btn-sm" color="success">
                  <icon class="fa" name="thumbs-up"></icon>
                </v-btn>
                <span>Approve</span>
              </v-tooltip>
            </td>
          </template>

          <template slot="no-data">
            <v-alert :value="true" class="black--text" color="default">
              <h3 v-if="loading">Loading data...</h3> 
              <span v-if="!loading">There are no items to display</span> 
            </v-alert>
          </template>

        </v-data-table>

      </v-flex>
    </v-layout>
    
    <v-dialog width="500" v-model="approveDialog" persistent>
      <v-card>
        <v-card-title class="headline grey lighten-2">
          Approve Form
          <v-spacer></v-spacer>
          <a @click="approveDialog = false"><icon name="times" class="fa"></icon></a>
        </v-card-title>
        <v-container>
          <h3>Are you sure you want to approve this form?</h3>
          <v-btn :disabled="approvingForm" @click="approveForm()" color="info">
            <icon v-if="!approvingForm" class="fa" name="thumbs-up"></icon>
            <icon v-if="approvingForm" class="fa" name="circle-notch" spin></icon>Yes
          </v-btn>
          <v-btn @click="approveDialog = false" color="error"><icon class="fa" name="thumbs-down"></icon>Not yet</v-btn>
        </v-container>
      </v-card>
    </v-dialog>

    <v-snackbar :timeout="5000" :bottom="true" :right="true" v-model="snackbar" :color="operationMessageType">
      <icon class="fa" name="info-circle"></icon> {{ operationMessage }}
      <v-btn flat @click.native="snackbar = false"><icon name="times"></icon></v-btn>
    </v-snackbar>

  </v-container>  
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      formIndex: null,
      formId: null,
      totalDesserts: 0,
      desserts: [],
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
        this.getDataFromApi().then(data => {
          this.desserts = data.items;
          this.totalDesserts = data.total;
          this.loading = false;
        });
      },
      deep: true
    }
  },
  mounted() {
    this.getDataFromApi().then(data => {
      this.desserts = data.items;
      this.totalDesserts = data.total;
      this.loading = false;
    });
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
    },
    isAC() {
      return this.$store.state.payload.roles.includes("ac");
    },
  },
  methods: {
    redirect(route) {
      this.$router.push(route);
      this.$emit('show-ac-submitted-form', this.$route.params.token);
    },
    approveForm() {
      if (!this.approvingForm && this.formId) {
        this.approvingForm = true;
        var requestConfig = {
          headers: { Authorization: "Bearer " + this.$store.state.payload.jwt }
        };
        var requestParams = {
          slug: this.slug,
          form_id: this.formId
        };
        var that = this;
        axios
          .post(
            this.$store.state.baseUrl +
              "ac-approve-form?XDEBUG_SESSION_START=netbeans-xdebug",
            requestParams,
            requestConfig
          )
          .then(function(response) {
            that.approvingForm = false;
            that.operationMessage = response.data.msg;
            that.operationMessageType = response.data.code;
            that.snackbar = true;
            if (response.data.code === "success") {
              that.desserts[that.formIndex].status = response.data.data;
              that.approveDialog = false;
            }
          })
          .catch(function(error) {
            that.approvingForm = false;
            that.operationMessage =
              "There was an error on the remote endpoint. Try again later.";
            that.operationMessageType = "error";
            that.snackbar = true;
          });
      }
    },
    showApproveDialog(formId, index) {
      this.formId = formId;
      this.formIndex = index;
      this.approveDialog = true;
    },
    getDataFromApi() {
      this.loading = true;
      return new Promise((resolve, reject) => {
        const { sortBy, descending, page, rowsPerPage } = this.pagination;
        let config = {
          headers: { Authorization: "Bearer " + this.$store.state.payload.jwt },
          params: {
            slug: this.slug
          }
        };
        var that = this;

        axios
          .get(
            this.$store.state.baseUrl +
              "get-ac-forms?XDEBUG_SESSION_START=netbeans-xdebug",
            config
          )
          .then(function(response) {
            let items = response.data.data;
            const total = items.length;
            if (that.pagination.sortBy) {
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
            resolve({
              items,
              total
            });
          })
          .catch(function(error) {
            let items = {};
            const total = items.length;
            resolve({
              items,
              total
            });
          });
      });
    }
  }
};
</script>

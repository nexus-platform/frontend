<template>
  <v-container style="margin-top: 60px;" class="animated fadeIn">
    <v-card>
      <v-card-title>
        <strong>Scheduled Appointments</strong>
      </v-card-title>
  
      <v-data-table :headers="headers" :items="items" :pagination.sync="pagination" :loading="loading" class="elevation-1">
        <template slot="items" slot-scope="props">
          <td class="text-xs-left">{{ props.item.student }}</td>
          <td class="text-xs-left">{{ props.item.provider }}</td>
          <td class="text-xs-left">{{ props.item.service }}</td>
          <td class="text-xs-left">{{ props.item.start }}</td>
          <td class="text-xs-left">{{ props.item.end }}</td>
        </template>
        <template slot="no-data">
          <v-alert :value="true" class="black--text" color="default">
            <v-progress-circular v-if="loading" indeterminate color="blue-grey"></v-progress-circular>
            <span v-if="!loading">There are no items to display</span> 
          </v-alert>
        </template>
      </v-data-table>
    </v-card>

    <axios-component ref="axios" v-on:finish="handleHttpResponse($event)" />

  </v-container>
</template>

<script>
import AxiosComponent from "@/components/AxiosComponent";

export default {
  data() {
    return {
      items: [],
      loading: true,
      pagination: {},
      snackbar: false,
      operationMessage: "",
      operationMessageType: "error",
      headers: [
        { text: "Student", value: "student" },
        { text: "Provider", value: "provider" },
        { text: "Service", value: "service" },
        { text: "Start", value: "start" },
        { text: "End", value: "end" }
      ]
    };
  },
  components: { AxiosComponent },
  watch: {
    pagination: {
      handler() {
        this.getDataFromApi();
      },
      deep: true
    }
  },
  computed: {
    pages() {
      if (this.pagination.rowsPerPage == null) return 0;
      return Math.ceil(
        this.pagination.totalItems / this.pagination.rowsPerPage
      );
    }
  },
  methods: {
    getDataFromApi() {
      this.loading = true;
      var config = {
        url: "get-my-bookings",
        params: {
          slug: this.acSlug,
          invitation_token: this.invitationToken
        }
      };
      this.$refs.axios.submit(config);
    },
    handleHttpResponse(event) {
      if (event.data.result.code === 200) {
        this.operationMessage = event.data.result.response.msg;
        this.operationMessageType = event.data.result.response.code;
        this.loading = false;
        switch (event.url) {
          case "get-my-bookings":
            if (event.data.result.response.code === "success") {
              this.items = event.data.result.response.data;
              this.loading = false;
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
    }
  }
};
</script>

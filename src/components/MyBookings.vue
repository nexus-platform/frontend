<template>
  <v-container style="margin-top: 60px;" class="animated fadeIn">
    <v-card>
      <v-card-title>
        <strong>Scheduled appointments</strong>
      </v-card-title>
  
      <v-data-table :headers="headers" :items="items" :pagination.sync="pagination" :loading="loading" class="elevation-1">
        <template slot="items" slot-scope="props">
          <template v-if="isNA">
            <td class="text-xs-left"><v-icon small></v-icon><v-icon small>person</v-icon> {{ props.item.student }}</td>
            <td class="text-xs-left"><v-icon small></v-icon><v-icon small>school</v-icon> {{ props.item.institute }}</td>
          </template>
          <td v-else class="text-xs-left"><v-icon small>person</v-icon> {{ props.item.provider }}</td>
          <td class="text-xs-left"><v-icon small>room_service</v-icon> {{ props.item.service }}</td>
          <td class="text-xs-left"><v-icon small>event</v-icon> {{ props.item.start }}</td>
          <td class="text-xs-left"><v-icon small>event</v-icon> {{ props.item.end }}</td>
          <td class="text-xs-left">
            <v-tooltip bottom color="black">
              <v-btn @click="setCurrentAppointment(props.item, props.index)" small flat slot="activator" class="btn-sm" color="warning"><v-icon>event_busy</v-icon></v-btn>
              <span>Cancel appointment</span>
            </v-tooltip>
          </td>
        </template>
        <template slot="no-data">
          <v-alert :value="true" class="black--text" color="default">
            <v-progress-circular v-if="loading" indeterminate color="blue-grey"></v-progress-circular>
            <span v-if="!loading">There are no items to display</span> 
          </v-alert>
        </template>
      </v-data-table>

      <v-dialog width="450" v-model="dlgCancelAppointment" persistent>
        <v-card>
          <v-card-title class="headline grey lighten-2">
            Cancel appointment
          </v-card-title>
          <v-container>
            <v-layout row wrap mb-3>
                <h3>Are you sure you want to cancel this appointment?</h3>
            </v-layout>
            <v-divider></v-divider>
            <v-layout row wrap mt-3>
              <v-spacer></v-spacer>
              <v-btn :disabled="loading" small @click="cancelAppointment()" color="error">
                <v-icon v-if="!loading">check</v-icon>
                <icon v-else class="fa" name="circle-notch" spin></icon>
                Yes
              </v-btn>
              <v-btn small @click="dlgCancelAppointment = false" color="default">
                <v-icon>close</v-icon>No
              </v-btn>
            </v-layout>
          </v-container>
        </v-card>
      </v-dialog>

    </v-card>

    <v-snackbar :timeout="5000" :bottom="true" :right="true" v-model="snackbar" :color="operationMessageType">
      <icon class="fa" name="info-circle"></icon> {{ operationMessage }}
      <v-btn flat @click.native="snackbar = false"><icon name="times"></icon></v-btn>
    </v-snackbar>

    <axios-component ref="axios" v-on:finish="handleHttpResponse($event)" />

  </v-container>
</template>

<script>
import AxiosComponent from "@/components/AxiosComponent";

export default {
  data() {
    return {
      items: [],
      pagination: {
        sortBy: "name"
      },
      loading: true,
      snackbar: false,
      operationMessage: "",
      operationMessageType: "error",
      isNA: false,
      isStudent: false,
      headers: [],
      dlgCancelAppointment: false,
      currentAppointment: null,
      currentAppointmentIndex: null
    };
  },

  components: { AxiosComponent },
  mounted() {
    if (this.$store.state.payload.roles.includes("na")) {
      this.isNA = true;
      this.headers.push({ text: "Student", value: "student" });
      this.headers.push({ text: "Institute", value: "institute" });
    } else if (this.$store.state.payload.roles.includes("student")) {
      this.isStudent = true;
      this.headers.push({ text: "Provider", value: "provider" });
    }
    this.headers.push({ text: "Service", value: "service" });
    this.headers.push({ text: "Start", value: "start" });
    this.headers.push({ text: "End", value: "end" });
    this.headers.push({ text: "Actions", value: "" });
  },
  methods: {
    cancelAppointment() {
      this.loading = true;
      var config = {
        url: "cancel-booking",
        method: "post",
        params: {
          id: this.currentAppointment.id
        }
      };
      this.$refs.axios.submit(config);
    },
    setCurrentAppointment(item, index) {
      this.currentAppointment = item;
      this.currentAppointmentIndex = index;
      this.dlgCancelAppointment = true;
    },
    changeSort(column) {
      if (this.pagination.sortBy === column) {
        this.pagination.descending = !this.pagination.descending;
      } else {
        this.pagination.sortBy = column;
        this.pagination.descending = false;
      }
    },
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

        switch (event.url.substring(event.url.lastIndexOf("/") + 1)) {
          case "get-my-bookings":
            {
              if (event.data.result.response.code === "success") {
                this.items = event.data.result.response.data;
              }
            }
            break;
          case "cancel-booking":
            {
              if (event.data.result.response.code === "success") {
                this.items.splice(this.currentAppointmentIndex, 1);
                this.dlgCancelAppointment = false;
                this.snackbar = true;
              }
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
  },
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
  }
};
</script>

<template>
  <v-flex xs12>
    <v-tabs
      v-model="activeStudentTab"
      color="blue-grey"
      dark
      slider-color="white"
      centered
      class="elevation-1"
    >
      <v-tab ripple key="service-points">
        <v-icon class="fa">room_service</v-icon>Service Points
      </v-tab>
      <v-tab ripple key="bookings">
        <v-icon class="fa">today</v-icon>Bookings
      </v-tab>
      <v-tab-item key="service-points" class="pt-3 pb-5">
        <!--DSA tile-->
        <v-layout v-if="registrations.dsa" row wrap>
          <v-flex xs12 sm6 offset-sm3 mb-3>
            <v-card class="elevation-1">
              <v-toolbar dark color="info">
                <v-icon>school</v-icon>
                <v-toolbar-title style="font-size: 16px;">DSA Office: {{ registrations.dsa.name }}</v-toolbar-title>
              </v-toolbar>
              <v-container>
                <v-btn flat :to="`/dsa/${registrations.dsa.slug}/my-dsa-forms/index`">
                  <v-icon small class="fa">arrow_forward</v-icon>Submitted DSA forms
                </v-btn>
                <v-btn flat :to="`/dsa/${registrations.dsa.slug}/dsa-forms/index`">
                  <v-icon small class="fa">arrow_forward</v-icon>Available DSA forms
                </v-btn>
                <v-btn flat :to="`/dsa/${registrations.dsa.slug}/files`">
                  <v-icon small class="fa">arrow_forward</v-icon>Attached files
                </v-btn>
              </v-container>
            </v-card>
          </v-flex>
        </v-layout>

        <!--AC tile-->
        <v-layout v-if="registrations.ac" row wrap>
          <v-flex xs12 sm6 offset-sm3 mb-3>
            <v-card class="elevation-1">
              <v-toolbar dark color="deep-purple">
                <v-icon>assessment</v-icon>
                <v-toolbar-title
                  style="font-size: 16px;"
                >Assessment Centre: {{ registrations.ac[0].name }}</v-toolbar-title>
              </v-toolbar>
              <v-container>
                <v-btn
                  flat
                  :to="`/assessment-centre/student/${$store.getters.getUserToken}/ac-form`"
                >
                  <v-icon small class="fa">arrow_forward</v-icon>Registration form
                </v-btn>
                <v-btn
                  flat
                  :to="`/assessment-centre/student/${$store.getters.getUserToken}/report-form`"
                >
                  <v-icon small class="fa">arrow_forward</v-icon>Assessment Report
                </v-btn>
                <v-btn flat :to="`/assessment-centre/files`">
                  <v-icon small class="fa">arrow_forward</v-icon>Attached files
                </v-btn>
              </v-container>
            </v-card>
          </v-flex>
        </v-layout>
      </v-tab-item>
      <v-tab-item key="bookings" class="pa-3">
        <v-flex xs12 lg10 offset-lg1>
          <p class="text-xs-center">
            <v-btn color="blue-grey white--text" @click="getBookings()" :disabled="loading">
              <v-icon size="20" class="fa">today</v-icon>
              {{ btnGetBookingsCaption }}
            </v-btn>
          </p>
          <v-data-table
            :headers="[{text: 'Institute', value: 'institute'}, {text: 'Service', value: 'service'}, {text: 'Provider', value: 'provider'}, {text: 'Date', value: 'start'}]"
            :items="bookings"
            :pagination.sync="pagination"
            :total-items="bookings.length"
            :loading="loading"
            class="elevation-0"
            :no-results-text="loading ? 'Loading records' : 'No matching records found'"
            :no-data-text="loading ? 'Loading records' : 'No matching records found'"
          >
            <template slot="items" slot-scope="props">
              <td class="text-xs-left">
                <span class="deep-purple white--text badge pa-2">
                  <v-icon v-if="props.item.target_type === 1" size="18" class="fa white--text">assessment</v-icon>
                  <v-icon v-else size="18" class="fa white--text">school</v-icon>
                  {{ props.item.institute }}
                </span>
              </td>
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
            </template>

            <template slot="progress">
              <v-alert :value="true" class="black--text text-xs-center" color="default">
                <v-progress-circular :width="2" indeterminate class="grey--text mt-3"></v-progress-circular>
              </v-alert>
            </template>
          </v-data-table>
          <!--<VProgress v-if="loading" class="animated fadeIn"/>
          <template v-else>
            <v-layout row wrap class="animated fadeIn">
              <v-flex xs12 v-if="bookings.length === 0">
                <v-card-text class="text-xs-center subheading">No results found</v-card-text>
              </v-flex>
              <v-flex xs12 lg8 offset-lg2 v-for="(item, index) in bookings" :key="`bk-${index}`">
                <v-toolbar height="30" :color="item.target_type === 1 ? 'deep-purple' : 'primary'">
                  <v-toolbar-title class="white--text body-2">
                    <v-icon v-if="item.target_type === 1" small class="white--text fa">assessment</v-icon>
                    <v-icon v-else small class="white--text fa">school</v-icon>
                    {{ item.institute }}
                  </v-toolbar-title>
                </v-toolbar>
                <v-card>
                  <v-card-text class="pt-2">
                    <span>
                      <v-icon size="18" class="fa">room_service</v-icon>Service: <span v-html="item.service"></span>
                    </span>
                    <br>
                    <span>
                      <v-icon size="18" class="fa">person</v-icon>Provider: <span v-html="item.provider"></span>
                    </span>
                    <br>
                    <span>
                      <v-icon size="18" class="fa">today</v-icon>Datetime: <span v-html="item.start"></span> to <span v-html="item.end"></span>
                    </span>
                    <br>
                  </v-card-text>
                </v-card>
              </v-flex>
            </v-layout>
          </template>-->
        </v-flex>
      </v-tab-item>
    </v-tabs>
    <AxiosComponent ref="axios" v-on:finish="handleHttpResponse($event)"/>
  </v-flex>
</template>

<script>
export default {
  data() {
    return {
      activeStudentTab: null,
      acSlug: null,
      loading: false,
      flagShowAllBookings: true,
      registrations: [],
      bookings: [],
      pagination: {}
    };
  },
  mounted() {
    this.registrations = this.$store.getters.getRegistrations;
    this.getBookings();
  },
  methods: {
    getBookings() {
      if (!this.loading) {
        this.loading = true;
        this.bookings = [];
        this.flagShowAllBookings = !this.flagShowAllBookings;
        var config = {
          url: "get-my-bookings",
          params: { show_all: this.flagShowAllBookings }
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
          case "get-my-bookings":
            this.bookings = response.data;
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
  computed: {
    btnGetBookingsCaption: function() {
      return this.flagShowAllBookings
        ? "Show incoming bookings"
        : "Show all bookings";
    }
  }
};
</script>

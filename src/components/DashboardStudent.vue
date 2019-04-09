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
                <v-btn flat>
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
                  :to="`/assessment-centre/submitted-forms/${$store.getters.getUserToken}`"
                >
                  <v-icon small class="fa">arrow_forward</v-icon>Registration form
                </v-btn>
                <v-btn
                  flat
                  :to="`/assessment-centre/needs-assessor-report/${$store.getters.getUserToken}`"
                >
                  <v-icon small class="fa">arrow_forward</v-icon>Needs Assessor Report
                </v-btn>
                <v-btn flat>
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
          <VProgress v-if="loading" class="animated fadeIn"/>
          <template v-else>
            <v-layout row wrap class="animated fadeIn">
              <v-flex xs12 v-if="bookings.length === 0">
                <v-card-text class="text-xs-center subheading">No results found</v-card-text>
              </v-flex>
              <v-flex xs12 lg8 offset-lg2>
                <v-toolbar height="30" tabs color="deep-purple">
                  <v-toolbar-title class="white--text body-2">
                    <v-icon small class="white--text fa">school</v-icon>Centre
                  </v-toolbar-title>
                </v-toolbar>
                <v-card>
                  <v-card-text class="pt-2">
                    <span>
                      <v-icon size="18" class="fa">room_service</v-icon>Service:
                    </span>
                    <br>
                    <span>
                      <v-icon size="18" class="fa">person</v-icon>Provider:
                    </span>
                    <br>
                    <span>
                      <v-icon size="18" class="fa">today</v-icon>Datetime:
                    </span>
                    <br>
                  </v-card-text>
                </v-card>
              </v-flex>
              <v-flex xs12 lg8 offset-lg2 v-for="(item, index) in bookings" :key="`bk-${index}`"></v-flex>
            </v-layout>
          </template>
        </v-flex>
      </v-tab-item>
    </v-tabs>
    <AxiosComponent ref="axios" v-on:finish="handleHttpResponse($event)"/>
  </v-flex>
</template>

<script>
import ACCalendar from "@/components/ACCalendar";

export default {
  data() {
    return {
      activeStudentTab: null,
      acSlug: null,
      loading: false,
      flagShowAllBookings: true,
      registrations: [],
      bookings: []
    };
  },
  components: { ACCalendar },
  mounted() {
    this.registrations = this.$store.getters.getRegistrations;
    this.getBookings();
  },
  methods: {
    getBookings() {
      if (!this.loading) {
        this.loading = true;
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

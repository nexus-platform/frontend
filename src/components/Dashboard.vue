<template>
  <v-flex xs12>
    <template v-if="$store.getters.isNA">
      <v-layout row wrap>
        <v-flex xs12 sm6 md4>
          <v-select
            :disabled="loading"
            :items="registrations"
            item-text="name"
            item-value="slug"
            label="Select an Assessment Centre"
            v-model="acSlug"
            @change="getStudentsByAC()"
          ></v-select>
        </v-flex>
      </v-layout>

      <v-data-table
        :headers="[{text: 'Name', value: 'name'}, {text: 'Email', value: 'email'}, {text: 'Actions', value: 'actions'}]"
        :items="items"
        :pagination.sync="pagination"
        :total-items="totalItems"
        :loading="loading"
        class="elevation-0"
        :no-results-text="loading ? 'Loading records' : 'No matching records found'"
        :no-data-text="loading ? 'Loading records' : 'No matching records found'"
      >
        <template slot="items" slot-scope="props">
          <td class="text-xs-left">{{ props.item.name }}</td>
          <td class="text-xs-left">{{ props.item.email }}</td>
          <td class="text-xs-left">
            <v-tooltip bottom color="black">
              <v-btn
                @click="redirect(props.item.token)"
                small
                flat
                slot="activator"
                class="btn-sm"
                color="info"
              >
                <v-icon class="fa">person</v-icon>
              </v-btn>
              <span>Student Page</span>
            </v-tooltip>
          </td>
        </template>

        <template slot="progress">
          <v-alert :value="true" class="black--text text-xs-center" color="default">
            <v-progress-circular :width="2" indeterminate class="grey--text mt-3"></v-progress-circular>
          </v-alert>
        </template>
      </v-data-table>
    </template>

    <template v-else-if="$store.getters.isAC">
      <ACCalendar/>
    </template>

    <template v-else-if="$store.getters.isStudent" xs12>
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
          <!--DSA Office tile-->
          <v-layout v-if="registrations.dsa" row wrap>
            <v-flex xs12 sm6 offset-sm3 mb-3>
              <v-card class="elevation-1">
                <v-toolbar dark color="blue">
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
          <!--ACs tiles-->
          <v-layout row wrap v-for="(registration, i) in registrations.ac" :key="`reg-${i}`">
            <v-flex xs12 sm6 offset-sm3 mb-3>
              <v-card class="elevation-1">
                <v-toolbar dark color="deep-purple">
                  <v-icon>assessment</v-icon>
                  <v-toolbar-title
                    style="font-size: 16px;"
                  >Assessment Centre: {{ registration.name }}</v-toolbar-title>
                </v-toolbar>
                <v-container>
                  <v-btn flat :to="`/assessment-centre/submitted-forms/${$store.getters.getUserToken}`">
                    <v-icon small class="fa">arrow_forward</v-icon>Registration form
                  </v-btn>
                  <v-btn flat :to="`/assessment-centre/needs-assessor-report/${$store.getters.getUserToken}`">
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
          <v-flex sm12 lg10 offset-lg1>
            <v-card flat class="text-xs-center mt-3"></v-card>
          </v-flex>
        </v-tab-item>
      </v-tabs>
    </template>

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
      registrations: [],
      items: [],
      totalItems: 0,
      pagination: {}
    };
  },
  components: { ACCalendar },
  watch: {
    pagination: {
      handler() {
        this.getStudentsByAC();
      },
      deep: true
    }
  },
  created() {
    if (this.$store.getters.isNA) {
      this.registrations = this.$store.getters.getRegistrations.ac;
      this.acSlug = this.registrations[0].slug;
    } else {
      this.registrations = this.$store.getters.getRegistrations;
    }
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
    getStudentsByAC() {
      this.loading = true;
      this.items = [];
      var config = {
        url: "get-ac-students",
        params: { slug: this.acSlug }
      };
      this.$refs.axios.submit(config);
    },
    redirect(token) {
      this.$router.push(`/assessment-centre/student/${token}`);
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

<template>
  <v-flex xs12>
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

    <AxiosComponent ref="axios" v-on:finish="handleHttpResponse($event)"/>
  </v-flex>
</template>

<script>
import ACCalendar from "@/components/ACCalendar";

export default {
  data() {
    return {
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
  mounted() {
      this.registrations = this.$store.getters.getRegistrations.ac;
      this.acSlug = this.registrations[0].slug;
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

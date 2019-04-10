<template>
  <v-flex xs12>
    <!--<v-btn class="primary mb-3" :disabled="loading" @click="fetchData()">
      <v-icon size="20" class="fa">autorenew</v-icon>Reload
    </v-btn>-->
    <v-data-table
      :headers="[{text: 'Service', value: 'service'}, {text: 'Provider', value: 'provider'}, {text: 'Date', value: 'start'}, {text: 'Student', value: 'student'}]"
      :items="items"
      :pagination.sync="pagination"
      :total-items="items.length"
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
            <a slot="activator" @click="redirect(props.item.user_token)">
              {{ props.item.student}}
            </a>
            <span>Open Student Page</span>
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
export default {
  data() {
    return {
      loading: false,
      items: [],
      pagination: {}
    };
  },
  watch: {
    pagination: {
      handler() {
        this.fetchData();
      },
      deep: true
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
    fetchData() {
      this.loading = true;
      this.items = [];
      var config = {
        url: "get-upcoming-assessments",
        params: {}
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
          case "get-upcoming-assessments":
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

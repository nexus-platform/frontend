<template>
  <v-layout>
    <v-card-title>
      <strong>My DSA Forms</strong>
      <!--<v-spacer></v-spacer>
      <v-spacer></v-spacer>
      <v-text-field v-model="search" append-icon="search" label="Search" hint="Enter your criteria and press Enter..." single-line v-on:keyup.enter="searchItems"></v-text-field>-->
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
        <td>{{ props.item.pdf_name }}</td>
        <td class="text-xs-left">{{ props.item.created_at }}</td>
        <td class="text-xs-left">{{ props.item.status_desc }}</td>
        <td class="text-xs-left">
          <v-tooltip bottom>
            <v-btn
              @click="editForm(props.item.route)"
              :disabled="!(props.item.status === 0 || props.item.status === 2)"
              small
              flat
              slot="activator"
              class="btn-sm"
              color="success"
            >
              <v-icon small class="fa">edit</v-icon>
            </v-btn>
            <span>Edit</span>
          </v-tooltip>
          <!--<v-tooltip bottom color="black">
            <v-btn
              :disabled="props.item.status !== 0"
              small
              flat
              slot="activator"
              class="btn-sm"
              color="error"
            >
              <v-icon class="fa">delete</v-icon>
            </v-btn>
            <span>Delete</span>
          </v-tooltip>-->
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
          <v-progress-circular :width="2" v-if="loading" indeterminate color="blue-grey"></v-progress-circular>
          <span v-if="!loading">There are no items to display</span>
        </v-alert>
      </template>

      <!--<template slot="footer">
        <td colspan="100%">
          <strong>This is an extra footer</strong>
        </td>
      </template>-->
    </v-data-table>

    <AxiosComponent ref="axios" v-on:finish="handleHttpResponse($event)"/>
  </v-layout>
</template>

<script>
export default {
  data() {
    return {
      search: "",
      totalItems: 0,
      items: [],
      loading: true,
      pagination: {},
      headers: [
        { text: "Name", value: "pdf_name" },
        { text: "Date", value: "created_at" },
        { text: "Status", value: "status" },
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
    editForm(route) {
      this.$router.push(route);
    },
    searchItems() {
      if (!this.loading) {
        this.getDataFromApi();
      }
    },
    getDataFromApi() {
      this.loading = true;

      let config = {
        url: "get-my-dsa-forms",
        params: { search: this.search }
      };
      this.$refs.axios.submit(config);
    },
    handleHttpResponse(event) {
      this.loading = false;

      if (event.data.result.code === 200) {
        var response = event.data.result.response;
        this.operationMessage = response.msg;
        this.operationMessageType = response.code;

        switch (event.url.substring(event.url.lastIndexOf("/") + 1)) {
          case "get-my-dsa-forms":
            const { sortBy, descending, page, rowsPerPage } = this.pagination;
            this.items = response.data;
            this.totalItems = this.items.length;

            if (this.pagination.sortBy) {
              this.items = this.items.sort((a, b) => {
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
              this.items = this.items.slice(
                (page - 1) * rowsPerPage,
                page * rowsPerPage
              );
            }

            break;
          default:
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

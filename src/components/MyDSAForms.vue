<template>
  <v-container class="animated fadeIn" mt-3>
    <v-card-title>
      <strong>My DSA Forms</strong>
      <!--<v-spacer></v-spacer>
      <v-spacer></v-spacer>
      <v-text-field v-model="search" append-icon="search" label="Search" hint="Enter your criteria and press Enter..." single-line v-on:keyup.enter="searchItems"></v-text-field>-->
    </v-card-title>

    <v-data-table :headers="headers" :items="desserts" :pagination.sync="pagination" :total-items="totalDesserts" :loading="loading" class="elevation-0">
      
      <template slot="items" slot-scope="props">
        <td>{{ props.item.pdf_name }}</td>
        <td class="text-xs-left">{{ props.item.created_at }}</td>
        <td class="text-xs-left">{{ props.item.status_desc }}</td>
        <td class="text-xs-left">
          <v-tooltip bottom >
            <v-btn @click="editForm(props.item.route)" :disabled="!(props.item.status === 0 || props.item.status === 2)" small flat slot="activator" class="btn-sm" color="success"><icon name="edit" class="fa"></icon></v-btn>
            <span>Edit</span>
          </v-tooltip>
          <v-tooltip bottom color="black">
            <v-btn :disabled="props.item.status !== 0" small flat slot="activator" class="btn-sm" color="error"><icon name="trash" class="fa"></icon></v-btn>
            <span>Delete</span>
          </v-tooltip>
        </td>
      </template>

      <v-alert slot="no-results" :value="true" class="black--text" color="default">
        Your search for "{{ search }}" found no results.
      </v-alert>

      <template slot="no-data">
        <v-alert :value="true" class="black--text" color="default">
          <v-progress-circular v-if="loading" indeterminate color="blue-grey"></v-progress-circular>
          <span v-if="!loading">There are no items to display</span> 
        </v-alert>
      </template>

      <!--<template slot="footer">
        <td colspan="100%">
          <strong>This is an extra footer</strong>
        </td>
      </template>-->

    </v-data-table>
  </v-container>  
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      search: "",
      totalDesserts: 0,
      desserts: [],
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
    }
  },
  methods: {
    editForm(route) {
      this.$router.push(route);
    },
    searchItems() {
      if (!this.loading) {
        this.getDataFromApi().then(data => {
          this.desserts = data.items;
          this.totalDesserts = data.total;
          this.loading = false;
        });
      }
    },
    getDataFromApi() {
      this.loading = true;
      return new Promise((resolve, reject) => {
        const { sortBy, descending, page, rowsPerPage } = this.pagination;
        let config = {
          headers: { Authorization: "Bearer " + this.$store.state.payload.jwt },
          params: {
            search: this.search
          }
        };
        var that = this;

        axios
          .get(
            this.$store.state.baseUrl +
              "get-my-dsa-forms?XDEBUG_SESSION_START=netbeans-xdebug",
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

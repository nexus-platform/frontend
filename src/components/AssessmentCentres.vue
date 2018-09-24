<template>
  <v-container style="margin-top: 60px;" class="animated fadeIn">
    <v-card>
      <v-card-title>
        <strong>Active Assessment Centers</strong>
        <!--<v-spacer></v-spacer>
        <v-spacer></v-spacer>
        <v-text-field v-model="search" append-icon="search" label="Search" hint="Enter your criteria and press Enter..." single-line v-on:keyup.enter="searchItems"></v-text-field>-->
      </v-card-title>
  
      <v-data-table :rows-per-page-items="[25]" :headers="headers" :items="items" :pagination.sync="pagination" :total-items="totalItems" :loading="loading" class="elevation-1">
        
        <template slot="items" slot-scope="props">
          <td class="text-xs-left">{{ props.item.name }}</td>
          <td class="text-xs-left">{{ props.item.address }}</td>
          <td class="text-xs-left">{{ props.item.manager }}</td>
          <td class="text-xs-left">
            <v-tooltip bottom color="primary">
              <v-btn :to="props.item.route + '/index'" small flat slot="activator" class="btn-sm" color="primary">
                <icon name="arrow-circle-right" class="fa"></icon>
              </v-btn>
              <span>Open page</span>
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
      </v-data-table>

      <v-snackbar :timeout="5000" :bottom="true" :right="true" v-model="snackbar" :color="operationMessageType">
        <icon class="fa" name="info-circle"></icon> {{ operationMessage }}
        <v-btn flat @click.native="snackbar = false"><icon name="times"></icon></v-btn>
      </v-snackbar>

    </v-card>
  </v-container>  
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      search: "",
      totalItems: 0,
      items: [],
      loading: true,
      pagination: {},
      registering: false,
      cancelling: false,
      registerDialog: false,
      cancelRegDialog: false,
      snackbar: false,
      operationMessage: "",
      operationMessageType: "error",
      headers: [
        { text: "Name", value: "name" },
        { text: "Address", value: "address" },
        { text: "Manager", value: "manager" },
        { text: "Actions", value: "actions" }
      ]
    };
  },
  watch: {
    pagination: {
      handler() {
        this.getDataFromApi().then(data => {
          this.items = data.items;
          this.totalItems = data.total;
          this.loading = false;
        });
      },
      deep: true
    }
  },
  created() {
    this.getDataFromApi().then(data => {
      this.items = data.items;
      this.totalItems = data.total;
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
    searchItems() {
      if (!this.loading) {
        this.getDataFromApi().then(data => {
          this.items = data.items;
          this.totalItems = data.total;
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
              "get-active-assessment-centres?XDEBUG_SESSION_START=netbeans-xdebug",
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

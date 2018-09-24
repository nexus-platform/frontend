<template>
    <v-container style="margin-top: 60px;" class="animated fadeIn">
      <v-card>
        <v-card-text class="text-lg-center">
          <a class="forms-list-header">{{message}}</a>
        </v-card-text>
        <v-card-text v-if="loading">
          <v-progress-circular indeterminate color="blue-grey"></v-progress-circular>
        </v-card-text>
        <transition name="slide-fade">
          <v-card-text v-if="!loading">
            <v-layout row v-for="(item) in items" :key="`form-${item.id}`">
              <v-flex lg8 offset-lg2>
                <button class="btn primary" style="padding: 5px; height: auto;">
                  <router-link :to="item.route" class="white--text" style="text-transform: none; text-decoration: none;">
                    <icon name="file-alt" class="white--text"></icon> <span class="white--text"> {{item.name}}</span>
                  </router-link>
                </button>
              </v-flex>
            </v-layout>
          </v-card-text>
        </transition>
        
      </v-card>
    </v-container>
</template>

<script>
import axios from "axios";

export default {
  data: () => ({
    loading: true,
    message: "Loading available forms...",
    show: true,
    items: []
  }),
  mounted() {
    this.getDataFromApi().then(data => {
      this.items = data.items.data;
      this.loading = false;
      this.message = "Available forms: " + this.items.length;
    });
  },
  methods: {
    getDataFromApi() {
      return new Promise((resolve, reject) => {
        var that = this;

        var requestConfig = {
          headers: {
            Authorization: "Bearer " + this.$store.state.payload.jwt
          },
          params: {
            XDEBUG_SESSION_START: "netbeans-xdebug"
          }
        };

        axios
          .get(this.$store.state.baseUrl + "get-dsa-forms", requestConfig)
          .then(function(response) {
            let items = response.data;
            resolve({
              items
            });
          })
          .catch(function(error) {
            let items = {};
            resolve({
              items
            });
          });
      });
    }
  }
};
</script>

<style scoped>
.forms-list-header {
  font-size: 20px;
  text-transform: uppercase;
}
.forms-list-header:hover {
  cursor: default;
}

.slide-fade-enter-active {
  transition: all 1.3s ease;
}
.slide-fade-leave-active {
  transition: all 1.3s cubic-bezier(1, 0.8, 1.3, 1);
}
.slide-fade-enter,
.slide-fade-leave-to {
  transform: translateX(10px);
  opacity: 0;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
.btn {
  margin-bottom: 10px;
  min-width: 100%;
  min-height: 90%;
}
</style>

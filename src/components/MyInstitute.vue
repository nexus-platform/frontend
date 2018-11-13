<template>
    <v-container class="animated fadeIn">
      <v-card class="text-lg-center elevation-0">
        
        <transition name="slide-fade">
          <v-card-text v-if="loading">
            <v-container>
              <icon name="circle-notch" scale=2 spin style="color: gray;"></icon>
            </v-container>
          </v-card-text>
        </transition>

        <transition name="slide-fade">
          <v-container v-if="!loading" class="text-xs-left">
            <v-layout row wrap>
              <v-flex md8>
                <v-text-field v-model="univ_slug" type="text" max="50" outline hint="Choose a unique, easy-to-remember identifier for your Institute" label="Custom Institute Identifier"></v-text-field>
              </v-flex>
            </v-layout>

            <v-layout row wrap>
              <v-flex xs12>
                 <h3 class="mb-3">Customize DSA Forms for your Institute</h3>
              </v-flex>
            </v-layout>

            <v-layout row wrap>
              <v-flex xs12>
                <v-expansion-panel>
                  <v-expansion-panel-content v-for="(item) in dsa_forms" :key="`form-${item.id}`">
                    <div slot="header"><span color="info"><icon name="file-pdf" class="fa"></icon><b>{{item.name}}</b></span></div>
                    <v-card>
                      <v-container>
                        <v-layout row wrap>
                          <v-flex xs12 sm4>
                            <v-checkbox v-model="item.active" label="This form is available"></v-checkbox>
                          </v-flex>
                          <v-flex xs12 sm8>
                            <v-text-field :disabled="!item.active" outline type="text" prepend-icon="edit" v-model="item.slug" hint="This will be the URL available to your institute's students" label="Custom URL" maxlength="50"></v-text-field>
                          </v-flex>
                        </v-layout>
                      </v-container>
                    </v-card>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-flex>
            </v-layout>
          </v-container>
        </transition>
        
        <v-container v-if="!loading">
          <v-btn :disabled="updating" color="info" @click="submit()">
            <icon v-if="updating" class="fa" name="circle-notch" spin></icon>
            <icon v-else class="fa" name="check"></icon>
            Submit
          </v-btn>
        </v-container>

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
  data: () => ({
    loading: true,
    snackbar: false,
    updating: false,
    univ_slug: null,
    message: "Loading your institute information...",
    operationMessageType: "",
    operationMessage: "",
    dsa_forms: []
  }),
  mounted() {
    this.getDataFromApi().then(data => {
      this.operationMessageType = data.items.code;
      this.operationMessage = data.items.msg;
      this.message = data.items.msg;
      this.univ_slug = data.items.data.univ_slug;
      this.dsa_forms = data.items.data.forms;
      this.loading = false;
    });
  },
  methods: {
    submit() {
      if (!this.updating && this.univ_slug) {
        this.updating = true;
        var requestParams = {
          slug: this.univ_slug,
          data: this.dsa_forms
        };
        var requestConfig = {
          headers: { Authorization: "Bearer " + this.$store.state.payload.jwt }
        };
        var that = this;
        axios
          .post(
            this.$store.state.baseUrl +
              "set-institute-info?XDEBUG_SESSION_START=netbeans-xdebug",
            requestParams,
            requestConfig
          )
          .then(function(response) {
            that.updating = false;
            that.operationMessage = response.data.msg;
            that.operationMessageType = response.data.code;
            that.snackbar = true;
          })
          .catch(function(error) {
            that.updating = false;
            that.operationMessage =
              "There was an error on the remote endpoint. Try again later.";
            that.operationMessageType = "error";
            that.snackbar = true;
          });
      } else {
        if (!this.univ_slug) {
          that.operationMessage = "Your institute identifier cannot be null.";
          that.operationMessageType = "error";
          that.snackbar = true;
        }
      }
    },
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
          .get(
            this.$store.state.baseUrl + "get-my-institute-info",
            requestConfig
          )
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

<template>
  <v-layout row wrap>
    <v-flex xs12 sm12 md12 lg12>
      <v-navigation-drawer
        class="hidden-md-and-up"
        v-model="drawer"
        :mini-variant="drawerMini"
        absolute
        temporary
      >
        <v-list class="pa-1">
          <v-list-tile-action v-if="drawerMini">
            <v-btn icon @click.stop="drawerMini = !drawerMini">
              <v-icon>chevron_right</v-icon>
            </v-btn>
          </v-list-tile-action>
          <v-list-tile avatar tag="div">
            <v-list-tile-avatar>
              <img :src="require('../assets/img/logo_text.png')" alt="Nexus">
            </v-list-tile-avatar>

            <v-list-tile-content>
              <v-list-tile-title>Nexus</v-list-tile-title>
            </v-list-tile-content>

            <v-list-tile-action v-if="!drawerMini">
              <v-btn icon @click.stop="drawerMini = !drawerMini">
                <v-icon>chevron_left</v-icon>
              </v-btn>
            </v-list-tile-action>
          </v-list-tile>
        </v-list>

        <v-list class="pt-0" dense>
          <v-divider light></v-divider>

          <template v-if="$store.getters.isGuest">
            <v-list-tile :to="$store.state.homeUrl">
              <v-list-tile-action>
                <v-icon>lock</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>Login</v-list-tile-content>
            </v-list-tile>
          </template>

          <template v-else>
            <template v-if="$store.getters.isStudent">
              <v-list-tile :to="`${$store.state.homeUrl}/dsa-forms/index`">
                <v-list-tile-action>
                  <v-icon>picture_as_pdf</v-icon>
                </v-list-tile-action>
                <v-list-tile-content>DSA Forms</v-list-tile-content>
              </v-list-tile>
            </template>

            <v-list-tile to="/my-profile">
              <v-list-tile-action>
                <v-icon>account_circle</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>My Profile</v-list-tile-content>
            </v-list-tile>

            <v-list-tile v-on:click="logout()">
              <v-list-tile-action>
                <v-icon>power_settings_new</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>Log out</v-list-tile-content>
            </v-list-tile>
          </template>
        </v-list>
      </v-navigation-drawer>

      <v-toolbar class="indigo animated slideInDown" fixed>
        <v-toolbar-side-icon @click.stop="drawer = !drawer" class="white--text hidden-md-and-up"></v-toolbar-side-icon>

        <v-toolbar-title class="white--text">
          <router-link to="/" tag="span" style="cursor: pointer">
            <img :src="require('../assets/img/logo_text.png')" alt="Nexus">
          </router-link>
        </v-toolbar-title>

        <v-spacer></v-spacer>

        <v-toolbar-items class="hidden-sm-and-down">
          <template v-if="!$store.getters.isGuest">
            <v-btn flat to="/dashboard">
              <v-icon class="white--text">dashboard</v-icon>
              <span class="white--text">Dashboard</span>
            </v-btn>

            <template
              v-if="($store.getters.isStudent && $store.getters.getRegistrations.dsa) || $store.getters.isDO"
            >
              <v-menu offset-y transition="fade-transition" bottom>
                <v-btn class="white--text" flat slot="activator">
                  <v-icon class="fa">school</v-icon>
                  <span class="white--text">DSA Office</span>
                </v-btn>
                <v-list v-if="$store.getters.isStudent">
                  <v-list-tile
                    :to="`/dsa/${$store.getters.getRegistrations.dsa.slug}/dsa-forms/index`"
                    class="dropdown-menu-item"
                  >
                    <v-icon class="fa">picture_as_pdf</v-icon>
                    <span>DSA Forms</span>
                  </v-list-tile>
                  <v-list-tile
                    :to="`/dsa/${$store.getters.getRegistrations.dsa.slug}/my-dsa-forms/index`"
                    class="dropdown-menu-item"
                  >
                    <v-icon class="fa">picture_as_pdf</v-icon>
                    <span>In-progress forms</span>
                  </v-list-tile>
                </v-list>
                <v-list v-else-if="$store.getters.isDO">
                  <v-list-tile
                    v-if="$store.getters.getIsUnivManager"
                    :to="`/dsa/${$store.getters.getRegistrations.dsa.slug}/admin`"
                    class="dropdown-menu-item"
                  >
                    <v-icon class="fa">settings</v-icon>Manage
                  </v-list-tile>
                  <v-list-tile
                    :to="`/dsa/${$store.getters.getRegistrations.dsa.slug}/submitted-forms`"
                    class="dropdown-menu-item"
                  >
                    <v-icon class="fa">mail</v-icon>In-progress forms
                  </v-list-tile>
                </v-list>
              </v-menu>
            </template>

            <template
              v-if="($store.getters.isAC || $store.getters.isStudent || $store.getters.isNA)"
            >
              <v-menu
                v-if="$store.getters.getRegistrations.ac"
                offset-y
                transition="fade-transition"
                bottom
              >
                <v-btn class="white--text" flat slot="activator">
                  <v-icon class="fa">assessment</v-icon>
                  <span class="white--text">Assessment Centre</span>
                </v-btn>
                <v-list>
                  <v-list-tile to="/assessment-centre/calendar" class="dropdown-menu-item">
                    <v-icon class="fa">today</v-icon>
                    <span>{{ $store.getters.isStudent ? 'Bookings' : 'Calendar' }}</span>
                  </v-list-tile>
                  <v-list-tile
                    v-if="$store.getters.isAC"
                    to="/assessment-centre/submitted-forms"
                    class="dropdown-menu-item"
                  >
                    <v-icon class="fa">insert_drive_file</v-icon>
                    <span>Submitted Forms</span>
                  </v-list-tile>
                  <v-list-tile
                    v-if="$store.getters.isAC"
                    to="/assessment-centre/students"
                    class="dropdown-menu-item"
                  >
                    <v-icon class="fa">person</v-icon>
                    <span>Students</span>
                  </v-list-tile>
                  <v-list-tile
                    v-if="$store.getters.isAC || $store.getters.isNA"
                    to="/assessment-centre/settings"
                    class="dropdown-menu-item"
                  >
                    <v-icon class="fa">settings</v-icon>
                    <span>Settings</span>
                  </v-list-tile>

                  <v-list-tile
                    v-if="$store.getters.isAC"
                    to="/assessment-centre/services"
                    class="dropdown-menu-item"
                  >
                    <v-icon class="fa">room_service</v-icon>
                    <span>Services</span>
                  </v-list-tile>

                  <v-list-tile
                    v-if="$store.getters.isAC"
                    to="/assessment-centre/needs-assessors"
                    class="dropdown-menu-item"
                  >
                    <v-icon class="fa">assignment_ind</v-icon>
                    <span>Needs Assessors</span>
                  </v-list-tile>
                </v-list>
              </v-menu>
            </template>

            <v-menu offset-y bottom :close-on-content-click="false">
              <template v-slot:activator="{ on }">
                <v-btn color="primary" class="white--text" flat v-on="on">
                  <v-badge
                    id="badge_notif"
                    ref="badge_notif"
                    v-model="showNotificationsCount"
                    color="red"
                  >
                    <span slot="badge">{{ notificationsCount }}</span>
                    <v-icon v-if="notificationsCount > 0" medium color="white">notifications_active</v-icon>
                    <v-icon v-else medium color="white">notifications_none</v-icon>
                  </v-badge>
                </v-btn>
              </template>

              <v-list class="general-notif-container">
                <v-tabs
                  v-model="tabs"
                  fixed-tabs
                  icons-and-text
                  color="transparent"
                  slider-color="primary"
                >
                  <v-tab href="#notifications-list" class="primary--text">Notifications
                    <v-icon>notifications_none</v-icon>
                  </v-tab>
                  <v-tab href="#activities-list" class="primary--text">Activities
                    <v-icon>alarm</v-icon>
                  </v-tab>
                </v-tabs>

                <v-tabs-items v-model="tabs" class="white animated fadeIn">
                  <v-tab-item value="notifications-list">
                    <v-card class="elevation-0">
                      <template v-if="notifications.length === 0">
                        <v-card-text>
                          <v-list-tile-content>
                            <v-list-tile-title class="text-xs-center info--text">
                              <v-icon small class="info--text fa">warning</v-icon>No items found
                            </v-list-tile-title>
                          </v-list-tile-content>
                        </v-card-text>
                      </template>

                      <template v-else>
                        <div v-for="(item, index) in notifications" :key="`notif-${index}`">
                          <v-container
                            class="text-xs-left notif-container"
                            :class="selectedNotifications.indexOf(index) >= 0 ? 'selected' : ''"
                          >
                            <v-layout row wrap>
                              <v-flex xs12>
                                <v-layout row wrap>
                                  <v-flex xs12 @click="selectNotification(index)">
                                    <span class="primary--text notif-title" v-html="item.title"></span>
                                    <a class="notif-dismiss" @click="deleteNotification(index)">
                                      <v-tooltip left>
                                        <v-progress-circular
                                          size="15"
                                          :width="2"
                                          v-if="item.deleting"
                                          indeterminate
                                          color="primary"
                                          slot="activator"
                                          class="red--text"
                                        ></v-progress-circular>
                                        <v-icon
                                          small
                                          v-else
                                          slot="activator"
                                          class="red--text"
                                        >delete</v-icon>
                                        <span>Remove</span>
                                      </v-tooltip>
                                    </a>
                                    <v-tooltip
                                      left
                                      v-if="selectedNotifications.indexOf(index) >= 0"
                                      class="red--text notif-check"
                                    >
                                      <v-icon small slot="activator">check_box</v-icon>
                                      <span>Unselect</span>
                                    </v-tooltip>
                                    <v-tooltip left v-else class="grey--text notif-check">
                                      <v-icon small slot="activator">check_box_outline_blank</v-icon>
                                      <span>Select</span>
                                    </v-tooltip>
                                  </v-flex>
                                </v-layout>
                                <v-layout row wrap>
                                  <v-flex xs6>
                                    <span class="notif-text grey--text">
                                      <v-icon small>today</v-icon>
                                      <span v-html="item.created_at"></span>
                                    </span>
                                  </v-flex>
                                  <v-flex xs6>
                                    <span style="float:right;" class="notif-text grey--text">
                                      <i v-html="item.headline"></i>
                                      <i v-html="' ago'"></i>
                                    </span>
                                  </v-flex>
                                </v-layout>
                                <v-layout row wrap>
                                  <v-flex xs12 class="notif-content">
                                    <span v-html="item.subtitle"></span>
                                  </v-flex>
                                </v-layout>
                              </v-flex>
                            </v-layout>
                          </v-container>
                          <v-divider :key="`notif-divider-${index}`"></v-divider>
                        </div>

                        <v-list-tile>
                          <v-list-tile-content>
                            <v-layout>
                              <v-flex lg6>
                                <v-btn small flat color="info" style="margin-top: 10px;">
                                  <v-icon small class="fa">room_service</v-icon>View all
                                </v-btn>
                              </v-flex>
                            </v-layout>
                          </v-list-tile-content>
                          <v-list-tile-action>
                            <v-layout row>
                              <v-flex lg12>
                                <v-btn
                                  @click="deleteNotifications()"
                                  small
                                  :disabled="selectedNotifications.length < 1 || deletingNotifications"
                                  color="error"
                                >
                                  <v-progress-circular
                                    size="15"
                                    :width="2"
                                    v-if="deletingNotifications"
                                    indeterminate
                                    color="gray"
                                    class="white--text"
                                  ></v-progress-circular>
                                  <v-icon size="large" v-else>notifications_off</v-icon>
                                </v-btn>
                              </v-flex>
                            </v-layout>
                          </v-list-tile-action>
                        </v-list-tile>
                      </template>
                    </v-card>
                  </v-tab-item>

                  <v-tab-item value="activities-list">
                    <v-card class="elevation-0">
                      <template v-if="activities.length === 0">
                        <v-card-text>
                          <v-list-tile-content>
                            <v-list-tile-title class="text-xs-center info--text">
                              <v-icon small class="info--text fa">warning</v-icon>No items found
                            </v-list-tile-title>
                          </v-list-tile-content>
                        </v-card-text>
                      </template>

                      <template v-else>
                        <div v-for="(item, index) in activities" :key="`activ-${index}`">
                          <v-container
                            class="text-xs-left notif-container"
                            :class="selectedActivities.indexOf(index) >= 0 ? 'selected' : ''"
                          >
                            <v-layout row wrap>
                              <v-flex xs12>
                                <v-layout row wrap>
                                  <v-flex xs12 @click="selectActivity(index)">
                                    <span class="primary--text notif-title" v-html="item.title"></span>
                                    <a class="notif-dismiss" @click="deleteActivity(index)">
                                      <v-tooltip bottom>
                                        <v-progress-circular
                                          size="15"
                                          :width="2"
                                          v-if="item.deleting"
                                          indeterminate
                                          color="primary"
                                          slot="activator"
                                          class="red--text"
                                        ></v-progress-circular>
                                        <v-icon
                                          small
                                          v-else
                                          slot="activator"
                                          class="red--text"
                                        >delete</v-icon>
                                        <span>Remove</span>
                                      </v-tooltip>
                                    </a>
                                    <v-tooltip
                                      bottom
                                      v-if="selectedActivities.indexOf(index) >= 0"
                                      class="red--text notif-check"
                                    >
                                      <v-icon small slot="activator">check_box</v-icon>
                                      <span>Unselect</span>
                                    </v-tooltip>
                                    <v-tooltip bottom v-else class="grey--text notif-check">
                                      <v-icon small slot="activator">check_box_outline_blank</v-icon>
                                      <span>Select</span>
                                    </v-tooltip>
                                  </v-flex>
                                </v-layout>
                                <v-layout row wrap>
                                  <v-flex xs6>
                                    <span class="notif-text grey--text">
                                      <v-icon small>today</v-icon>
                                      <span v-html="item.created_at"></span>
                                    </span>
                                  </v-flex>
                                  <v-flex xs6>
                                    <span style="float:right;" class="notif-text grey--text">
                                      <i v-html="item.headline"></i>
                                      <i v-html="' ago'"></i>
                                    </span>
                                  </v-flex>
                                </v-layout>
                                <v-layout row wrap>
                                  <v-flex xs12 class="notif-content">
                                    <span v-html="item.subtitle"></span>
                                  </v-flex>
                                </v-layout>
                              </v-flex>
                            </v-layout>
                          </v-container>
                          <v-divider :key="`notif-divider-${index}`"></v-divider>
                        </div>

                        <v-list-tile>
                          <v-list-tile-content>
                            <v-layout row>
                              <v-flex lg6>
                                <v-btn small flat color="info" style="margin-top: 10px;">
                                  <v-icon class="fa">room_service</v-icon>
                                </v-btn>
                              </v-flex>
                            </v-layout>
                          </v-list-tile-content>
                          <v-list-tile-action>
                            <v-layout row>
                              <v-flex lg12>
                                <v-btn
                                  @click="deleteActivities()"
                                  small
                                  :disabled="selectedActivities.length < 1 || deletingActivities"
                                  color="error"
                                >
                                  <v-progress-circular
                                    size="15"
                                    :width="2"
                                    v-if="deletingActivities"
                                    indeterminate
                                    color="gray"
                                    class="white--text fa"
                                  ></v-progress-circular>
                                  <v-icon small v-else>alarm_off</v-icon>
                                </v-btn>
                              </v-flex>
                            </v-layout>
                          </v-list-tile-action>
                        </v-list-tile>
                      </template>
                    </v-card>
                  </v-tab-item>
                </v-tabs-items>
              </v-list>
            </v-menu>

            <v-menu offset-y transition="fade-transition" bottom>
              <v-btn color="primary" class="white--text" flat slot="activator">
                <v-icon class="white--text">account_circle</v-icon>
                <span class="white--text">My Account</span>
              </v-btn>
              <v-list>
                <v-list-tile v-if="$store.getters.isDO" to="/my-profile" class="dropdown-menu-item">
                  <v-icon class="fa">person</v-icon>
                  <span>My Profile</span>
                </v-list-tile>

                <v-list-tile
                  :disabled="loggingOut"
                  v-on:click="logout()"
                  class="dropdown-menu-item"
                >
                  <v-progress-circular
                    small
                    :width="2"
                    v-if="loggingOut"
                    indeterminate
                    color="primary"
                    class="red--text fa"
                  ></v-progress-circular>
                  <v-icon v-else class="fa">power_settings_new</v-icon>
                  <span>Log out</span>
                </v-list-tile>
              </v-list>
            </v-menu>
          </template>
        </v-toolbar-items>
      </v-toolbar>

      <v-snackbar
        :timeout="10000"
        :bottom="true"
        :right="true"
        v-model="snackbar"
        :color="operationMessageType"
      >
        <v-icon small class="white--text fa">info</v-icon>
        {{ operationMessage }}
        <v-btn flat @click.native="snackbar = false">
          <v-icon>close</v-icon>
        </v-btn>
      </v-snackbar>
    </v-flex>

    <AxiosComponent ref="axios" v-on:finish="handleHttpResponse($event)"/>
  </v-layout>
</template>

<script>
import classList from "classlist";
import { mapGetters } from "vuex";

export default {
  data() {
    return {
      drawerMini: false,
      drawer: false,
      loggingOut: false,
      loadingNotifications: false,
      deletingNotifications: false,
      deletingActivities: false,
      showNotificationsCount: false,
      notificationsCount: 0,
      selectedNotifications: [],
      selectedActivities: [],
      operationMessage: "",
      operationMessageType: "error",
      snackbar: false,
      notifications: [],
      activities: [],
      audioPlayer: null,
      tabs: null,
      text:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
    };
  },
  mounted() {
    this.toggleGetNotifications(this.$store.getters.isGuest);
    this.$store.watch(
      (state, getters) => getters.isGuest,
      (newValue, oldValue) => {
        this.toggleGetNotifications(newValue);
      }
    );
  },
  methods: {
    toggleGetNotifications(isGuest) {
      this.clearNotifications();
      if (isGuest) {
        clearInterval(this.timer);
      } else {
        this.updateNotifications();
        this.timer = setInterval(this.updateNotifications, 5000);
      }
    },
    initAudioPlayer() {
      if (!this.audioPlayer) {
        this.audioPlayer = new Audio(this.$store.getters.getBeepFile);
      }
    },
    playNotifSound() {
      this.initAudioPlayer();
      this.audioPlayer.play();
    },
    updateNotifications() {
      if (
        !this.$store.getters.isGuest &&
        !this.loadingNotifications &&
        !this.deletingNotifications &&
        !this.deletingActivities
      ) {
        this.getNotifications();
      }
    },
    handleHttpResponse(event) {
      this.loading = false;

      if (event.data.result.code === 200) {
        let response = event.data.result.response;
        this.operationMessage = response.msg;
        this.operationMessageType = response.code;
        let action = event.url.substring(event.url.lastIndexOf("/") + 1);

        switch (action) {
          case "get-notifications":
            this.loadingNotifications = false;

            if (response.code === "success") {
              let newNotifications = response.data.notif.items;
              let notifsCount = response.data.notif.count;
              let newActivities = response.data.activ.items;
              let activsCount = response.data.activ.count;

              var newNotif = false;
              for (var i in newNotifications) {
                var newNotification = newNotifications[i];
                var notifIndex = -1;
                for (var j in this.notifications) {
                  if (this.notifications[j].id === newNotification.id) {
                    notifIndex = j;
                    break;
                  }
                }
                if (notifIndex < 0) {
                  this.notifications.push(newNotification);
                  newNotif = true;
                  this.showNotificationsCount = true;
                } else {
                  this.notifications[notifIndex].headline =
                    newNotification.headline;
                }
              }
              if (newNotif) {
                this.notifications.sort(function(a, b) {
                  return b.id - a.id;
                });
                if (!this.$store.getters.isGuest) {
                  this.playNotifSound();
                  var badge_notif = document.getElementById("badge_notif");
                  var list = classList(badge_notif);
                  list.add("animated");
                  list.add("rubberBand");
                }
              }

              var newActiv = false;
              for (var i in newActivities) {
                var newActivity = newActivities[i];
                var activIndex = -1;
                for (var j in this.activities) {
                  if (this.activities[j].id === newActivity.id) {
                    activIndex = j;
                    break;
                  }
                }
                if (activIndex < 0) {
                  this.activities.push(newActivity);
                  newActiv = true;
                  this.showNotificationsCount = true;
                } else {
                  this.activities[activIndex].headline = newActivity.headline;
                }
              }
              if (newActiv) {
                this.activities.sort(function(a, b) {
                  return b.id - a.id;
                });
              }
              this.notificationsCount =
                this.notifications.length + this.activities.length;
            } else {
              this.snackbar = true;
            }
            break;
          case "delete-notifications":
          case "delete-activities":
            if (action === "delete-notifications") {
              this.deletingNotifications = false;
              this.selectedNotifications = [];
            } else {
              this.deletingActivities = false;
              this.selectedActivities = [];
            }
            if (response.code === "success") {
              this.notifications = response.data.notif.items;
              this.activities = response.data.activ.items;
              this.notificationsCount =
                response.data.notif.count + response.data.activ.count;
              this.showNotificationsCount = this.notificationsCount > 0;
            } else {
              this.snackbar = true;
            }
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
    },
    deleteActivity(index) {
      this.activities[index].deleting = true;
      this.selectActivity(index);
      this.deleteActivities();
    },
    deleteActivities() {
      this.deletingActivities = true;
      let params = [];
      this.selectedActivities.forEach(element => {
        params.push(this.activities[element].id);
      });
      let config = {
        method: "post",
        url: "delete-activities",
        params: { data: params }
      };
      this.$refs.axios.submit(config);
    },
    deleteNotification(index) {
      this.notifications[index].deleting = true;
      this.selectNotification(index);
      this.deleteNotifications();
    },
    deleteNotifications() {
      this.deletingNotifications = true;
      let params = [];
      this.selectedNotifications.forEach(element => {
        params.push(this.notifications[element].id);
      });
      let config = {
        method: "post",
        url: "delete-notifications",
        params: { data: params }
      };
      this.$refs.axios.submit(config);
    },
    selectNotification(index) {
      const i = this.selectedNotifications.indexOf(index);
      if (i > -1) {
        this.selectedNotifications.splice(i, 1);
      } else {
        this.selectedNotifications.push(index);
      }
    },
    selectActivity(index) {
      const i = this.selectedActivities.indexOf(index);
      if (i > -1) {
        this.selectedActivities.splice(i, 1);
      } else {
        this.selectedActivities.push(index);
      }
    },
    getNotifications() {
      this.loadingNotifications = true;
      let config = {
        url: "get-notifications",
        params: {}
      };
      this.$refs.axios.submit(config);
    },
    clearNotifications() {
      this.notifications = [];
      this.activities = [];
      this.notificationsCount = 0;
      this.showNotificationsCount = false;
      this.selectedNotifications = [];
      this.selectedActivities = [];
    },
    logout() {
      clearInterval(this.timer);
      /*let config = {
        api: "ea",
        url: "user/logout",
        params: {}
      };
      this.$refs.axios.submit(config);*/
      let redirect = this.$store.getters.isStudent
        ? `${this.$store.getters.getHomeUrl}/login`
        : "/auth/login";
      this.$store.commit("logout");
      this.$router.push(redirect);
    }
  },
  computed: {
    notificationsCountClass() {
      return this.showNotificationsCount ? "animated rubberBand" : "";
    }
  } /*,
  watch: {
    isGuest: function(newValue, oldValue) {
      this.clearNotifications();
      if (!newValue) {
        this.timer = setInterval(this.updateNotifications, 15000);
      }
    }
  }*/
};
</script>

<style scoped>
a {
  text-decoration: none;
}
.white--text {
  margin-left: 5px;
}
.dropdown-menu-item:hover {
  color: #fff;
  background-color: #3f51b5;
}
.bold {
  font-weight: bold;
}
.not-bold {
  font-weight: normal;
}
.general-notif-container {
  padding: 0 7px;
  min-width: 360px;
  max-width: 360px;
  max-height: 400px;
  overflow-y: scroll;
  background-color: #fff;
  border: 4px solid #ddd;
}
.notif-container {
  padding: 5px;
  margin-bottom: 5px;
  font-size: 12px;
}
.selected {
  background-color: #fce8e6;
}
.notif-title {
  font-weight: bold;
}
.notif-title,
.notif-check {
  cursor: pointer;
}
.notif-check {
  position: absolute;
  margin-top: 3px;
  right: 5px;
}
.notif-dismiss {
  position: absolute;
  margin-top: 3px;
  right: 25px;
}
::-webkit-scrollbar {
  width: 7px !important;
}
.v-toolbar__items .v-btn--active {
  background-color: #3848a0;
}
</style>

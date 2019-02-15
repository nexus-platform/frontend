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
              <img src="static/img/logo_color.png">
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

          <template v-if="isGuest">
            <v-list-tile :to="$store.state.homeUrl">
              <v-list-tile-action>
                <v-icon>lock</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>Login</v-list-tile-content>
            </v-list-tile>
          </template>

          <template v-else>
            <template v-if="isStudent">
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
            <img src="static/img/logo_text.png">
          </router-link>
        </v-toolbar-title>

        <v-spacer></v-spacer>

        <v-toolbar-items class="hidden-sm-and-down">
          <template v-if="!isGuest">

            <v-btn flat :to="isNA || isAC ? '/assessment-centre/calendar' : `${this.$store.state.homeUrl}/index`">
              <v-icon class="white--text">today</v-icon>
              <span class="white--text">Calendar</span>
            </v-btn>

            <v-btn flat to="/dashboard">
              <v-icon class="white--text">dashboard</v-icon>
              <span class="white--text">Dashboard</span>
            </v-btn>

            <template v-if="$store.state.authType === 'dsa'">
              <v-menu offset-y transition="fade-transition" bottom>
                <v-btn class="white--text" flat slot="activator">
                  <v-icon class="menu-icon">school</v-icon>
                  <span class="white--text">DSA Office</span>
                </v-btn>
                <v-list v-if="isStudent">
                  <v-list-tile
                    :to="`${$store.state.homeUrl}/dsa-forms/index`"
                    class="dropdown-menu-item"
                  >
                    <v-icon class="menu-icon">picture_as_pdf</v-icon>
                    <span>DSA Forms</span>
                  </v-list-tile>
                  <v-list-tile
                    :to="`${$store.state.homeUrl}/my-dsa-forms/index`"
                    class="dropdown-menu-item"
                  >
                    <v-icon class="menu-icon">picture_as_pdf</v-icon>
                    <span>My Forms</span>
                  </v-list-tile>
                </v-list>
                <v-list v-else-if="isDO">
                  <v-list-tile
                    v-if="$store.state.payload.is_univ_manager"
                    :to="`${$store.state.homeUrl}/admin`"
                    class="dropdown-menu-item"
                  >
                    <v-icon class="menu-icon">fas fa-cog</v-icon>Manage
                  </v-list-tile>
                  <v-list-tile
                    :to="`${$store.state.homeUrl}/submitted-forms`"
                    class="dropdown-menu-item"
                  >
                    <v-icon class="menu-icon">mail</v-icon>In-progress forms
                  </v-list-tile>
                </v-list>
              </v-menu>
            </template>

            <template v-if="/*$store.state.authType === 'ac' &&*/ (isAC || isStudent)">
              <v-menu offset-y transition="fade-transition" bottom>
                <v-btn class="white--text" flat slot="activator">
                  <v-icon class="menu-icon">assessment</v-icon>
                  <span class="white--text">Assessment Centre</span>
                </v-btn>
                <v-list>
                  <v-list-tile to="/assessment-centre/ac-forms" class="dropdown-menu-item">
                    <v-icon class="menu-icon">insert_drive_file</v-icon>
                    <span>{{isAC ? 'Assessment Forms' : 'My Assessment Form'}}</span>
                  </v-list-tile>
                </v-list>
              </v-menu>

              <template v-if="isAC">
                <v-btn flat to="/assessment-centre/customers">
                  <v-icon class="white--text">person</v-icon>
                  <span class="white--text">Students</span>
                </v-btn>
              </template>
            </template>
            
            <v-menu offset-y transition="slide-down" bottom :close-on-content-click="false">
              <v-btn color="primary" class="white--text" flat slot="activator">
                <v-badge
                  id="badge_notif"
                  ref="badge_notif"
                  v-model="showNotificationsCount"
                  color="red"
                >
                  <span slot="badge">{{notificationsCount}}</span>
                  <v-icon v-if="notificationsCount > 0" medium color="white">notifications_active</v-icon>
                  <v-icon v-else medium color="white">notifications_none</v-icon>
                </v-badge>
              </v-btn>

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

                <v-tabs-items v-model="tabs" class="white">
                  <v-tab-item id="notifications-list">
                    <v-card>
                      <template v-if="notifications.length === 0">
                        <v-card-text>
                          <v-list-tile-content>
                            <v-list-tile-title class="text-xs-center info--text">
                              <icon name="info-circle" class="fa"></icon>No items found
                            </v-list-tile-title>
                          </v-list-tile-content>
                        </v-card-text>
                      </template>

                      <template v-else>
                        <div v-for="(item, index) in notifications" :key="`N-${index}`">
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
                                        <icon
                                          v-if="item.deleting"
                                          slot="activator"
                                          name="circle-notch"
                                          spin
                                          class="red--text"
                                        ></icon>
                                        <icon
                                          v-else
                                          slot="activator"
                                          name="times"
                                          class="red--text"
                                        ></icon>
                                        <span>Remove</span>
                                      </v-tooltip>
                                    </a>
                                    <v-tooltip
                                      left
                                      v-if="selectedNotifications.indexOf(index) >= 0"
                                      class="red--text notif-check"
                                    >
                                      <icon slot="activator" name="check-square"></icon>
                                      <span>Unselect</span>
                                    </v-tooltip>
                                    <v-tooltip left v-else class="grey--text notif-check">
                                      <icon slot="activator" name="square"></icon>
                                      <span>Select</span>
                                    </v-tooltip>
                                  </v-flex>
                                </v-layout>
                                <v-layout row wrap>
                                  <v-flex xs6>
                                    <span class="notif-text grey--text">
                                      <icon class="fa" name="calendar-alt"></icon>
                                      <span v-html="item.created_at"></span>
                                    </span>
                                  </v-flex>
                                  <v-flex xs6>
                                    <span style="float:right;" class="notif-text grey--text">
                                      <i>
                                        <span v-html="item.headline"></span> ago
                                      </i>
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
                                  <icon name="bell" class="fa"></icon>View all
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
                                  <icon
                                    v-if="deletingNotifications"
                                    name="circle-notch"
                                    class="fa"
                                    spin
                                  ></icon>
                                  <v-icon size="large" v-else>notifications_off</v-icon>
                                </v-btn>
                              </v-flex>
                            </v-layout>
                          </v-list-tile-action>
                        </v-list-tile>
                      </template>
                    </v-card>
                  </v-tab-item>

                  <v-tab-item id="activities-list">
                    <v-card>
                      <template v-if="activities.length === 0">
                        <v-card-text>
                          <v-list-tile-content>
                            <v-list-tile-title class="text-xs-center info--text">
                              <icon name="info-circle" class="fa"></icon>No items found
                            </v-list-tile-title>
                          </v-list-tile-content>
                        </v-card-text>
                      </template>

                      <template v-else>
                        <div v-for="(item, index) in activities" :key="`N-${index}`">
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
                                      <v-tooltip left>
                                        <icon
                                          v-if="item.deleting"
                                          slot="activator"
                                          name="circle-notch"
                                          spin
                                          class="red--text"
                                        ></icon>
                                        <icon
                                          v-else
                                          slot="activator"
                                          name="times"
                                          class="red--text"
                                        ></icon>
                                        <span>Remove</span>
                                      </v-tooltip>
                                    </a>
                                    <v-tooltip
                                      left
                                      v-if="selectedActivities.indexOf(index) >= 0"
                                      class="red--text notif-check"
                                    >
                                      <icon slot="activator" name="check-square"></icon>
                                      <span>Unselect</span>
                                    </v-tooltip>
                                    <v-tooltip left v-else class="grey--text notif-check">
                                      <icon slot="activator" name="square"></icon>
                                      <span>Select</span>
                                    </v-tooltip>
                                  </v-flex>
                                </v-layout>
                                <v-layout row wrap>
                                  <v-flex xs6>
                                    <span class="notif-text grey--text">
                                      <icon class="fa" name="calendar-alt"></icon>
                                      <span v-html="item.created_at"></span>
                                    </span>
                                  </v-flex>
                                  <v-flex xs6>
                                    <span style="float:right;" class="notif-text grey--text">
                                      <i>
                                        <span v-html="item.headline"></span> ago
                                      </i>
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
                                  <icon name="bell" class="fa"></icon>View all
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
                                  <icon
                                    v-if="deletingActivities"
                                    name="circle-notch"
                                    class="fa"
                                    spin
                                  ></icon>
                                  <v-icon size="large" v-else>alarm_off</v-icon>
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
                <v-list-tile to="/my-profile" class="dropdown-menu-item">
                  <v-icon class="menu-icon">person</v-icon>
                  <span>My Profile</span>
                </v-list-tile>

                <v-list-tile v-if="isNA || isAC" to="/assessment-centre/settings" class="dropdown-menu-item">
                  <v-icon class="menu-icon">settings</v-icon>
                  <span>Settings</span>
                </v-list-tile>

                <v-list-tile v-if="isAC" to="/assessment-centre/services" class="dropdown-menu-item">
                  <v-icon class="menu-icon">room_service</v-icon>
                  <span>Services</span>
                </v-list-tile>

                <v-list-tile v-if="isAC" to="/assessment-centre/users" class="dropdown-menu-item">
                  <v-icon class="menu-icon">assignment_ind</v-icon>
                  <span>Assessors</span>
                </v-list-tile>

                <v-divider></v-divider>

                <v-list-tile
                  :disabled="loggingOut"
                  v-on:click="logout()"
                  class="dropdown-menu-item"
                >
                  <icon v-if="loggingOut" class="menu-icon fa" name="circle-notch" spin></icon>
                  <v-icon v-else class="menu-icon">power_settings_new</v-icon>
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
        <icon class="fa" name="info-circle"></icon>
        {{ operationMessage }}
        <v-btn flat @click.native="snackbar = false">
          <icon name="times"></icon>
        </v-btn>
      </v-snackbar>
    </v-flex>
  </v-layout>
</template>

<script>
import axios from "axios";
import classList from "classlist";

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
    this.updateNotifications();
    this.timer = setInterval(this.updateNotifications, 3000);
  },
  methods: {
    initAudioPlayer() {
      if (!this.audioPlayer) {
        this.audioPlayer = new Audio(this.$store.state.beepFile);
      }
    },
    playNotifSound() {
      this.initAudioPlayer();
      this.audioPlayer.play();
    },
    updateNotifications() {
      if (
        !this.isGuest &&
        !this.loadingNotifications &&
        !this.deletingNotifications &&
        !this.deletingActivities
      ) {
        this.getNotifications().then(data => {
          this.loadingNotifications = false;
          this.operationMessageType = data.operationMessageType;
          this.operationMessage = data.operationMessage;
          this.notificationsCount = data.notifsCount + data.activsCount;
          var newNotifications = data.notifs;
          var newActivities = data.activs;

          if (this.operationMessageType === "success") {
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
              if (!this.isGuest) {
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
          }
        });
      }
    },
    deleteActivity(index) {
      this.activities[index].deleting = true;
      this.selectActivity(index);
      this.deleteActivities();
    },
    deleteActivities() {
      var requestConfig = {
        headers: { Authorization: "Bearer " + this.$store.state.payload.jwt }
      };
      var requestParams = {
        data: []
      };
      this.selectedActivities.forEach(element => {
        requestParams.data.push(this.activities[element].id);
      });
      this.deletingActivities = true;
      var that = this;
      axios
        .post(
          this.$store.state.baseUrl +
            "delete-activities?XDEBUG_SESSION_START=netbeans-xdebug",
          requestParams,
          requestConfig
        )
        .then(function(response) {
          if (response.data.code === "success") {
            that.notifications = response.data.data.notif.items;
            that.notificationsCount =
              response.data.data.notif.count + response.data.data.activ.count;
            that.activities = response.data.data.activ.items;
            that.showNotificationsCount = that.notificationsCount > 0;
            that.selectedActivities = [];
          } else {
            that.snackbar = true;
          }
          that.deletingActivities = false;
          that.operationMessage = response.data.msg;
          that.operationMessageType = response.data.code;
        })
        .catch(function(error) {
          that.deletingActivities = false;
          that.operationMessage =
            "There was an error on the remote endpoint. Try again later.";
          that.operationMessageType = "error";
          that.snackbar = true;
        });
    },
    deleteNotification(index) {
      this.notifications[index].deleting = true;
      this.selectNotification(index);
      this.deleteNotifications();
    },
    deleteNotifications() {
      var requestConfig = {
        headers: { Authorization: "Bearer " + this.$store.state.payload.jwt }
      };
      var requestParams = {
        data: []
      };
      this.selectedNotifications.forEach(element => {
        requestParams.data.push(this.notifications[element].id);
      });
      this.deletingNotifications = true;
      var that = this;
      axios
        .post(
          this.$store.state.baseUrl +
            "delete-notifications?XDEBUG_SESSION_START=netbeans-xdebug",
          requestParams,
          requestConfig
        )
        .then(function(response) {
          if (response.data.code === "success") {
            that.notifications = response.data.data.notif.items;
            that.notificationsCount =
              response.data.data.notif.count + response.data.data.activ.count;
            that.activities = response.data.data.activ.items;
            that.showNotificationsCount = that.notificationsCount > 0;
            that.selectedNotifications = [];
          } else {
            that.snackbar = true;
          }
          that.deletingNotifications = false;
          that.operationMessage = response.data.msg;
          that.operationMessageType = response.data.code;
        })
        .catch(function(error) {
          that.deletingNotifications = false;
          that.operationMessage =
            "There was an error on the remote endpoint. Try again later.";
          that.operationMessageType = "error";
          that.snackbar = true;
        });
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

      return new Promise((resolve, reject) => {
        var requestConfig = {
          headers: {
            Authorization: "Bearer " + this.$store.state.payload.jwt
          }
        };
        var requestParams = {};

        axios
          .post(
            this.$store.state.baseUrl +
              "get-notifications?XDEBUG_SESSION_START=netbeans-xdebug",
            requestParams,
            requestConfig
          )
          .then(function(response) {
            var operationMessageType = response.data.code;
            var operationMessage = response.data.msg;
            var notifs = [],
              activs = [];
            var notifsCount = 0,
              activsCount = 0;

            if (operationMessageType === "success") {
              notifs = response.data.data.notif.items;
              notifsCount = response.data.data.notif.count;
              activs = response.data.data.activ.items;
              activsCount = response.data.data.activ.count;
            }
            resolve({
              operationMessageType,
              operationMessage,
              notifs,
              notifsCount,
              activs,
              activsCount
            });
          })
          .catch(function(error) {
            var operationMessageType = "error";
            var operationMessage = "Notifications could not be loaded.";
            var notifs = [],
              activs = [];
            var notifsCount = 0,
              activsCount = 0;
            resolve({
              operationMessageType,
              operationMessage,
              notifs,
              notifsCount,
              activs,
              activsCount
            });
          });
      });
    },
    clearNotifications() {
      this.notifications = [];
      this.activities = [];
      this.notificationsCount = 0;
      this.showNotificationsCount = false;
      this.selectedNotifications = [];
      this.selectedActivities = [];
      console.log("Notifications cleared");
    },
    logout() {
      clearInterval(this.timer);
      axios
        .get(this.$store.state.eaUrl + "user/logout", {
          params: { XDEBUG_SESSION_START: "netbeans-xdebug" }
        })
        .then(function(response) {})
        .catch(function(error) {});
      this.$store.commit("logout");
      this.$router.push(
        this.isStudent ? `${this.$store.state.homeUrl}/index` : "/auth/login"
      );

      /*
      clearInterval(that.timer);
      var requestConfig = {
        headers: { Authorization: "Bearer " + this.$store.state.payload.jwt }
      };
      this.loggingOut = true;
      var requestParams = {};
      var that = this;
      axios
        .post(
          this.$store.state.baseUrl +
            "logout?XDEBUG_SESSION_START=netbeans-xdebug",
          requestParams,
          requestConfig
        )
        .then(function(response) {
          that.loading = false;
          that.operationMessage = response.data.msg;
          that.operationMessageType = response.data.code;
          that.snackbar = true;
          that.loggingOut = false;
          if (response.data.code === "success") {
            that.notifications = [];
            that.notificationsCount = 0;
            that.showNotificationsCount = false;
            that.selectedNotifications = [];
            //clearInterval(that.timer);
            that.$store.commit("logout");
            that.$router.push("/login");
          }
        })
        .catch(function(error) {
          that.loading = false;
          that.operationMessage =
            "There was an error on the remote endpoint. Try again later.";
          that.operationMessageType = "error";
          that.snackbar = true;
          that.loggingOut = false;
        });*/
    }
  },
  computed: {
    isStudent() {
      return this.$store.state.payload.roles.includes("student");
    },
    isDO() {
      return this.$store.state.payload.roles.includes("do");
    },
    isAC() {
      return this.$store.state.payload.roles.includes("ac");
    },
    isNA() {
      return this.$store.state.payload.roles.includes("na");
    },
    isGuest() {
      return this.$store.state.payload.is_guest;
    },
    notificationsCountClass() {
      return this.showNotificationsCount ? "animated rubberBand" : "";
    }
  },
  watch: {
    isGuest: function(newValue, oldValue) {
      this.clearNotifications();
      if (!newValue) {
        this.timer = setInterval(this.updateNotifications, 15000);
      }
    }
  }
};
</script>

<style scoped>
a {
  text-decoration: none;
}
.white--text {
  margin-left: 5px;
}
.dropdown-menu-item a .menu-icon {
  margin-right: 5px;
  margin-bottom: 1px;
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

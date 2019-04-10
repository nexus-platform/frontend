<template>
  <v-flex xs12>
    <VProgress v-if="loading" message="Loading your institute data"/>

    <v-card v-else class="elevation-0 animated fadeIn">
      <v-container>
        <v-layout row wrap>
          <v-flex md8>
            <v-text-field
              v-model="instituteSlug"
              :rules="instituteSlugRules"
              type="text"
              max="50"
              outline
              hint="A short and easy to remember identifier is a good one"
              label="Custom Institute Identifier"
            ></v-text-field>
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
                <div slot="header">
                  <span color="info">
                    <v-icon class="primary--text fa">picture_as_pdf</v-icon>
                    <b>{{item.name}}</b>
                  </span>
                </div>
                <v-card>
                  <v-container>
                    <v-layout row wrap>
                      <v-flex xs12 sm4>
                        <v-checkbox
                          v-model="item.active"
                          :label="`This form is ${(item.active ? 'enabled.' : 'disabled.')}`"
                        ></v-checkbox>
                      </v-flex>
                      <v-flex xs12 sm8>
                        <v-text-field
                          :disabled="!item.active"
                          outline
                          type="text"
                          prepend-icon="edit"
                          v-model="item.slug"
                          hint="This will be the URL available to your institute's students"
                          label="Custom URL"
                          maxlength="50"
                        ></v-text-field>
                      </v-flex>
                    </v-layout>
                  </v-container>
                </v-card>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-flex>
        </v-layout>
      </v-container>

      <v-container v-if="!loading">
        <v-btn :disabled="updating" color="info" @click="submit()">
          <v-progress-circular
            v-if="updating"
            :width="2"
            size="15"
            indeterminate
            class="grey--text fa"
          ></v-progress-circular>
          <v-icon v-else small class="fa">check</v-icon>Submit
        </v-btn>
      </v-container>

      <v-snackbar
        :timeout="5000"
        :bottom="true"
        :right="true"
        v-model="snackbar"
        :color="operationMessageType"
      >
        <v-icon small class="white--text fa">info</v-icon>
        {{ operationMessage }}
        <v-btn flat @click.native="snackbar = false">
          <v-icon small class="fa">close</v-icon>
        </v-btn>
      </v-snackbar>
    </v-card>

    <AxiosComponent ref="axios" v-on:finish="handleHttpResponse($event)" />
  </v-flex>
</template>

<script>

export default {
  data: () => ({
    loading: false,
    snackbar: false,
    updating: false,
    instituteSlug: null,
    oldInstituteSlug: null,
    instituteSlugRules: [v => !!v || "This field is required"],
    operationMessageType: "",
    operationMessage: "",
    dsa_forms: []
  }),
  mounted() {
    this.oldInstituteSlug = this.$route.params.dsa_slug;
    this.updateGUI();
  },
  beforeRouteUpdate(to, from, next) {
    next();
    this.updateGUI();
  },
  methods: {
    handleHttpResponse(event) {
      this.loading = false;

      if (event.data.result.code === 200) {
        var response = event.data.result.response;
        this.operationMessage = response.msg;
        this.operationMessageType = response.code;

        switch (event.url.substring(event.url.lastIndexOf("/") + 1)) {
          case "set-institute-info":
            this.updating = false;
            this.snackbar = true;
            if (response.code === "success") {
              if (response.data.old_token !== response.data.new_token) {
                var newUrl = `/dsa/${response.data.new_token}`;
                this.$store.commit("setHomeUrl", `${newUrl}`);
                this.$store.commit("updateSlugOnRegistrations", {
                  old: this.oldInstituteSlug,
                  new: response.data.new_token
                });
                this.$router.push(`${newUrl}/admin`);
                this.updateGUI();
              }
            }
            break;
          case "get-my-institute-info":
            if (response.code === "success") {
              this.instituteSlug = response.data.univ_slug;
              this.dsa_forms = response.data.forms;
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
    updateGUI() {
      this.loading = true;
      this.getDataFromApi();
    },
    submit() {
      if (!this.updating && this.instituteSlug) {
        this.updating = true;
        var config = {
          method: "post",
          url: "set-institute-info",
          params: {
            slug: this.instituteSlug,
            univ_forms: this.dsa_forms
          }
        };
        this.$refs.axios.submit(config);
      } else {
        if (!this.instituteSlug) {
          this.operationMessage = "Your institute identifier cannot be null.";
          this.operationMessageType = "error";
          this.snackbar = true;
        }
      }
    },
    getDataFromApi() {
      var config = {
        url: "get-my-institute-info",
        params: {
          slug: this.dsaSlug
        }
      };
      this.$refs.axios.submit(config);
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

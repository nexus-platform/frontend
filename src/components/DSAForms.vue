<template>
  <v-flex xs12>

    <VProgress v-if="loading" message="Loading forms"/>

    <p v-else class="text-uppercase subheading text-xs-center primary--text">
      <span>{{ operationMessage }}</span>
    </p>

    <transition name="slide-fade">
      <v-card-text v-if="!loading">
        <v-layout row v-for="(item) in items" :key="`form-${item.id}`">
          <v-flex lg8 offset-lg2>
            <button class="btn primary" style="padding: 5px; height: auto;">
              <router-link
                :to="item.route"
                class="white--text"
                style="text-transform: none; text-decoration: none;"
              >
                <v-icon size="20" class="white--text fa">picture_as_pdf</v-icon>
                <span class="white--text">{{item.name}}</span>
              </router-link>
            </button>
          </v-flex>
        </v-layout>
      </v-card-text>
    </transition>

    <AxiosComponent ref="axios" v-on:finish="handleHttpResponse($event)"/>
  </v-flex>
</template>

<script>

export default {
  data: () => ({
    loading: true,
    snackbar: false,
    operationMessage: "Loading forms",
    items: []
  }),
  mounted() {
    var config = {
      url: "get-dsa-forms",
      params: {
        
      }
    };
    this.$refs.axios.submit(config);
  },
  methods: {
    handleHttpResponse(event) {
      this.loading = false;

      if (event.data.result.code === 200) {
        var response = event.data.result.response;
        this.operationMessage = response.msg;
        this.operationMessageType = response.code;

        switch (event.url.substring(event.url.lastIndexOf("/") + 1)) {
          case "get-dsa-forms":
            if (response.code === "success") {
              this.items = response.data;
              this.loading = false;
              this.operationMessage = `You have ${
                this.items.length
              } available forms`;
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

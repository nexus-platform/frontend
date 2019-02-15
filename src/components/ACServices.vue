<template>
  <v-container fluid mt-5 class="animated fadeIn">
    <v-layout v-if="loadingEA" row wrap mt-4>
      <v-flex xs12 sm10 offset-sm1>
        <h3 class="primary--text uppercase">Loading Settings</h3>
      </v-flex>
      <v-flex xs12 mt-3>
        <v-progress-circular indeterminate color="blue-grey"></v-progress-circular>
      </v-flex>
    </v-layout>

    <v-layout row wrap mt-4>
      <iframe-component :style="loadingEA ? 'opacity: 0;' : 'opacity: 1'" :eaUrl="eaUrl"/>
    </v-layout>

    <axios-component ref="axios" v-on:finish="handleHttpResponse($event)"/>
  </v-container>
</template>

<script>
import AxiosComponent from "@/components/AxiosComponent";
import IframeComponent from "@/components/IframeComponent";

export default {
  data() {
    return {
      loadingEA: false,
      acSlug: "",
      eaUrl: "",
      registrations: []
    };
  },
  components: {
    AxiosComponent,
    IframeComponent
  },
  mounted() {
    this.registrations = this.$store.state.registrations;
    this.acSlug = this.registrations[0].slug;
    this.switchAC();
    if (window.addEventListener) {
      window.addEventListener("message", this.eaFrameResize, false);
    }
  },
  methods: {
    test() {
      console.log("test");
    },
    switchAC() {
      this.loadingEA = true;
      this.eaUrl =
      this.$store.state.eaUrl +
      "backend/services" + `?ac=${this.acSlug}&jwt=${
      this.$store.state.payload.jwt
    }&XDEBUG_SESSION_START=netbeans-xdebug&base_url=${
      this.$store.state.baseUrl
    }`;
    },
    eaFrameResize(event) {
      this.loadingEA = false;
      if (this.$refs.iframe) {
        this.$refs.iframe.style.height = event.data.height + "px";
      }
    }
  },
  computed: {
    isNA() {
      return this.$store.state.payload.roles.includes("na");
    },
    isAC() {
      return this.$store.state.payload.roles.includes("ac");
    }
  }
};
</script>

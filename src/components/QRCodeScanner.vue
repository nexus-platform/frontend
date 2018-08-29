<template>
  <v-container style="margin-top: 60px;" class="animated fadeIn">
    <v-card-text class="text-lg-center">
      <v-layout row wrap>
        <v-flex xs12>
          <vue-qr-reader :responsive="false" :line-width="4" :stop-on-scanned="stopScan" :use-back-camera="useBackCamera" v-on:code-scanned="codeArrived" />
          <h3>Focus your camera on the QR Code</h3>
          <template v-if="codeValue">
            <router-link :to="`/sign-from-mobile/${codeValue}`" tag="button" class="v-btn info">
              <v-icon dark left>arrow_forward</v-icon>Code decoded. Go to URL
            </router-link>
          </template>
        </v-flex>
      </v-layout>
    </v-card-text>
  </v-container>
</template>

<script>
import VueQrReader from "vue-qr-reader/dist/lib/vue-qr-reader.umd.js";

export default {
  data() {
    return {
      useBackCamera: true,
      stopScan: false,
      codeValue: null,
    }
  },
  components: {
    VueQrReader
  },
  methods: {
    codeArrived(code) {
      this.stopScan = true;
      this.codeValue = code;
    }
  }
};
</script>

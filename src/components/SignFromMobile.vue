<template>
  <v-container fluid style="margin-top: 60px;">
    <v-card-text v-if="loadingInitialElements">
      <v-container>
        <icon name="circle-notch" scale=2 spin style="color: gray;"></icon>
      </v-container>
    </v-card-text>

    <v-layout v-if="!loadingInitialElements && !randomCode" row wrap>
      <v-flex xs6 offset-xs3>
        <v-card-text class="text-lg-center">
          <v-alert :value="true" type="error">Invalid code</v-alert>
        </v-card-text>
      </v-flex>
    </v-layout>

    <v-card-text v-if="!loadingInitialElements && randomCode" class="text-lg-center">

      <v-layout row v-if="!isMobile">
        <v-flex xs8 offset-xs2>
          <v-alert v-model="alert" type="warning" icon="warning" transition="scale-transition" dismissible>Oops! Looks like you're not using a mobile device...</v-alert>
        </v-flex>
      </v-layout>
      
      <v-layout row>
        <v-flex xs12>
          <v-menu bottom offset-y>
            <v-btn slot="activator" class="primary"><icon name="edit" class="fa"></icon>Input method</v-btn>
            <v-list class="primary--text">
              <v-list-tile v-on:click="drawpadDialog = true"><v-list-tile-title><icon name="edit" class="fa"></icon> Drawpad</v-list-tile-title></v-list-tile>
              <v-list-tile v-on:click="showUpload()"><v-list-tile-title><icon name="hdd" class="fa"></icon> Local drive</v-list-tile-title></v-list-tile>
              <v-list-tile v-on:click="cameraDialog = true"><v-list-tile-title><icon name="camera" class="fa"></icon>Device camera</v-list-tile-title></v-list-tile>
            </v-list>
          </v-menu>
        </v-flex>
      </v-layout>

      <v-layout row v-if="image">
        <v-flex xs12>
          <img class="mt-3 thumbnail" :src="image" />
        </v-flex>
      </v-layout>

      <v-layout row v-if="image">
        <v-flex xs12>
          <v-btn :disabled="uploadingImage" color="info" @click="uploadSignature()">
            <icon v-if="!uploadingImage" name="upload" class="fa"></icon>
            <icon v-if="uploadingImage" name="circle-notch" spin class="fa"></icon>
            Upload
          </v-btn>
        </v-flex>
      </v-layout>

      <v-dialog v-model="drawpadDialog" persistent fullscreen>
        <v-card>
          <signature-pad v-on:clear-signature="clearSignature()" v-on:set-signature="setSignatureFromDrawpad($event)" v-on:close-dialog="drawpadDialog = false"></signature-pad>
        </v-card>
      </v-dialog>

      <v-dialog width="500" v-model="uploadDialog" persistent>
        <v-card>
          <v-card-title class="headline grey lighten-2">
            Upload Signature
            <v-spacer></v-spacer>
            <a @click="uploadDialog = false"><icon name="times" class="fa"></icon></a>
          </v-card-title>
          <v-container>
            <signature-upload :bus="bus" v-on:set-signature="setSignatureFromUpload($event)" v-on:close-dialog="uploadDialog = false"></signature-upload>
          </v-container>
        </v-card>
      </v-dialog>

      <v-dialog v-model="cameraDialog" persistent fullscreen>
        <v-card style="background-color: #1e1e1e; padding: 0;">
          <camera-capture v-on:set-signature="setSignatureFromCamera($event)" v-on:close="cameraDialog = false"></camera-capture>
        </v-card>
      </v-dialog>

    </v-card-text>

    <v-snackbar :timeout="5000" :bottom="true" :right="true" v-model="snackbar" :color="operationMessageType">
      <icon class="fa" name="info-circle"></icon> {{ operationMessage }}
      <v-btn flat @click.native="snackbar = false"><icon name="times"></icon></v-btn>
    </v-snackbar>

  </v-container>
</template>

<script>
import axios from "axios";
import Vue from "vue";
import CameraCapture from "@/components/CameraCapture";
import SignaturePad from "@/components/SignaturePad";
import SignatureUpload from "@/components/SignatureUpload";

export default {
  data() {
    return {
      formSent: false,
      loadingInitialElements: true,
      operationMessage: "",
      operationMessageType: "error",
      isMobile: false,
      uploadDialog: false,
      drawpadDialog: false,
      cameraDialog: false,
      pad: null,
      snackbar: false,
      uploadingImage: false,
      alert: true,
      randomCode: null,
      image: null,
      bus: new Vue()
    };
  },
  components: {
    CameraCapture,
    SignaturePad,
    SignatureUpload
  },
  mounted() {
    this.randomCode = this.$route.params.random_code;
    this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    this.getDataFromApi().then(data => {
      this.randomCode = data;
      this.loadingInitialElements = false;
    });
  },
  methods: {
    getDataFromApi() {
      this.loading = true;
      return new Promise((resolve, reject) => {
        var requestConfig = {
          headers: {},
          params: {
            XDEBUG_SESSION_START: "netbeans-xdebug",
            random_code: this.randomCode
          }
        };
        var that = this;
        axios
          .get(
            this.$store.state.baseUrl + "validate-random-qr-code",
            requestConfig
          )
          .then(function(response) {
            let code = response.data.data;
            resolve({
              code
            });
          })
          .catch(function(error) {
            let code = null;
            resolve({
              code
            });
          });
      });
    },
    setSignatureFromCamera(value) {
      this.image = value;
      this.cameraDialog = false;
    },
    setSignatureFromDrawpad(event) {
      this.image = event;
      this.drawpadDialog = false;
    },
    setSignatureFromUpload(event) {
      this.image = event;
      if (event) {
        this.uploadDialog = false;
      }
    },
    clearSignature() {
      this.image = null;
    },
    showUpload() {
      var requestConfig = {};
      var requestParams = {
        random_code: this.randomCode
      };
      this.bus.$emit("setRequestConfig", requestConfig);
      this.bus.$emit("setRequestParams", requestParams);
      this.uploadDialog = true;
    },
    uploadSignature() {
      if (!this.uploadingImage) {
        this.uploadingImage = true;
        var requestConfig = {};

        var requestParams = {
          file: this.image,
          random_code: this.randomCode
        };

        var that = this;

        axios
          .post(
            this.$store.state.baseUrl +
              "upload-signature?XDEBUG_SESSION_START=netbeans-xdebug",
            requestParams,
            requestConfig
          )
          .then(function(response) {
            that.loading = false;
            that.operationMessage = response.data.msg;
            that.operationMessageType = response.data.code;
            that.snackbar = true;
            that.uploadingImage = false;
          })
          .catch(function(error) {
            that.loading = false;
            that.operationMessage =
              "There was an error on the remote endpoint. Try again later.";
            that.operationMessageType = "error";
            that.snackbar = true;
            that.uploadingImage = false;
          });
      }
    }
  }
};
</script>

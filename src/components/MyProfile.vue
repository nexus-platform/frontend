<template>
  <v-container style="margin-top: 60px;" class="animated fadeIn">
    <v-layout row wrap>
      <v-flex xs12>
        <v-card-text>
          <h2 class="text-md-center">My Profile</h2>
        </v-card-text>
      </v-flex>
    </v-layout>

    <v-layout row wrap>
      <v-flex xs12>
        <v-expansion-panel>
          <v-expansion-panel-content v-if="isStudent">
            <div slot="header"><icon name="edit" class="fa"></icon><b>Signature</b></div>
            <v-card>
              <v-card-text>
                <v-layout row wrap>
                  <v-flex xs12 sm6 lg3 v-if="loadingInitialElements">
                    <icon name="circle-notch" scale="2" spin class="fa" color="gray"></icon>
                  </v-flex>
                  <v-flex xs12 sm6 lg3 v-if="!loadingInitialElements && image">
                    <img class="thumbnail" v-bind:src="image"/>
                  </v-flex>
                  <v-flex xs12 sm6 lg3>
                    <v-btn v-on:click="showUpload()" class="primary"><icon name="edit" class="fa"></icon>Select from local drive</v-btn>
                    <v-layout v-if="image" row wrap>
                      <v-flex>
                        <v-btn :disabled="uploadingImage" v-if="image" v-on:click="uploadSignature()" class="success">
                          <icon v-if="!uploadingImage" name="upload" class="fa"></icon>
                          <icon v-if="uploadingImage" name="circle-notch" spin class="fa"></icon>
                          Upload
                        </v-btn>
                      </v-flex>
                    </v-layout>
                  </v-flex>
                </v-layout>

                <v-dialog width="500" v-model="uploadDialog" persistent>
                  <v-card>
                    <v-card-title class="headline grey lighten-2">
                      Upload Signature
                      <v-spacer></v-spacer>
                      <a @click="uploadDialog = false"><icon name="times" class="fa"></icon></a>
                    </v-card-title>
                    <v-container>
                      <signature-upload v-on:set-signature="setSignatureFromUpload($event)"></signature-upload>
                    </v-container>
                  </v-card>
                </v-dialog>
              </v-card-text>
            </v-card>
          </v-expansion-panel-content>
          
          <v-expansion-panel-content>
            <div slot="header"><icon name="user" class="fa"></icon><b>Personal Details</b></div>
            <v-card>
              <v-card-text class="text-xs-center">
                <img src="static/img/under_construction.png" />
              </v-card-text>
            </v-card>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-flex>
    </v-layout>

    <v-snackbar :timeout="5000" :bottom="true" :right="true" v-model="snackbar" :color="operationMessageType">
      <icon class="fa" name="info-circle"></icon> {{ operationMessage }}
      <v-btn flat @click.native="snackbar = false"><icon name="times"></icon></v-btn>
    </v-snackbar>

  </v-container>
</template>

<script>
import SignatureUpload from "@/components/SignatureUpload";
import axios from "axios";

export default {
  data() {
    return {
      uploadDialog: false,
      uploadingImage: false,
      loadingInitialElements: true,
      image: "",
      snackbar: false,
      operationMessage: "",
      operationMessageType: "error",
      isStudent: false
    };
  },
  components: {
    SignatureUpload
  },
  mounted() {
    this.isStudent = this.$store.state.payload.roles.includes("student");
    if (this.isStudent) {
      this.getSavedSignature();
    }
  },
  methods: {
    getSavedSignature() {
      var requestConfig = {
        headers: {
          Authorization: "Bearer " + this.$store.state.payload.jwt
        },
        params: {
          XDEBUG_SESSION_START: "netbeans-xdebug",
        }
      };
      var that = this;

      axios
        .get(
          this.$store.state.baseUrl + "get-previous-signature",
          requestConfig
        )
        .then(function(response) {
          that.operationMessage = response.data.msg;
          that.operationMessageType = response.data.code;
          that.loadingInitialElements = false;
          if (response.data.code === "success") {
            that.image = response.data.data;
          } else {
            that.snackbar = true;
          }
        })
        .catch(function(error) {
          that.operationMessage =
            "There was an error on the remote endpoint. Try again later.";
          that.operationMessageType = "error";
          that.loadingInitialElements = false;
          that.snackbar = true;
        });
    },
    showUpload() {
      this.uploadDialog = true;
    },
    setSignatureFromUpload(event) {
      this.image = event;
      if (event) {
        this.uploadDialog = false;
      }
    },
    uploadSignature() {
      if (!this.uploadingImage) {
        this.uploadingImage = true;
        var requestConfig = {
          headers: { Authorization: "Bearer " + this.$store.state.payload.jwt }
        };

        var requestParams = {
          file: this.image,
          random_code: this.randomQrCode
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
            that.operationMessage = response.data.msg;
            that.operationMessageType = response.data.code;
            that.snackbar = true;
            that.uploadingImage = false;
          })
          .catch(function(error) {
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

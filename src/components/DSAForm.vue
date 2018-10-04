<template>
  <v-container fluid style="margin-top: 60px;">

    <v-card-text class="text-lg-center animated fadeIn">
      <a class="pdf-title">{{pdfName}}</a>
    </v-card-text>

    <v-card-text v-if="loadingInitialElements" class="animated fadeIn">
      <v-progress-circular indeterminate color="blue-grey"></v-progress-circular>
    </v-card-text>

    <v-card v-else class="animated fadeIn">
      <v-tabs color="blue-grey darken-3" v-model="active" show-arrows icons-and-text fixed-tabs dark slider-color="yellow">
        <v-tab :disabled="loading" v-for="(item, i) in items" :key="i + 1" ripple @click="submit(false, i)">
          <span class="hidden-xs-only non-uppercase">{{item.title}}</span>
          <span class="hidden-sm-and-up">{{i + 1}}</span>
          <v-tooltip v-if="tabComplete(i) === 2" top color="success">
            <v-icon slot="activator" color="success">check_circle</v-icon>
            <span>No empty fields</span>
          </v-tooltip>
          <v-tooltip v-else-if="tabComplete(i) === 1" top color="warning">
            <v-icon slot="activator" color="warning">warning</v-icon>
            <span>{{missingFields(i)}} empty field(s)</span>
          </v-tooltip>
          <v-tooltip v-else top color="error">
            <v-icon slot="activator" color="error">warning</v-icon>
            <span>{{missingFields(i)}} empty field(s)</span>
          </v-tooltip>
        </v-tab>
        
        <v-tab-item v-for="(item, i) in items" :key="i + 1" :id="'tab-' + (i + 1)">
          <v-card flat>
            <div class="text-xs-justify padding-20">
              <p class="header-title hidden-sm-and-up">{{item.title}}</p>
              <v-layout row wrap v-for="(row, j) in item.components" :key="row.id">
            
                <v-flex v-for="(col, k) in row" :key="col.id" xs12 :md1="col.class === 'md1'" :md2="col.class === 'md2'" :md3="col.class === 'md3'" :md4="col.class === 'md4'" :md5="col.class === 'md5'" :md6="col.class === 'md6'" :md7="col.class === 'md7'" :md8="col.class === 'md8'" :md9="col.class === 'md9'" :md10="col.class === 'md10'" :md11="col.class === 'md11'" :md12="col.class === 'md12'">
                  <p v-if="col.content_type === 'html'" v-html="col.html"></p>
                  
                  <template v-if="col.content_type === 'input_group'">
                    <v-layout><span><b>{{col.name}}</b></span></v-layout>
                    <v-layout row wrap>
                      <v-tooltip bottom color="black">
                        <v-btn slot="activator" @click="updateRows(i, j, k, 1)" class="no-margin-left" color="primary" small><icon class="fa" name="plus"></icon></v-btn>
                        <span>Add row</span>
                      </v-tooltip>
                      <v-tooltip bottom color="black">
                        <v-btn :disabled="col.rows.length < 1" slot="activator" @click="updateRows(i, j, k, -1)" class="no-margin-left" color="error" small><icon class="fa" name="minus"></icon></v-btn>
                        <span>Remove row</span>
                      </v-tooltip>
                    </v-layout>
                    <v-layout row wrap v-for="(inputRow, inputRowIndex) in col.rows" :key="'ir_' + inputRowIndex">
                      <v-flex v-for="(inputItem, inputItemIndex) in inputRow" :key="'ii_' + inputItemIndex" xs12 :md1="inputItem.class === 'md1'" :md2="inputItem.class === 'md2'" :md3="inputItem.class === 'md3'" :md4="inputItem.class === 'md4'" :md5="inputItem.class === 'md5'" :md6="inputItem.class === 'md6'" :md7="inputItem.class === 'md7'" :md8="inputItem.class === 'md8'" :md9="inputItem.class === 'md9'" :md10="inputItem.class === 'md10'" :md11="inputItem.class === 'md11'" :md12="inputItem.class === 'md12'">
                        <v-text-field v-model="inputItem.input.value" v-on:input="applyFunction(inputItem.input, col)" outline :type="inputItem.input.type === 'number' ? 'number' : 'text'" :readonly="inputItem.input.read_only" :required="inputItem.input.required" :disabled="inputItem.input.disabled" :hint="inputItem.input.hint ? inputItem.input.hint : inputItem.input.title" :label="inputItem.input.title" :maxlength="inputItem.input.max_length"></v-text-field>
                      </v-flex>
                    </v-layout>
                    <v-layout row wrap v-if="col.commentable && (isDO || isStudent)">
                      <v-flex>
                        <v-tooltip right color="black">
                          <v-btn slot="activator" color="info" @click="showComments(i, j, k)" class="btn-req-modif-sign">
                            <icon class="fa" name="comments"></icon>Comments
                          </v-btn>
                          <span v-html="'Show comments'"></span>
                        </v-tooltip>
                      </v-flex>
                    </v-layout>
                  </template>

                  <template v-if="col.content_type === 'input'">

                    <template v-if="(col.input.type === 'text' || col.input.type === 'number' || col.input.type === 'double') && col.input.max_length <= 255">
                      <v-text-field outline :type="col.input.type === 'number' ? 'number' : 'text'" :readonly="col.input.read_only" :required="col.input.required" :disabled="col.input.disabled" :background-color="col.input.comments.length > 0 ? 'success' : ''" v-model="col.input.value" :hint="col.input.hint ? col.input.hint : col.input.title" :label="col.input.title" :maxlength="col.input.max_length"></v-text-field>
                    </template>

                    <template v-if="col.input.max_length > 255">
                      <v-textarea outline v-if="(col.input.type === 'text' || col.input.type === 'number' || col.input.type === 'double') && col.input.max_length > 255" :readonly="col.input.read_only" :required="col.input.required" :disabled="col.input.disabled" :background-color="col.input.comments.length > 0 ? 'success' : ''" v-model="col.input.value" :hint="col.input.hint ? col.input.hint : col.input.title" :label="col.input.title" :maxlength="col.input.max_length" :rows="col.input.rows"></v-textarea>
                    </template>

                    <template v-if="col.input.type === 'date' || col.input.type === 'month'">
                      <v-menu :disabled="col.input.read_only" v-model="col.input.modal" :close-on-content-click="false" :nudge-right="40" :return-value.sync="date" lazy transition="scale-transition" full-width min-width="290px">
                        <v-text-field outline :required="col.input.required" :disabled="col.input.disabled" :hint="col.input.hint ? col.input.hint : col.input.title" slot="activator" v-model="col.input.value" :label="col.input.title" :background-color="col.input.comments.length > 0 ? 'success' : ''" readonly></v-text-field>
                        <v-date-picker v-if="!col.input.disabled" no-title :show-current="true" :disabled="col.input.disabled" :readonly="col.input.read_only" v-model="col.input.value" :type="col.input.type">
                          <v-spacer></v-spacer>
                          <v-btn flat color="primary" @click="col.input.modal = !col.input.modal">OK</v-btn>
                        </v-date-picker>
                      </v-menu>
                    </template>

                    <template v-if="col.input.type === 'checkbox'">
                      <v-checkbox v-model="col.input.value" :label="col.input.title" :hint="col.input.title"></v-checkbox>
                    </template>

                    <template v-if="col.input.type === 'signature' || col.input.type === 'image'">
                      <v-flex>
                        <v-tooltip right color="black">
                          <img v-if="col.input.value" slot="activator" class="mt-3 thumbnail" :src="col.input.value" />
                          <span v-html="'Image preview'"></span>
                        </v-tooltip>
                      </v-flex>
                      <v-flex v-if="isStudent">
                        <v-tooltip right color="black">
                          <v-menu slot="activator" bottom offset-y>
                            <v-btn slot="activator" class="primary" style="margin-left: 0;">
                              <icon name="edit" class="fa"></icon>{{col.input.title}}
                            </v-btn>
                            <v-list class="primary--text">
                              <v-list-tile v-on:click="showDrawpad(i, j, k)" v-if="col.input.type === 'signature'"><v-list-tile-title><icon name="edit" class="fa"></icon>Drawpad</v-list-tile-title></v-list-tile>
                              <v-list-tile v-on:click="showUpload(i, j, k)"><v-list-tile-title><icon name="upload" class="fa"></icon>Local drive</v-list-tile-title></v-list-tile>
                              <v-list-tile v-on:click="showCamera(i, j, k)"><v-list-tile-title><icon name="camera" class="fa"></icon>Device camera</v-list-tile-title></v-list-tile>
                              <v-list-tile v-on:click="showQrCode(i, j, k)" :disabled="loadingQrCode" ><v-list-tile-title><icon name="mobile-alt" class="fa"></icon>Import from mobile</v-list-tile-title></v-list-tile>
                              <v-list-tile v-on:click="showPreviousSignature(i, j, k)" :disabled="loadingPreviousSignature" v-if="col.input.type === 'signature'"><v-list-tile-title><icon name="save" style="style: regular;" class="fa"></icon>Use saved signature</v-list-tile-title></v-list-tile>
                            </v-list>
                          </v-menu>
                          <span v-html="'Choose your input method'"></span>
                        </v-tooltip>
                      </v-flex>
                    </template>

                    <v-layout row wrap v-if="col.input.commentable && (isDO || isStudent)">
                      <v-flex>
                        <v-tooltip right color="black">
                          <v-btn slot="activator" color="info" @click="showComments(i, j, k)" :class="(col.input.type === 'signature' || col.input.type === 'image') ? 'btn-req-modif-sign' : 'btn-req-modif'">
                            <icon class="fa" name="comments"></icon>Comments
                          </v-btn>
                          <span v-html="'Show comments'"></span>
                        </v-tooltip>
                      </v-flex>
                    </v-layout>
                  </template>
                </v-flex>
              </v-layout>
            </div>
            
            <template v-if="i === items.length - 1">
              <v-btn v-if="!loadingInitialElements && isStudent" v-on:click="submit(true, 0)" :disabled="loading || validationErrors() || formSent" color="primary">
                <icon v-if="loading" name="circle-notch" spin class="gray--text"></icon>
                <icon v-if="!loading" name="envelope" class="white--text"></icon>
                &nbsp;Submit
              </v-btn>
              <p></p>
            </template>
          </v-card>
        </v-tab-item>
      </v-tabs>

      <v-tooltip bottom color="black">
        <v-btn slot="activator" color="cyan" :disabled="loading" class="mb-5 white--text" @click="previousTab()">
          <v-icon>chevron_left</v-icon>
        </v-btn>
        <span>Previous tab</span>
      </v-tooltip>

      <v-tooltip bottom color="black">
        <v-btn slot="activator" color="cyan" :disabled="loading" class="mb-5 white--text" @click="nextTab()">
          <v-icon>chevron_right</v-icon>
        </v-btn>
        <span>Next tab</span>
      </v-tooltip>
      
    </v-card>

    <v-dialog width="500" v-model="commentsDialog" persistent>
      <v-card>
        <v-card-title class="headline grey lighten-2">
          Comments
          <v-spacer></v-spacer>
          <a @click="commentsDialog = false"><icon name="times" class="fa"></icon></a>
        </v-card-title>
        <v-container>
          <div ref="comments_list" class="comments-list" v-chat-scroll>
            <v-layout v-for="(comment, commentIndex) in currentComments" :key="`comment-${commentIndex}`" row wrap class="comment" :class="comment.roles.includes('student') ? 'comment-left' : 'comment-right'">
              <v-flex :class="comment.roles.includes('student') ? 'xs9' : 'xs9 offset-xs3'">
                <div class="comment-container" :class="+ comment.roles.includes('student') ? 'comment-container-left' : 'comment-container-right'">
                  <p class="comment-headline">
                    <template v-if="comment.status === 0">
                      <icon class="fa-comment-status" style="color: red;" scale="0.8" name="exclamation-triangle"></icon>
                      <span v-html="comment.headline"></span>
                      <!--<a href="#">Retry</a>-->
                    </template>
                    <template v-else>
                      <icon v-if="comment.status === 1" class="fa-comment-status" style="color: #666;" scale="0.8" name="circle-notch" spin></icon>
                      <icon class="fa-comment-status" style="color: #666;" scale="0.8" v-else name="check"></icon>
                      <span v-html="comment.headline"></span>
                    </template>
                  </p>
                  <p class="comment-text"><span class="comment-user" v-html="comment.fullname"></span>{{comment.text}}</p>
                </div>
              </v-flex>
            </v-layout>
          </div>
          <br />
          <v-divider></v-divider>
          <br />
          <v-text-field ref="txt_new_comment" :disabled="sendingComment" hide-details v-on:keyup.enter="sendComment()" v-model="newCommentText" outline maxlength="1024"></v-text-field>
          <v-btn :disabled="!newCommentText || sendingComment" @click="sendComment()" color="primary">
            <icon class="fa" name="comment"></icon>Send Comment
          </v-btn>
        </v-container>
      </v-card>
    </v-dialog>

    <v-dialog v-model="drawpadDialog" persistent fullscreen>
      <v-card>
        <signature-pad ref="drawpad" v-on:clear-signature="clearSignature()" v-on:set-signature="setSignatureFromDrawpad($event)" v-on:close-dialog="drawpadDialog = false"></signature-pad>
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

    <v-dialog width="500" v-model="qrCodeDialog" persistent>
      <v-card>
        <v-card-title class="headline grey lighten-2">
          QR Code
          <v-spacer></v-spacer>
          <a @click="qrCodeDialog = false"><icon name="times" class="fa"></icon></a>
        </v-card-title>
        <v-container>
          <v-layout row v-if="loadingQrCode">
            <v-flex xs12>
              <h3>Generating Code...</h3>
              <icon name="circle-notch" scale=2 spin style="color: gray; margin-top: 20px;"></icon>
            </v-flex>
          </v-layout>
          <template v-else>
            <v-layout row>
              <v-flex xs12>
                <img :src="qrCodeImage" class="animated fadeIn" alt="Scan this code with your smartphone" />
                <h3>Scan this code from <a>{{scannerUrl}}</a> and follow the instructions on screen.<br/><span class="red--text">DO NOT close this window. Press the button below after submitting your signature from your mobile device.</span></h3>
              </v-flex>
            </v-layout>
            <v-layout row>
              <v-flex xs12>
                <v-btn :disabled="loadingSignatureByQrCode" @click="setSignatureFromQr()" color="info">
                  <icon v-if="loadingSignatureByQrCode" name="circle-notch" spin class="gray--text fa"></icon>
                  <icon v-else name="download" class="fa"></icon>
                  Retrieve data
                </v-btn>
              </v-flex>
            </v-layout>
          </template>
        </v-container>
      </v-card>
    </v-dialog>

    <v-dialog v-model="previousSignatureDialog" persistent width="500">
      <v-card>
        <v-card-title class="headline grey lighten-2">
          Previous Signature
          <v-spacer></v-spacer>
          <a @click="previousSignatureDialog = false"><icon name="times" class="fa"></icon></a>
        </v-card-title>
        <v-container>
          <v-layout row v-if="loadingPreviousSignature">
            <v-flex xs12>
              <h3>Loading your previously saved signature...</h3>
              <icon name="circle-notch" scale=2 spin style="color: gray; margin-top: 20px;"></icon>
            </v-flex>
          </v-layout>
          <template v-else>
            <v-layout row>
              <v-flex xs12>
                <v-alert :value="true" :type="operationMessageType">{{operationMessage}}</v-alert>
              </v-flex>
            </v-layout>
          </template>
        </v-container>
      </v-card>
    </v-dialog>
    
    <v-snackbar :timeout="5000" :bottom="true" :right="true" v-model="snackbar" :color="operationMessageType">
      <icon class="fa" name="info-circle"></icon> {{ operationMessage }}
      <v-btn flat @click.native="snackbar = false"><icon name="times"></icon></v-btn>
    </v-snackbar>
    
  </v-container>
</template>

<script>
import axios from "axios";
import moment from "moment";
import Vue from "vue";
import CameraCapture from "@/components/CameraCapture";
import SignaturePad from "@/components/SignaturePad";
import SignatureUpload from "@/components/SignatureUpload";
import VueQrcode from "@xkeshi/vue-qrcode";
import VueChatScroll from "vue-chat-scroll";
import VTooltip from "v-tooltip";

Vue.use(VueChatScroll);
Vue.use(VTooltip);
/*import VueQriously from 'vue-qriously'
<qriously value="Hello World!" :size="200" />
Vue.use(VueQriously)*/

export default {
  data() {
    return {
      previousSignatureDialog: false,
      loadingPreviousSignature: false,
      modal: false,
      formSent: false,
      downloading: false,
      date: null,
      loading: true,
      loadingInitialElements: true,
      items: [],
      pdfName: "Processing form...",
      operationMessage: "",
      operationMessageType: "error",
      formattedValues: [],
      isMobile: false,
      uploadDialog: false,
      cameraDialog: false,
      qrCodeDialog: false,
      drawpadDialog: false,
      pad: null,
      snackbar: false,
      entityId: 0,
      uploadingImage: false,
      loadingQrCode: false,
      image: "",
      qrCodeImage: "",
      timer: null,
      randomQrCode: null,
      loadingSignatureByQrCode: false,
      isStudent: false,
      isDO: false,
      currentComments: [],
      newCommentText: "",
      commentsDialog: false,
      sendingComment: false,
      scannerUrl: "",
      active: null,
      i: -1,
      j: -1,
      k: -1,
      bus: new Vue()
    };
  },
  beforeRouteUpdate(to, from, next) {
    this.pdfName = "Processing form...";
    this.loadingInitialElements = true;
    this.entityId = this.$route.params.entity ? this.$route.params.entity : 0;
    this.getDataFromApi().then(data => {
      this.items = data.items.data;
      this.pdfName = data.pdfName;
      this.loadingInitialElements = false;
    });
    next();
  },
  mounted() {
    this.scannerUrl = window.location.href.replace(this.$route.path, "/qrscan");
    this.isDO = this.$store.state.payload.roles.includes("do");
    this.isStudent = this.$store.state.payload.roles.includes("student");
    this.univSlug = this.$route.params.univ;
    this.formSlug = this.$route.params.form;
    this.entityId = this.$route.params.entity ? this.$route.params.entity : 0;
    this.getDataFromApi().then(data => {
      this.items = data.items.data;
      this.pdfName = data.pdfName;
      this.loadingInitialElements = false;
    });
    this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  },
  components: {
    CameraCapture,
    SignaturePad,
    SignatureUpload,
    VueQrcode
  },
  methods: {
    updateRows(i, j, k, operation) {
      var inputGroup = this.items[i].components[j][k];
      if (operation === 1) {
        var newRow = JSON.parse(JSON.stringify(inputGroup.model));
        var newRowItems = newRow.length;
        var newRowCount = inputGroup.rows.length + 1;
        for (var i = 0; i < newRowItems; i++) {
          newRow[i].input.name += ` ${newRowCount}`;
        }
        inputGroup.rows.push(newRow);
      } else {
        inputGroup.rows.splice(-1);
      }
    },
    missingFields(i) {
      var rows = this.items[i].components;
      var inputsCount = 0;
      var inputsFilled = 0;
      for (var j in rows) {
        var row = rows[j];
        for (var k in row) {
          var component = row[k];
          if (component.content_type === "input") {
            inputsCount++;
            if (component.input.value) {
              inputsFilled++;
            }
          } else if (component.content_type === "input_group") {
            for (var l in component.rows) {
              var inputRow = component.rows[l];
              for (var m in inputRow) {
                var inputItem = inputRow[m];
                if (inputItem.content_type === "input") {
                  inputsCount++;
                  if (inputItem.input.value) {
                    inputsFilled++;
                  }
                }
              }
            }
          }
        }
      }
      return inputsCount - inputsFilled;
    },
    tabComplete(i) {
      var rows = this.items[i].components;
      var inputsCount = 0,
        inputsFilled = 0;
      for (var j in rows) {
        var row = rows[j];
        for (var k in row) {
          var component = row[k];
          if (component.content_type === "input") {
            inputsCount++;
            if (component.input.value) {
              inputsFilled++;
            }
          } else if (component.content_type === "input_group") {
            for (var l in component.rows) {
              var inputRow = component.rows[l];
              for (var m in inputRow) {
                var inputItem = inputRow[m];
                if (inputItem.content_type === "input") {
                  inputsCount++;
                  if (inputItem.input.value) {
                    inputsFilled++;
                  }
                }
              }
            }
          }
        }
      }
      return inputsCount === inputsFilled ? 2 : inputsFilled === 0 ? 0 : 1;
    },
    nextTab(i) {
      const active = parseInt(this.active);
      this.active = active < this.items.length - 1 ? active + 1 : 0;
      this.submit(false, i);
    },
    previousTab(i) {
      const active = parseInt(this.active);
      this.active = active > 0 ? active - 1 : this.items.length - 1;
      this.submit(false, i);
    },
    setCurrentCoordinates(iVal, jVal, kVal) {
      this.i = iVal;
      this.j = jVal;
      this.k = kVal;
    },
    setSignatureFromQr() {
      if (!this.loadingSignatureByQrCode) {
        this.loadingSignatureByQrCode = true;
        var requestConfig = {
          headers: {
            Authorization: "Bearer " + this.$store.state.payload.jwt
          },
          params: {
            XDEBUG_SESSION_START: "netbeans-xdebug",
            random_code: this.randomQrCode
          }
        };
        var that = this;

        axios
          .get(
            this.$store.state.baseUrl + "get-signature-by-random-code",
            requestConfig
          )
          .then(function(response) {
            if (response.data.code === "success") {
              that.items[that.i].components[that.j][that.k].input.value =
                response.data.data;
              that.qrCodeDialog = false;
            }
            that.operationMessage = response.data.msg;
            that.operationMessageType = response.data.code;
            that.snackbar = true;
            that.loadingSignatureByQrCode = false;
          })
          .catch(function(error) {
            that.loadingSignatureByQrCode = false;
            that.operationMessage =
              "There was an error on the remote endpoint. Try again later.";
            that.operationMessageType = "error";
            that.snackbar = true;
          });
      }
    },
    onFileChange(e) {
      var files = e.target.files || e.dataTransfer.files;
      if (!files.length) return;
      this.createImage(files[0]);
    },
    createImage(file) {
      var image = new Image();
      var reader = new FileReader();
      var vm = this;

      reader.onload = e => {
        vm.image = e.target.result;
      };
      reader.readAsDataURL(file);
    },
    removeImage: function(e) {
      this.image = "";
    },
    test() {
      alert("This is a test!");
    },
    applyFunction(input, col) {
      if (input.function) {
        var modelName = input.name.substring(0, input.name.lastIndexOf(" "));
        var fieldIndex = -1;
        var valuesArr = [];
        var res = 0;
        for (var i in col.model) {
          if (col.model[i].input.name === modelName) {
            fieldIndex = i;
            break;
          }
        }
        if (fieldIndex > -1) {
          for (var i in col.rows) {
            valuesArr[valuesArr.length] = col.rows[i][fieldIndex].input.value;
          }
          switch (input.function.name) {
            case "sum": {
              valuesArr.forEach(element => {
                res += parseFloat(element);
              });
              res = res.toFixed(2);

              for (var i in this.items) {
                var rows = this.items[i].components;
                for (var j in rows) {
                  var row = rows[j];
                  for (var k in row) {
                    var component = row[k];
                    if (component.content_type === "input" && component.input.name === input.function.dest) {
                      component.input.value = res;
                      break;
                    }
                  }
                }
              }
              break;
            }
          }
        }
      }
    },
    setSignatureFromCamera(value) {
      this.items[this.i].components[this.j][this.k].input.value = value;
      this.cameraDialog = false;
    },
    setSignatureFromDrawpad(event) {
      this.items[this.i].components[this.j][this.k].input.value = event;
      this.drawpadDialog = false;
    },
    clearSignature() {
      this.items[this.i].components[this.j][this.k].input.value = null;
    },
    showPreviousSignature(i, j, k) {
      if (!this.loadingPreviousSignature) {
        this.setCurrentCoordinates(i, j, k);
        this.loadingPreviousSignature = true;
        this.previousSignatureDialog = true;

        var requestConfig = {
          headers: {
            Authorization: "Bearer " + this.$store.state.payload.jwt
          },
          params: {
            XDEBUG_SESSION_START: "netbeans-xdebug"
          }
        };
        var that = this;

        axios
          .get(
            this.$store.state.baseUrl + "get-previous-signature",
            requestConfig
          )
          .then(function(response) {
            if (response.data.code === "success") {
              that.items[that.i].components[that.j][that.k].input.value =
                response.data.data;
              that.previousSignatureDialog = false;
            }
            that.snackbar = true;
            that.loadingPreviousSignature = false;
            that.operationMessage = response.data.msg;
            that.operationMessageType = response.data.code;
          })
          .catch(function(error) {
            that.snackbar = true;
            that.loadingPreviousSignature = false;
            that.operationMessage =
              "There was an error on the remote endpoint. Try again later.";
            that.operationMessageType = "error";
          });
      }
    },
    showQrCode(i, j, k) {
      if (!this.loadingQrCode) {
        this.setCurrentCoordinates(i, j, k);
        this.loadingQrCode = true;
        this.qrCodeDialog = true;

        var requestConfig = {
          headers: {
            Authorization: "Bearer " + this.$store.state.payload.jwt
          },
          params: {
            XDEBUG_SESSION_START: "netbeans-xdebug"
          }
        };
        var that = this;

        axios
          .get(this.$store.state.baseUrl + "generate-qr-code", requestConfig)
          .then(function(response) {
            if (response.data.code === "success") {
              that.qrCodeImage = response.data.data.qr_code;
              that.randomQrCode = response.data.data.random_code;
            }
            that.loadingQrCode = false;
          })
          .catch(function(error) {
            that.qrCodeImage = "";
            that.randomQrCode = "";
            that.loadingQrCode = false;
          });
      }
    },
    showDrawpad(i, j, k) {
      this.setCurrentCoordinates(i, j, k);
      this.$refs.drawpad.setImage(this.items[i].components[j][k].input.value);
      this.drawpadDialog = true;
    },
    showCamera(i, j, k) {
      this.setCurrentCoordinates(i, j, k);
      this.cameraDialog = true;
    },
    sendComment() {
      if (!this.sendingComment) {
        var newComment = {
          text: this.newCommentText,
          roles: this.$store.state.payload.roles,
          fullname: this.$store.state.payload.fullname,
          status: 1,
          headline: '<i style="color: #666;">Sending comment...</i>'
        };
        this.currentComments.push(newComment);
        var currComponent = this.items[this.i].components[this.j][this.k];
        var commentIndex = -1;
        var fieldName = "";

        if (currComponent.content_type === "input") {
          currComponent.input.comments = this.currentComments;
          commentIndex = currComponent.input.comments.length - 1;
          fieldName = currComponent.input.name;
        } else {
          currComponent.comments = this.currentComments;
          commentIndex = currComponent.comments.length - 1;
          fieldName = currComponent.name;
        }

        this.newCommentText = "";
        this.$nextTick(this.$refs.txt_new_comment.focus);

        var requestConfig = {
          headers: { Authorization: "Bearer " + this.$store.state.payload.jwt }
        };

        var requestParams = {
          form_slug: this.formSlug,
          univ_slug: this.univSlug,
          id: this.entityId,
          comment: newComment,
          field_name: fieldName,
          index: commentIndex
        };

        this.sendingComment = true;

        var that = this;
        axios
          .post(
            this.$store.state.baseUrl +
              "send-dsa-form-comment?XDEBUG_SESSION_START=netbeans-xdebug",
            requestParams,
            requestConfig
          )
          .then(function(response) {
            var index = response.data.index;
            that.sendingComment = false;
            var currComponent = that.items[that.i].components[that.j][that.k];
            that.entityId = response.data.data;

            if (currComponent.content_type === "input") {
              /*
              that.items[that.i].components[that.j][that.k].input.comments[index].status = 2;
              that.items[that.i].components[that.j][that.k].input.comments[index].headline = response.data.headline;
              */
              currComponent.input.comments[index].status = 2;
              currComponent.input.comments[index].headline =
                response.data.headline;
            } else {
              currComponent.comments[index].status =
                response.data.code === "success" ? 2 : 0;
              currComponent.comments[index].headline =
                response.data.code === "success"
                  ? response.data.headline
                  : "Comment could not be sent.";
            }
          })
          .catch(function(error) {
            that.sendingComment = false;
            for (var i in this.items) {
              var rows = this.items[i].components;
              for (var j in rows) {
                var row = rows[j];
                for (var k in row) {
                  var component = row[k];
                  if (component.content_type === "input") {
                    for (var l in component.input.comments) {
                      var comment = component.input.comments[l];
                      if (comment.status === 1) {
                        /*that.items[that.i].components[that.j][
                          that.k
                        ].input.comments[l].status = 0;
                        that.items[that.i].components[that.j][
                          that.k
                        ].input.comments[l].headline =
                          "Comment could not be sent.";*/
                        comment.status = 0;
                        comment.headline = "Comment could not be sent.";
                      }
                    }
                  } else if (component.content_type === "input_group") {
                    for (var l in component.rows) {
                      var inputRow = component.rows[l];
                      for (var m in inputRow) {
                        var inputItem = inputRow[m];
                        if (inputItem.content_type === "input") {
                          for (var m in component.input.comments) {
                            var comment = component.input.comments[m];
                            if (comment.status === 1) {
                              comment.status = 0;
                              comment.headline = "Comment could not be sent.";
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          });
      }
    },
    showComments(i, j, k) {
      this.setCurrentCoordinates(i, j, k);
      var currComponent = this.items[i].components[j][k];
      this.currentComments =
        currComponent.content_type === "input"
          ? currComponent.input.comments
          : currComponent.comments;
      this.commentsDialog = true;
      this.$nextTick(this.$refs.txt_new_comment.focus);
    },
    showUpload(i, j, k) {
      this.setCurrentCoordinates(i, j, k);
      var requestConfig = {
        headers: { Authorization: "Bearer " + this.$store.state.payload.jwt }
      };
      var requestParams = {};
      this.bus.$emit("setRequestConfig", requestConfig);
      this.bus.$emit("setRequestParams", requestParams);
      this.uploadDialog = true;
    },
    setSignatureFromUpload(event) {
      this.items[this.i].components[this.j][this.k].input.value = event;
      this.uploadDialog = false;
    },
    chunkString(str, length) {
      return str.match(new RegExp(".{1," + length + "}", "g"));
    },
    validationErrors() {
      return false;
      for (var i in this.items) {
        var rows = this.items[i].components;
        for (var j in rows) {
          var row = rows[j];
          for (var k in row) {
            var component = row[k];
            if (
              component.content_type === "input" &&
              component.input.required &&
              !component.input.value
            ) {
              return true;
            } else if (component.content_type === "input_group") {
              for (var l in component.rows) {
                var inputRow = component.rows[l];
                for (var m in inputRow) {
                  var inputItem = inputRow[m];
                  if (
                    inputItem.content_type === "input" &&
                    inputItem.input.required &&
                    !inputItem.input.value
                  ) {
                    return true;
                  }
                }
              }
            }
          }
        }
      }
      return false;
    },
    formatDate(value, format) {
      return moment(String(value)).format(format);
    },
    submit(fullSubmit, step) {
      if ((step != this.active || fullSubmit) && !this.isDO) {
        var requestConfig = {
          headers: { Authorization: "Bearer " + this.$store.state.payload.jwt }
        };

        var requestParams = {
          form_slug: this.formSlug,
          univ_slug: this.univSlug,
          entity_id: this.entityId,
          data: {},
          signaturesInfo: {}
        };

        for (var i in this.items) {
          var rows = this.items[i].components;
          for (var j in rows) {
            var row = rows[j];
            for (var k in row) {
              var component = row[k];
              if (component.content_type === "input" && component.input.value) {
                if (
                  component.input.type === "signature" ||
                  component.input.type === "image"
                ) {
                  var inputData = {
                    value: component.input.value
                  };
                  requestParams.signaturesInfo[
                    component.input.name
                  ] = inputData;
                } else {
                  requestParams.data[component.input.name] =
                    component.input.value;
                  var newValue = component.input.value;
                  if (
                    component.input.type === "date" ||
                    component.input.type === "month"
                  ) {
                    newValue = this.formatDate(
                      component.input.value,
                      component.input.format
                    );
                  }
                  if ("chunks" in component.input) {
                    for (var l in component.input.chunks) {
                      var chunk = component.input.chunks[l];
                      requestParams.data[chunk.name] = newValue.substr(
                        chunk.start - 1,
                        chunk.length
                      );
                    }
                  }
                }
              } else if (component.content_type === "input_group") {
                for (var l in component.rows) {
                  var inputRow = component.rows[l];
                  for (var m in inputRow) {
                    var inputItem = inputRow[m];
                    if (
                      inputItem.content_type === "input" &&
                      inputItem.input.value
                    ) {
                      if (
                        inputItem.input.type === "signature" ||
                        inputItem.input.type === "image"
                      ) {
                        var inputData = {
                          value: inputItem.input.value
                        };
                        requestParams.signaturesInfo[
                          inputItem.input.name
                        ] = inputData;
                      } else {
                        requestParams.data[inputItem.input.name] =
                          inputItem.input.value;
                        requestParams.data[component.name] =
                          component.rows.length; //saving rows number
                        var newValue = inputItem.input.value;
                        if (
                          inputItem.input.type === "date" ||
                          inputItem.input.type === "month"
                        ) {
                          newValue = this.formatDate(
                            inputItem.input.value,
                            inputItem.input.format
                          );
                        }
                        if ("chunks" in inputItem.input) {
                          for (var l in inputItem.input.chunks) {
                            var chunk = inputItem.input.chunks[l];
                            requestParams.data[chunk.name] = newValue.substr(
                              chunk.start - 1,
                              chunk.length
                            );
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }

        if (
          (Object.keys(requestParams.data).length > 0 ||
            Object.keys(requestParams.signaturesInfo).length > 0 ||
            this.entityId > 0) &&
          !this.formSent
        ) {
          requestParams.data.id = this.entityId;
          requestParams.data.full_submit = fullSubmit;
          this.loading = true;
          var that = this;

          axios
            .post(
              this.$store.state.baseUrl +
                "fill-pdf-form?XDEBUG_SESSION_START=netbeans-xdebug",
              requestParams,
              requestConfig
            )
            .then(function(response) {
              that.loading = false;
              that.operationMessage = response.data.msg;
              that.operationMessageType = response.data.code;
              that.snackbar = true;
              if (fullSubmit) {
                that.formSent = response.data.code === "success";
              } else {
                that.entityId =
                  response.data.code === "success"
                    ? response.data.data
                    : that.entityId;
              }
            })
            .catch(function(error) {
              that.loading = false;
              that.operationMessage =
                "There was an error on the remote endpoint. Try again later.";
              that.operationMessageType = "error";
              that.snackbar = true;
            });
        } else if (fullSubmit) {
          this.snackbar = true;
          this.operationMessage = "Your form is completely empty.";
        }
      }
    },
    getDataFromApi() {
      this.loading = true;
      return new Promise((resolve, reject) => {
        var requestConfig = {
          headers: {
            Authorization: "Bearer " + this.$store.state.payload.jwt
          },
          params: {
            XDEBUG_SESSION_START: "netbeans-xdebug",
            form_slug: this.formSlug,
            univ_slug: this.univSlug,
            entity_id: this.entityId
          }
        };

        var that = this;

        axios
          .get(this.$store.state.baseUrl + "get-pdf-content", requestConfig)
          .then(function(response) {
            let items = response.data;
            let pdfName = response.data.msg;
            that.loading = false;
            resolve({
              items,
              pdfName
            });
          })
          .catch(function(error) {
            let items = {};
            let pdfName = "";

            that.loading = false;
            resolve({
              items,
              pdfName
            });
          });
      });
    }
  }
};
</script>

<style scoped>
.pdf-title {
  font-size: 20px;
  text-transform: uppercase;
}
.header-title {
  margin-top: 10px;
  padding: 5px 8px;
  background-color: orange;
  color: white;
  border-radius: 5px;
}
label {
  display: flex;
  align-self: flex-start;
  white-space: normal;
  height: inherit;
}
.padding-20 {
  padding: 20px 40px;
}
.non-uppercase {
  text-transform: none;
}
.btn-req-modif {
  margin-left: 0;
  margin-bottom: 20px;
  margin-top: -5px;
}
.btn-req-modif-sign {
  margin-left: 0;
  margin-bottom: 20px;
  margin-top: 15px;
}
.comments-list {
  padding: 0 7px 0;
  font-size: 12px;
  line-height: 1;
  max-height: 200px;
  overflow-y: scroll;
  overflow-x: hidden;
}
.comment {
  margin-top: 10px;
}
.comment-left {
  text-align: left;
}
.comment-right {
  text-align: right;
}
.comment-container {
  display: inline-block;
  border-radius: 5px;
  padding: 5px 7px;
}
.comment-container-left {
  background-color: #ffd34f;
}
.comment-container-right {
  background-color: #7bcae1;
}
.comment-headline {
  margin-bottom: 5px;
  font-weight: bold;
}
.comment-text {
  margin-bottom: 0;
}
.comment-user {
  background-color: #000;
  color: #fff;
  padding: 0 3px;
  border-radius: 5px;
  margin-right: 3px;
}
.fa-comment-status {
  margin-bottom: -2px;
}
.no-margin-left {
  margin-left: 0;
}
::-webkit-scrollbar {
  width: 7px !important;
}
</style>

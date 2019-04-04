<template>
  <v-flex xs12>
    <VProgress v-if="loading" message="Loading form content"/>

    <p v-else class="text-uppercase subheading text-xs-center primary--text">
      <span>{{ pdfName }}</span>
    </p>

    <v-card-text v-if="unfinishedForms.length > 0" class="animated fadeIn" align-center>
      <v-layout row wrap>
        <v-flex xs12>
          <h4 class="text-xs-center">
            You still have {{ unfinishedForms.length }} unfinished form{{ unfinishedForms.length > 1 ? 's' : '' }}.
            <br>How shall we proceed?
          </h4>
        </v-flex>
      </v-layout>

      <v-layout row wrap mt-2>
        <v-flex sm6 offset-sm3 style="text-align: center;">
          <table style="width: 100%; border-top: 1px solid #ccc">
            <tr>
              <td style="border-bottom: 1px solid #eee">Date</td>
              <td style="border-bottom: 1px solid #eee">Progress</td>
              <td style="border-bottom: 1px solid #eee">Actions</td>
            </tr>
            <tr v-for="(item, index) in unfinishedForms" :key="`unfinished-${index}`">
              <td style="border-bottom: 1px solid #eee">{{ item.date }}</td>
              <td style="border-bottom: 1px solid #eee">{{ item.progress }}</td>
              <td style="border-bottom: 1px solid #eee">
                <v-btn @click="redirect(item.route)" small class="purple white--text">
                  <v-icon size="22" class="fa">restore</v-icon>Resume
                </v-btn>
              </td>
            </tr>
          </table>
          <v-btn @click="unfinishedForms = []" small color="info">
            <v-icon size="22" class="fa">new_releases</v-icon>Start a new one
          </v-btn>
        </v-flex>
      </v-layout>
    </v-card-text>

    <v-card v-else-if="!loadingInitialElements" class="animated fadeIn">
      <v-tabs
        color="blue-grey darken-3"
        v-model="active"
        show-arrows
        icons-and-text
        dark
        slider-color="info"
      >
        <v-tab
          :disabled="loading"
          v-for="(item, i) in items"
          :key="`v-tab-${i + 1}`"
          ripple
          @click="submit(false, i)"
        >
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

        <v-tab-item v-for="(item, i) in items" :key="`v-tab-${i + 1}`">
          <v-card flat>
            <div class="text-xs-justify padding-20">
              <p class="header-title hidden-sm-and-up">{{item.title}}</p>
              <v-layout row wrap v-for="(row, j) in item.components" :key="`row-${j}`">
                <v-flex
                  v-for="(col, k) in row"
                  :key="col.id"
                  xs12
                  :md1="col.class === 'md1'"
                  :md2="col.class === 'md2'"
                  :md3="col.class === 'md3'"
                  :md4="col.class === 'md4'"
                  :md5="col.class === 'md5'"
                  :md6="col.class === 'md6'"
                  :md7="col.class === 'md7'"
                  :md8="col.class === 'md8'"
                  :md9="col.class === 'md9'"
                  :md10="col.class === 'md10'"
                  :md11="col.class === 'md11'"
                  :md12="col.class === 'md12'"
                >
                  <p v-if="col.content_type === 'html'" v-html="col.html"></p>

                  <template v-if="col.content_type === 'input_group'">
                    <v-layout>
                      <span>
                        <b>{{col.name}}</b>
                      </span>
                    </v-layout>
                    <v-layout row wrap>
                      <v-tooltip bottom color="black">
                        <v-btn
                          slot="activator"
                          @click="updateRows(i, j, k, 1)"
                          class="no-margin-left"
                          color="primary"
                          small
                        >
                          <v-icon class="fa">add_circle</v-icon>
                        </v-btn>
                        <span>Add row</span>
                      </v-tooltip>
                      <v-tooltip bottom color="black">
                        <v-btn
                          :disabled="col.rows.length < 1"
                          slot="activator"
                          @click="updateRows(i, j, k, -1)"
                          class="no-margin-left"
                          color="error"
                          small
                        >
                          <v-icon class="fa">remove_circle</v-icon>
                        </v-btn>
                        <span>Remove row</span>
                      </v-tooltip>
                    </v-layout>
                    <v-layout
                      row
                      wrap
                      v-for="(inputRow, inputRowIndex) in col.rows"
                      :key="`ir-${inputRowIndex}`"
                    >
                      <v-flex
                        v-for="(inputItem, inputItemIndex) in inputRow"
                        :key="`ii-${inputItemIndex}`"
                        xs12
                        :md1="inputItem.class === 'md1'"
                        :md2="inputItem.class === 'md2'"
                        :md3="inputItem.class === 'md3'"
                        :md4="inputItem.class === 'md4'"
                        :md5="inputItem.class === 'md5'"
                        :md6="inputItem.class === 'md6'"
                        :md7="inputItem.class === 'md7'"
                        :md8="inputItem.class === 'md8'"
                        :md9="inputItem.class === 'md9'"
                        :md10="inputItem.class === 'md10'"
                        :md11="inputItem.class === 'md11'"
                        :md12="inputItem.class === 'md12'"
                      >
                        <v-text-field
                          v-model="inputItem.input.value"
                          v-on:input="applyFunction(inputItem.input, col)"
                          outline
                          :type="inputItem.input.type === 'number' ? 'number' : 'text'"
                          :readonly="inputItem.input.read_only"
                          :required="inputItem.input.required"
                          :disabled="inputItem.input.disabled"
                          :hint="inputItem.input.hint ? inputItem.input.hint : inputItem.input.title"
                          :label="inputItem.input.title"
                          :maxlength="inputItem.input.max_length"
                        ></v-text-field>
                      </v-flex>
                    </v-layout>
                    <v-layout
                      row
                      wrap
                      v-if="col.commentable && ($store.getters.isDO || $store.getters.isStudent)"
                    >
                      <v-flex>
                        <v-tooltip bottom color="black">
                          <v-btn
                            slot="activator"
                            color="info"
                            @click="showComments(i, j, k)"
                            class="btn-req-modif-sign"
                          >
                            <v-icon class="fa">comment</v-icon>Comments
                          </v-btn>
                          <span v-html="'Show comments'"></span>
                        </v-tooltip>
                      </v-flex>
                    </v-layout>
                  </template>

                  <template v-if="col.content_type === 'input'">
                    <template
                      v-if="(col.input.type === 'text' || col.input.type === 'number' || col.input.type === 'double') && col.input.max_length <= 255"
                    >
                      <v-text-field
                        outline
                        :type="col.input.type === 'number' ? 'number' : 'text'"
                        :readonly="col.input.read_only"
                        :required="col.input.required"
                        :disabled="col.input.disabled"
                        :background-color="col.input.comments.length > 0 ? 'success' : ''"
                        v-model="col.input.value"
                        :hint="col.input.hint ? col.input.hint : col.input.title"
                        :label="col.input.title"
                        :maxlength="col.input.max_length"
                      ></v-text-field>
                    </template>

                    <template v-if="col.input.max_length > 255">
                      <v-textarea
                        outline
                        v-if="(col.input.type === 'text' || col.input.type === 'number' || col.input.type === 'double') && col.input.max_length > 255"
                        :readonly="col.input.read_only"
                        :required="col.input.required"
                        :disabled="col.input.disabled"
                        :background-color="col.input.comments.length > 0 ? 'success' : ''"
                        v-model="col.input.value"
                        :hint="col.input.hint ? col.input.hint : col.input.title"
                        :label="col.input.title"
                        :maxlength="col.input.max_length"
                        :rows="col.input.rows"
                      ></v-textarea>
                    </template>

                    <template v-if="col.input.type === 'date' || col.input.type === 'month'">
                      <v-menu
                        :disabled="col.input.read_only"
                        v-model="col.input.modal"
                        :close-on-content-click="false"
                        :nudge-right="40"
                        :return-value.sync="date"
                        lazy
                        transition="scale-transition"
                        full-width
                        min-width="290px"
                      >
                        <v-text-field
                          outline
                          :required="col.input.required"
                          :disabled="col.input.disabled"
                          :hint="col.input.hint ? col.input.hint : col.input.title"
                          slot="activator"
                          v-model="col.input.value"
                          :label="col.input.title"
                          :background-color="col.input.comments.length > 0 ? 'success' : ''"
                          readonly
                        ></v-text-field>
                        <v-date-picker
                          v-if="!col.input.disabled"
                          no-title
                          :show-current="true"
                          :disabled="col.input.disabled"
                          :readonly="col.input.read_only"
                          v-model="col.input.value"
                          :type="col.input.type"
                        >
                          <v-spacer></v-spacer>
                          <v-btn flat color="primary" @click="col.input.modal = !col.input.modal">OK</v-btn>
                        </v-date-picker>
                      </v-menu>
                    </template>

                    <template v-if="col.input.type === 'checkbox'">
                      <v-checkbox
                        v-model="col.input.value"
                        :label="col.input.title"
                        :hint="col.input.title"
                      ></v-checkbox>
                    </template>

                    <template v-if="col.input.type === 'signature' || col.input.type === 'image'">
                      <v-flex>
                        <v-tooltip bottom color="black">
                          <img
                            v-if="col.input.value"
                            slot="activator"
                            class="mt-3 thumbnail"
                            :src="col.input.value"
                          >
                          <span v-html="'Image preview'"></span>
                        </v-tooltip>
                      </v-flex>
                      <v-flex v-if="$store.getters.isStudent">
                        <v-tooltip bottom color="black">
                          <v-menu slot="activator" bottom offset-y>
                            <v-btn slot="activator" class="primary" style="margin-left: 0;">
                              <v-icon class="fa">edit</v-icon>
                              {{col.input.title}}
                            </v-btn>
                            <v-list class="primary--text">
                              <v-list-tile
                                v-on:click="showDrawpad(i, j, k)"
                                v-if="col.input.type === 'signature'"
                              >
                                <v-list-tile-title>
                                  <v-icon class="fa">edit</v-icon>Drawpad
                                </v-list-tile-title>
                              </v-list-tile>
                              <v-list-tile v-on:click="showUpload(i, j, k)">
                                <v-list-tile-title>
                                  <v-icon class="fa">file_upload</v-icon>Local drive
                                </v-list-tile-title>
                              </v-list-tile>
                              <v-list-tile v-on:click="showCamera(i, j, k)">
                                <v-list-tile-title>
                                  <v-icon class="fa">photo_camera</v-icon>Device camera
                                </v-list-tile-title>
                              </v-list-tile>
                              <v-list-tile
                                v-on:click="showQrCode(i, j, k)"
                                :disabled="loadingQrCode"
                              >
                                <v-list-tile-title>
                                  <v-icon class="fa">camera_front</v-icon>Import from mobile
                                </v-list-tile-title>
                              </v-list-tile>
                              <v-list-tile
                                v-on:click="showPreviousSignature(i, j, k)"
                                :disabled="loadingPreviousSignature"
                                v-if="col.input.type === 'signature'"
                              >
                                <v-list-tile-title>
                                  <v-icon class="fa">save</v-icon>Use saved signature
                                </v-list-tile-title>
                              </v-list-tile>
                            </v-list>
                          </v-menu>
                          <span v-html="'Choose your input method'"></span>
                        </v-tooltip>
                      </v-flex>
                    </template>

                    <v-layout
                      row
                      wrap
                      v-if="col.input.commentable && ($store.getters.isDO || $store.getters.isStudent)"
                    >
                      <v-flex>
                        <v-tooltip bottom color="black">
                          <v-btn
                            slot="activator"
                            color="info"
                            @click="showComments(i, j, k)"
                            :class="(col.input.type === 'signature' || col.input.type === 'image') ? 'btn-req-modif-sign' : 'btn-req-modif'"
                          >
                            <v-icon class="fa">comment</v-icon>Comments
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
              <p class="text-xs-center">
                <v-btn
                  large
                  v-if="!loadingInitialElements && $store.getters.isStudent"
                  v-on:click="submit(true, 0)"
                  :disabled="loading || validationErrors() || formSent"
                  color="primary"
                >
                  <v-progress-circular
                    v-if="loading"
                    :width="2"
                    size="18"
                    indeterminate
                    class="gray--text fa"
                  ></v-progress-circular>
                  <v-icon v-if="!loading" class="fa white--text">check</v-icon>I have completed my form
                </v-btn>
              </p>
            </template>
          </v-card>
        </v-tab-item>
      </v-tabs>

      <p class="text-xs-center">
        <v-tooltip bottom color="black">
          <v-btn
            slot="activator"
            color="cyan"
            :disabled="loading"
            class="mb-5 white--text"
            @click="previousTab()"
          >
            <v-icon>chevron_left</v-icon>
          </v-btn>
          <span>Previous tab</span>
        </v-tooltip>

        <v-tooltip bottom color="black">
          <v-btn
            slot="activator"
            color="cyan"
            :disabled="loading"
            class="mb-5 white--text"
            @click="nextTab()"
          >
            <v-icon>chevron_right</v-icon>
          </v-btn>
          <span>Next tab</span>
        </v-tooltip>
      </p>
    </v-card>

    <v-dialog width="500" v-model="commentsDialog" persistent>
      <v-card>
        <v-card-title class="headline grey lighten-2">Comments
          <v-spacer></v-spacer>
          <a @click="commentsDialog = false">
            <v-icon size="22" class="fa">close</v-icon>
          </a>
        </v-card-title>
        <v-container>
          <div ref="comments_list" class="comments-list" v-chat-scroll>
            <v-layout
              v-for="(comment, commentIndex) in currentComments"
              :key="`comment-${commentIndex}`"
              row
              wrap
              class="comment"
              :class="comment.roles.includes('student') ? 'comment-left' : 'comment-right'"
            >
              <v-flex :class="comment.roles.includes('student') ? 'xs9' : 'xs9 offset-xs3'">
                <div
                  class="comment-container"
                  :class="+ comment.roles.includes('student') ? 'comment-container-left' : 'comment-container-right'"
                >
                  <p class="comment-headline">
                    <template v-if="comment.status === 0">
                      <v-icon class="fa fa-comment-status" style="color: red;" size="22">comment</v-icon>
                      <span v-html="comment.headline"></span>
                      <a v-if="1 === 0" href="#">Retry</a>
                    </template>
                    <template v-else>
                      <v-progress-circular
                        v-if="comment.status === 1"
                        :width="2"
                        size="18"
                        indeterminate
                        class="gray--text fa"
                      ></v-progress-circular>
                      <v-icon class="fa fa-comment-status" style="color: #666;" v-else>check</v-icon>
                      <span v-html="comment.headline"></span>
                    </template>
                  </p>
                  <p class="comment-text">
                    <span class="comment-user" v-html="comment.fullname"></span>
                    {{comment.text}}
                  </p>
                </div>
              </v-flex>
            </v-layout>
          </div>
          <br>
          <v-divider></v-divider>
          <br>
          <v-text-field
            ref="txt_new_comment"
            :disabled="sendingComment"
            hide-details
            v-on:keyup.enter="sendComment()"
            v-model="newCommentText"
            outline
            maxlength="1024"
          ></v-text-field>
          <v-btn
            :disabled="!newCommentText || sendingComment"
            @click="sendComment()"
            color="primary"
          >
            <v-icon class="fa">comment</v-icon>Send Comment
          </v-btn>
        </v-container>
      </v-card>
    </v-dialog>

    <v-dialog v-model="drawpadDialog" persistent fullscreen>
      <v-card>
        <signature-pad
          ref="drawpad"
          v-on:clear-signature="clearSignature()"
          v-on:set-signature="setSignatureFromDrawpad($event)"
          v-on:close-dialog="drawpadDialog = false"
        ></signature-pad>
      </v-card>
    </v-dialog>

    <v-dialog width="500" v-model="uploadDialog" persistent>
      <v-card>
        <v-card-title class="headline grey lighten-2">Upload Signature
          <v-spacer></v-spacer>
          <a @click="uploadDialog = false">
            <v-icon size="22" class="fa">close</v-icon>
          </a>
        </v-card-title>
        <v-container>
          <signature-upload
            :bus="bus"
            v-on:set-signature="setSignatureFromUpload($event)"
            v-on:close-dialog="uploadDialog = false"
          ></signature-upload>
        </v-container>
      </v-card>
    </v-dialog>

    <v-dialog v-model="cameraDialog" persistent fullscreen>
      <v-card style="background-color: #1e1e1e; padding: 0;">
        <camera-capture
          v-on:set-signature="setSignatureFromCamera($event)"
          v-on:close="cameraDialog = false"
        ></camera-capture>
      </v-card>
    </v-dialog>

    <v-dialog width="500" v-model="qrCodeDialog" persistent>
      <v-card>
        <v-card-title class="headline grey lighten-2">QR Code
          <v-spacer></v-spacer>
          <a @click="qrCodeDialog = false">
            <v-icon size="22" class="fa">close</v-icon>
          </a>
        </v-card-title>
        <v-container>
          <v-layout row v-if="loadingQrCode">
            <v-flex xs12>
              <h3>Generating Code...</h3>
              <v-progress-circular :width="2" size="18" indeterminate class="gray--text fa"></v-progress-circular>
            </v-flex>
          </v-layout>
          <template v-else>
            <v-layout row>
              <v-flex xs12>
                <img
                  :src="qrCodeImage"
                  class="animated fadeIn"
                  alt="Scan this code with your smartphone"
                  :title="randomQrCode"
                >
                <v-card-text style="text-align: justify;">
                  <h4>
                    <b>INSTRUCTIONS:</b>
                    <br>1. Scan this code from
                    <a>{{ scannerUrl }}</a> and follow the instructions on screen.
                    <br>2. Open the Web browser in your mobile device and navigate to this URL:
                    <a>{{ scannerUrl.replace('/qrscan', `/sign-from-mobile/${randomQrCode}`) }}</a>.
                    <br>
                    <span justify-center class="red--text uppercase">DO NOT close this modal.</span>
                    <br>Press the button below after submitting your signature from your mobile device.
                  </h4>
                </v-card-text>
              </v-flex>
            </v-layout>
            <v-layout row>
              <v-flex xs12>
                <v-btn
                  :disabled="loadingSignatureByQrCode"
                  @click="setSignatureFromQr()"
                  color="info"
                >
                  <v-progress-circular
                    v-if="loadingSignatureByQrCode"
                    :width="2"
                    size="18"
                    indeterminate
                    class="gray--text fa"
                  ></v-progress-circular>
                  <v-icon size="22" class="fa">file_download</v-icon>Retrieve signature
                </v-btn>
              </v-flex>
            </v-layout>
          </template>
        </v-container>
      </v-card>
    </v-dialog>

    <v-dialog v-model="previousSignatureDialog" persistent width="500">
      <v-card>
        <v-card-title class="headline grey lighten-2">Previous Signature
          <v-spacer></v-spacer>
          <a @click="previousSignatureDialog = false">
            <v-icon size="22" class="fa">close</v-icon>
          </a>
        </v-card-title>
        <v-container>
          <v-layout row v-if="loadingPreviousSignature">
            <v-flex xs12>
              <h3>Loading your previously saved signature...</h3>
              <v-progress-circular :width="2" size="18" indeterminate class="gray--text fa"></v-progress-circular>
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

    <v-snackbar
      :timeout="5000"
      :bottom="true"
      :right="true"
      v-model="snackbar"
      :color="operationMessageType"
    >
      <v-icon size="22" class="fa">warning</v-icon>
      {{ operationMessage }}
      <v-btn flat @click.native="snackbar = false">
        <v-icon size="22" class="fa">close</v-icon>
      </v-btn>
    </v-snackbar>

    <AxiosComponent ref="axios" v-on:finish="handleHttpResponse($event)"/>
    
  </v-flex>
</template>

<script>
import moment from "moment";
import Vue from "vue";
import CameraCapture from "@/components/CameraCapture";
import SignaturePad from "@/components/SignaturePad";
import SignatureUpload from "@/components/SignatureUpload";
import VueChatScroll from "vue-chat-scroll";
import VTooltip from "v-tooltip";
import VProgress from "@/components/VProgress";
//import VueQrcode from '@xkeshi/vue-qrcode'
//import jquery from 'jquery'

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
      pdfName: null,
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
      currentComments: [],
      newCommentText: "",
      commentsDialog: false,
      sendingComment: false,
      scannerUrl: "",
      active: null,
      i: -1,
      j: -1,
      k: -1,
      bus: new Vue(),
      unfinishedForms: []
    };
  },
  beforeRouteUpdate(to, from, next) {
    this.updateGUI(to);
    next();
  },
  mounted() {
    this.scannerUrl = window.location.href.replace(this.$route.path, "/qrscan");
    this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    this.updateGUI(this.$route);
  },
  components: {
    CameraCapture,
    SignaturePad,
    SignatureUpload,
    //VueQrcode,
    VProgress
  },
  methods: {
    redirect(route) {
      this.$router.push(route);
      this.updateGUI(this.$route);
    },
    updateGUI(route) {
      this.pdfName = "Processing form";
      this.univSlug = route.params.dsa_slug;
      this.formSlug = route.params.parameter;
      this.entityId = route.params.id ? route.params.id : 0;
      this.loadingInitialElements = true;

      let config = {
        url: "get-pdf-content",
        params: {
          form_slug: this.formSlug,
          univ_slug: this.univSlug,
          entity_id: this.entityId
        }
      };
      this.$refs.axios.submit(config);
    },
    handleHttpResponse(event) {
      this.loading = false;
      this.loadingInitialElements = false;

      if (event.data.result.code === 200) {
        let response = event.data.result.response;
        this.operationMessage = response.msg;
        this.operationMessageType = response.code;

        switch (event.url.substring(event.url.lastIndexOf("/") + 1)) {
          case "get-pdf-content":
            if (response.code === "success") {
              this.pdfName = response.msg;
              this.items = response.data;
              this.unfinishedForms = response.unfinished_forms;
            } else {
              this.pdfName =
                "There was an error while trying to load your form.";
            }
            break;
          case "get-signature-by-random-code":
          case "get-previous-signature":
            if (response.code === "success") {
              this.items[this.i].components[this.j][this.k].input.value =
                response.data;
              this.qrCodeDialog = false;
            }
            this.snackbar = true;
            this.loadingSignatureByQrCode = false;
            this.loadingPreviousSignature = false;
            break;
          case "generate-qr-code":
            this.loadingQrCode = false;
            if (response.code === "success") {
              this.qrCodeImage = response.data.qr_code;
              this.randomQrCode = response.data.random_code;
            } else {
              this.qrCodeImage = null;
              this.randomQrCode = null;
            }
            break;
          case "send-dsa-form-comment":
            this.sendingComment = false;
            this.snackbar = true;

            if (response.code === "success") {
              let index = response.data.index;
              let currComponent = this.items[this.i].components[this.j][this.k];
              this.entityId = response.data;

              if (currComponent.content_type === "input") {
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
            } /*else {
             for (let i in this.items) {
              let rows = this.items[i].components;
              for (let j in rows) {
                let row = rows[j];
                for (let k in row) {
                  let component = row[k];
                  if (component.content_type === "input") {
                    for (let l in component.input.comments) {
                      let comment = component.input.comments[l];
                      if (comment.status === 1) {
                        comment.status = 0;
                        comment.headline = "Comment could not be sent.";
                      }
                    }
                  } else if (component.content_type === "input_group") {
                    for (let l in component.rows) {
                      let inputRow = component.rows[l];
                      for (let m in inputRow) {
                        let inputItem = inputRow[m];
                        if (inputItem.content_type === "input") {
                          for (let m in component.input.comments) {
                            let comment = component.input.comments[m];
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
            }*/
            break;
            case "fill-pdf-form":
            this.snackbar = true;
            if (response.code === 'success') {
              if (response.data.full_submit) {
                this.formSent = true;
              } else {
                this.entityId = response.data.form_id;
              }
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
    updateRows(i, j, k, operation) {
      let inputGroup = this.items[i].components[j][k];
      if (operation === 1) {
        let newRow = JSON.parse(JSON.stringify(inputGroup.model));
        let newRowItems = newRow.length;
        let newRowCount = inputGroup.rows.length + 1;
        for (let i = 0; i < newRowItems; i++) {
          newRow[i].input.name += ` ${newRowCount}`;
        }
        inputGroup.rows.push(newRow);
      } else {
        inputGroup.rows.splice(-1);
      }
    },
    missingFields(i) {
      let rows = this.items[i].components;
      let inputsCount = 0;
      let inputsFilled = 0;
      for (let j in rows) {
        let row = rows[j];
        for (let k in row) {
          let component = row[k];
          if (component.content_type === "input") {
            inputsCount++;
            if (component.input.value) {
              inputsFilled++;
            }
          } else if (component.content_type === "input_group") {
            for (let l in component.rows) {
              let inputRow = component.rows[l];
              for (let m in inputRow) {
                let inputItem = inputRow[m];
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
      let rows = this.items[i].components;
      let inputsCount = 0,
        inputsFilled = 0;
      for (let j in rows) {
        let row = rows[j];
        for (let k in row) {
          let component = row[k];
          if (component.content_type === "input") {
            inputsCount++;
            if (component.input.value) {
              inputsFilled++;
            }
          } else if (component.content_type === "input_group") {
            for (let l in component.rows) {
              let inputRow = component.rows[l];
              for (let m in inputRow) {
                let inputItem = inputRow[m];
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
        let config = {
          url: "get-signature-by-random-code",
          params: {
            random_code: this.randomQrCode
          }
        };
        this.$refs.axios.submit(config);
      }
    },
    onFileChange(e) {
      let files = e.target.files || e.dataTransfer.files;
      if (!files.length) return;
      this.createImage(files[0]);
    },
    createImage(file) {
      let image = new Image();
      let reader = new FileReader();
      let vm = this;

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
        let modelName = input.name.substring(0, input.name.lastIndexOf(" "));
        let fieldIndex = -1;
        let valuesArr = [];
        let res = 0;
        for (let i in col.model) {
          if (col.model[i].input.name === modelName) {
            fieldIndex = i;
            break;
          }
        }
        if (fieldIndex > -1) {
          for (let i in col.rows) {
            valuesArr[valuesArr.length] = col.rows[i][fieldIndex].input.value;
          }
          switch (input.function.name) {
            case "sum": {
              valuesArr.forEach(element => {
                res += parseFloat(element);
              });
              res = res.toFixed(2);

              for (let i in this.items) {
                let rows = this.items[i].components;
                for (let j in rows) {
                  let row = rows[j];
                  for (let k in row) {
                    let component = row[k];
                    if (
                      component.content_type === "input" &&
                      component.input.name === input.function.dest
                    ) {
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

        let config = {
          url: "get-previous-signature",
          params: {}
        };
        this.$refs.axios.submit(config);
      }
    },
    showQrCode(i, j, k) {
      if (!this.loadingQrCode) {
        this.setCurrentCoordinates(i, j, k);
        this.loadingQrCode = true;
        this.qrCodeDialog = true;
        let config = {
          url: "generate-qr-code",
          params: {}
        };
        this.$refs.axios.submit(config);
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
        let newComment = {
          text: this.newCommentText,
          roles: this.$store.getters.getRoles,
          fullname: this.$store.getters.getFullName,
          status: 1,
          headline: '<i style="color: #666;">Sending comment...</i>'
        };
        this.currentComments.push(newComment);
        let currComponent = this.items[this.i].components[this.j][this.k];
        let commentIndex = -1;
        let fieldName = "";

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
        this.sendingComment = true;

        let config = {
          method: "post",
          url: "send-dsa-form-comment",
          params: {
            form_slug: this.formSlug,
            univ_slug: this.univSlug,
            id: this.entityId,
            comment: newComment,
            field_name: fieldName,
            index: commentIndex
          }
        };
        this.$refs.axios.submit(config);
      }
    },
    showComments(i, j, k) {
      this.setCurrentCoordinates(i, j, k);
      let currComponent = this.items[i].components[j][k];
      this.currentComments =
        currComponent.content_type === "input"
          ? currComponent.input.comments
          : currComponent.comments;
      this.commentsDialog = true;
      this.$nextTick(this.$refs.txt_new_comment.focus);
    },
    showUpload(i, j, k) {
      this.setCurrentCoordinates(i, j, k);
      let requestConfig = {
        headers: { Authorization: `Bearer ${this.$store.getters.getJWT}` }
      };
      let requestParams = {};
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
      for (let i in this.items) {
        let rows = this.items[i].components;
        for (let j in rows) {
          let row = rows[j];
          for (let k in row) {
            let component = row[k];
            if (
              component.content_type === "input" &&
              component.input.required &&
              !component.input.value
            ) {
              return true;
            } else if (component.content_type === "input_group") {
              for (let l in component.rows) {
                let inputRow = component.rows[l];
                for (let m in inputRow) {
                  let inputItem = inputRow[m];
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
      if ((step != this.active || fullSubmit) && !this.$store.getters.isDO) {
        

        let config = {
          method: "post",
          url: "fill-pdf-form",
          params: {
            form_slug: this.formSlug,
          univ_slug: this.univSlug,
          entity_id: this.entityId,
          data: {},
          signaturesInfo: {}
          }
        };

        

        let totalInputs = 0;
        let filledInputs = 0;

        for (let i in this.items) {
          let rows = this.items[i].components;
          for (let j in rows) {
            let row = rows[j];
            for (let k in row) {
              let component = row[k];
              if (component.content_type === "input") {
                totalInputs++;
                if (component.input.value) {
                  filledInputs++;
                  if (
                    component.input.type === "signature" ||
                    component.input.type === "image"
                  ) {
                    let inputData = {
                      value: component.input.value
                    };
                    config.params.signaturesInfo[
                      component.input.name
                    ] = inputData;
                  } else {
                    config.params.data[component.input.name] =
                      component.input.value;
                    let newValue = component.input.value;
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
                      for (let l in component.input.chunks) {
                        let chunk = component.input.chunks[l];
                        config.params.data[chunk.name] = newValue.substr(
                          chunk.start - 1,
                          chunk.length
                        );
                      }
                    }
                  }
                }
              } else if (component.content_type === "input_group") {
                for (let l in component.rows) {
                  let inputRow = component.rows[l];
                  for (let m in inputRow) {
                    let inputItem = inputRow[m];
                    if (
                      inputItem.content_type === "input" &&
                      inputItem.input.value
                    ) {
                      totalInputs++;
                      if (inputItem.input.value) {
                        filledInputs++;
                        if (
                          inputItem.input.type === "signature" ||
                          inputItem.input.type === "image"
                        ) {
                          let inputData = {
                            value: inputItem.input.value
                          };
                          config.params.signaturesInfo[
                            inputItem.input.name
                          ] = inputData;
                        } else {
                          config.params.data[inputItem.input.name] =
                            inputItem.input.value;
                          config.params.data[component.name] =
                            component.rows.length; //saving rows number
                          let newValue = inputItem.input.value;
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
                            for (let l in inputItem.input.chunks) {
                              let chunk = inputItem.input.chunks[l];
                              config.params.data[chunk.name] = newValue.substr(
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
        }

        if (
          (Object.keys(config.params.data).length > 0 ||
            Object.keys(config.params.signaturesInfo).length > 0 ||
            this.entityId > 0) &&
          !this.formSent
        ) {
          config.params.data.id = this.entityId;
          config.params.data.full_submit = fullSubmit;
          config.params.data.total_inputs = totalInputs;
          config.params.data.filled_inputs = filledInputs;
          this.loading = true;
          
          
        this.$refs.axios.submit(config);

        } else if (fullSubmit) {
          this.snackbar = true;
          this.operationMessage = "Your form is completely empty.";
        }
      }
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

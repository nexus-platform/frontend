<template>
  <v-flex xs12>
    <v-card>
      <v-card-title>
        <v-layout row wrap>
          <v-flex xs12 sm8 offset-sm2 md6 offset-md4>
            <v-text-field
              slot="activator"
              :readonly="true"
              v-model="newFile.name"
              label="Upload file"
              :rules="newFileRules"
              prepend-icon="attach_file"
              append-icon="folder"
              @click="dlgUploadFile = true"
              @click:append="() => (dlgUploadFile = true)"
              type="text"
              hint="Upload a new file"
            ></v-text-field>
          </v-flex>
          <v-flex xs12 sm2 md2 class="mt-3">
            <v-btn
              class="info"
              small
              :disabled="uploadingFile || !newFile.content || !newFile.name"
              @click="uploadFile()"
            >
              <v-icon v-if="!uploadingFile" class="fa">file_upload</v-icon>
              <v-progress-circular size="15" v-else :width="2" indeterminate class="fa grey--text"></v-progress-circular>
              <span>Upload</span>
            </v-btn>
          </v-flex>
        </v-layout>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="items"
        :pagination.sync="pagination"
        :total-items="totalItems"
        :loading="loading"
      >
        <template slot="items" slot-scope="props">
          <td class="text-xs-left">{{ props.item.name }}</td>
          <td class="text-xs-left">{{ props.item.description }}</td>
          <td class="text-xs-left">{{ props.item.date }}</td>
          <td class="text-xs-left">
            <v-tooltip bottom color="black">
              <v-btn
                @click="downloadFile(props.item.id, props.item.name)"
                :disabled="downloadingFile"
                small
                flat
                slot="activator"
                class="btn-sm"
                color="info"
              >
                <v-icon v-if="!downloadingFile" small class="fa">file_download</v-icon>
                <v-progress-circular
                  v-else
                  :width="2"
                  size="18"
                  indeterminate
                  class="gray--text fa"
                ></v-progress-circular>
              </v-btn>
              <span>Download</span>
            </v-tooltip>
            <v-tooltip bottom color="black">
              <v-btn
                @click="deleteFile(props.item.id)"
                small
                flat
                slot="activator"
                class="btn-sm"
                color="error"
              >
                <v-icon v-if="!deletingFile" small class="fa">delete</v-icon>
                <v-progress-circular
                  v-else
                  :width="2"
                  size="18"
                  indeterminate
                  class="gray--text fa"
                ></v-progress-circular>
              </v-btn>
              <span>Remove</span>
            </v-tooltip>
          </td>
        </template>

        <template slot="no-data">
          <v-alert :value="true" class="black--text text-xs-center" color="default">
            <v-progress-circular v-if="loading" :width="2" indeterminate class="primary--text"></v-progress-circular>
            <span v-else>There are no items to display</span>
          </v-alert>
        </template>
      </v-data-table>

      <v-dialog width="500" v-model="dlgUploadFile" persistent>
        <v-card>
          <v-card-title class="headline grey lighten-2">
            Upload file
            <v-spacer></v-spacer>
            <a @click="dlgUploadFile = false">
              <v-icon class="fa">close</v-icon>
            </a>
          </v-card-title>
          <v-container>
            <v-form ref="frmNewFile">
              <v-flex xs12>
                <v-text-field
                  v-model="newFile.name"
                  ref="newFileName"
                  :rules="newFileRules"
                  label="Name"
                ></v-text-field>
              </v-flex>
              <v-flex xs12>
                <v-text-field v-model="newFile.description" label="Description"></v-text-field>
              </v-flex>
              <FileUpload v-on:set-file="setNewFile($event)"/>
            </v-form>
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
        <v-icon small class="fa">info</v-icon>
        {{ operationMessage }}
        <v-btn flat @click.native="snackbar = false">
          <v-icon small class="fa">close</v-icon>
        </v-btn>
      </v-snackbar>
    </v-card>

    <AxiosComponent ref="axios" v-on:finish="handleHttpResponse($event)"/>
  </v-flex>
</template>

<script>
import FileUpload from "@/components/FileUpload";
import { saveAs } from "file-saver";

export default {
  data() {
    return {
      search: "",
      formIndex: null,
      formId: null,
      totalItems: 0,
      items: [],
      loading: true,
      deletingFile: false,
      downloadingFile: false,
      uploadingFile: false,
      newFile: {
        name: null,
        description: null,
        content: null
      },
      newFileRules: [v => !!v || "This field is required"],
      dlgUploadFile: false,
      dlgDeleteFile: false,
      operationMessage: "",
      operationMessageType: "error",
      snackbar: false,
      pagination: {},
      headers: [
        { text: "Name", value: "name" },
        { text: "Description", value: "description" },
        { text: "Date", value: "date" },
        { text: "Actions", value: "actions" }
      ]
    };
  },
  components: { FileUpload },
  props: ["targetType"],
  watch: {
    pagination: {
      handler() {
        this.getDataFromApi();
      },
      deep: true
    }
  },
  computed: {
    pages() {
      if (
        this.pagination.rowsPerPage == null ||
        this.pagination.totalItems == null
      )
        return 0;
      return Math.ceil(
        this.pagination.totalItems / this.pagination.rowsPerPage
      );
    }
  },
  methods: {
    setNewFile(event) {
      this.newFile.content = event;
      if (event && this.$refs.frmNewFile.validate()) {
        this.dlgUploadFile = false;
      } else {
        this.$refs.newFileName.focus();
      }
    },
    uploadFile() {
      if (!this.uploadingFile) {
        this.uploadingFile = true;

        let config = {
          method: "form",
          url: "attach-file",
          params: new FormData(),
          headers: {
            "Content-Type": "multipart/form-data"
          }
        };
        config.params.append("name", this.newFile.name);
        config.params.append("description", this.newFile.description);
        config.params.append("content", this.newFile.content);
        config.params.append("target_type", this.targetType);
        this.$refs.axios.submit(config);
      }
    },
    handleHttpResponse(event) {
      if (event.data.result.code === 200) {
        var response = event.data.result.response;
        this.operationMessage = response.msg;
        this.operationMessageType = response.code;

        let currAction = event.url.substring(event.url.lastIndexOf("/") + 1);

        switch (currAction) {
          case "attach-file":
          case "delete-attached-file":
            if (currAction === "attach-file") {
              this.uploadingFile = false;
              this.snackbar = true;
              if (response.code === "success") {
                this.newFile = { name: null, description: null, content: null };
              }
            } else {
              this.deletingFile = false;
            }
            if (response.code === "success") {
              this.items = response.data;
            }
            break;
          case "get-attached-files":
            this.loading = false;
            const { sortBy, descending, page, rowsPerPage } = this.pagination;
            let items = response.data;
            const total = items.length;
            if (this.pagination.sortBy) {
              items = items.sort((a, b) => {
                const sortA = a[sortBy];
                const sortB = b[sortBy];
                if (descending) {
                  if (sortA < sortB) return 1;
                  if (sortA > sortB) return -1;
                  return 0;
                } else {
                  if (sortA < sortB) return -1;
                  if (sortA > sortB) return 1;
                  return 0;
                }
              });
            }
            if (rowsPerPage > 0) {
              items = items.slice((page - 1) * rowsPerPage, page * rowsPerPage);
            }
            this.items = items;
            this.totalItems = items.length;
            break;
          case "download-attached-file":
            this.downloadingFile = false;
            if (response) {
              let blob = new Blob([response], {
                type: "application/pdf"
              });
              saveAs(blob, this.newFile.name);
            } else {
              this.snackbar = true;
              this.operationMessage = "Your file could not be downloaded.";
              this.operationMessageType = "error";
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
        this.loading = false;
      }
    },
    deleteFile(id) {
      if (!this.deletingFile) {
        this.deletingFile = true;
        var config = {
          method: "post",
          url: "delete-attached-file",
          params: {
            file: id,
            target_type: this.targetType
          }
        };
        this.$refs.axios.submit(config);
      }
    },
    showApproveDialog(formId, index) {
      this.formId = formId;
      this.formIndex = index;
      this.approveDialog = true;
    },
    searchItems() {
      if (!this.loading) {
        this.getDataFromApi();
      }
    },
    getDataFromApi() {
      this.loading = true;
      var config = {
        url: "get-attached-files",
        params: { target_type: this.targetType }
      };
      this.$refs.axios.submit(config);
    },
    downloadFile(id, filename) {
      if (!this.downloadingFile) {
        this.downloadingFile = true;
        this.newFile.name = filename;
        var config = {
          method: "get",
          url: "download-attached-file",
          params: {
            file: id
          },
          responseType: "arraybuffer"
        };
        this.$refs.axios.submit(config);
      }
    }
  }
};
</script>

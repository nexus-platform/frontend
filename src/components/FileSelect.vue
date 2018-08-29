<template>
  <v-flex>
    <div class="upload-btn-wrapper">
      <v-btn class="primary"><v-icon size="20">attach_file</v-icon> Attach a copy of your DSA letter</v-btn>
      <input type="file" name="myfile" />
    </div>
  </v-flex>
</template>

<script>
export default {
  data() {
    return {
      file: ""
    };
  },
  methods: {
    handleFileChange() {
      this.file = this.$refs.file.files[0];
      this.$emit("file-changed", this.file);
    }
  }
};
</script>

<style>
.upload-btn-wrapper {
  position: relative;
  overflow: hidden;
  display: inline-block;
}

.upload-btn-wrapper input[type="file"] {
  font-size: 100px;
  position: absolute;
  left: 0;
  top: 0;
  opacity: 0;
}

</style>

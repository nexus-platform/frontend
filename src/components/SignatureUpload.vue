<template>
  <v-container>
    <v-layout row>
      <v-flex xs12 v-if="!image">
        <div class="box">
          <input type="file" accept="image/png" @change="onFileChange" name="file-5" id="file-5" class="inputfile inputfile-4" data-multiple-caption="{count} files selected" multiple />
          <label for="file-5"><figure><svg xmlns="http://www.w3.org/2000/svg" width="20" height="17" viewBox="0 0 20 17"><path d="M10 0l-5.2 4.9h3.3v5.1h3.8v-5.1h3.3l-5.2-4.9zm9.3 11.5l-3.2-2.1h-2l3.4 2.6h-3.5c-.1 0-.2.1-.2.1l-.8 2.3h-6l-.8-2.2c-.1-.1-.1-.2-.2-.2h-3.6l3.4-2.6h-2l-3.2 2.1c-.4.3-.7 1-.6 1.5l.6 3.1c.1.5.7.9 1.2.9h16.3c.6 0 1.1-.4 1.3-.9l.6-3.1c.1-.5-.2-1.2-.7-1.5z"/></svg></figure> <span>Select an image</span></label>
        </div>
      </v-flex>
      <v-flex xs12 v-else>
        <v-flex>
          <img class="thumbnail" :src="image" />
          <v-divider></v-divider>
        </v-flex>
        <v-flex>
          <v-btn color="warning" v-on:click="removeImage()"><icon name="trash" class="fa"></icon>Discard</v-btn>
          <v-btn color="info" v-on:click="setSignature()">
            <icon name="check" class="fa"></icon>
            Use image
          </v-btn>
        </v-flex>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>

export default {
  data() {
    return {
      image: null
    };
  },
  methods: {
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
    removeImage() {
      this.image = null;
      this.$emit("set-signature", this.image);
    },
    setSignature() {
      this.$emit("set-signature", this.image);
    }
  }
};
</script>

<style scoped>
label {
  display: flex;
  align-self: flex-start;
  white-space: normal;
  height: inherit;
}
.inputfile {
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  z-index: -1;
}
.inputfile:focus + label,
.inputfile + label:hover {
  background-color: #dfc8ca;
}
.inputfile:focus + label {
  outline: 1px dotted #000;
  outline: -webkit-focus-ring-color auto 5px;
}
.box {
  padding: 1.25rem 1.25rem;
}
.inputfile + label {
  max-width: 80%;
  font-size: 1.25rem;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  display: inline-block;
  overflow: hidden;
  padding: 0.625rem 1.25rem;
}
.inputfile + label svg {
  width: 1em;
  height: 1em;
  vertical-align: middle;
  fill: currentColor;
  margin-top: -0.25em;
  margin-right: 0.25em;
}
.inputfile-4 + label {
  color: #d3394c;
}
.inputfile-4:focus + label,
.inputfile-4.has-focus + label,
.inputfile-4 + label:hover {
  color: #722040;
}
.inputfile-4 + label figure {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #d3394c;
  display: block;
  padding: 20px;
  margin: 0 auto 10px;
}
.inputfile-4 + label svg {
  width: 100%;
  height: 100%;
  fill: #f1e5e6;
}
</style>

<template>
  <v-flex sm10 offset-sm1>
    <iframe
      class="animated fadeIn"
      ref="iframe"
      style="border: none; width: 100%; padding-bottom: 5px;"
      :src="eaUrl"
      scrolling="no"
    ></iframe>
  </v-flex>
</template>

<script>
export default {
  data() {
    return {};
  },
  props: ["eaUrl"],
  mounted() {
    if (window.addEventListener) {
      window.addEventListener("message", this.eaFrameResize, false);
    }
  },
  methods: {
    eaFrameResize(event) {
      this.loadingEA = false;
      if (this.$refs.iframe) {
        this.$refs.iframe.style.height = event.data.height + "px";
      }
    }
  },
  computed: {
    isGuest() {
      return this.$store.state.payload.is_guest;
    },
    isAC() {
      return this.$store.state.payload.roles.includes("ac");
    },
    isStudent() {
      return this.$store.state.payload.roles.includes("student");
    }
  }
};
</script>

<style scoped>
.v-input--selection-controls.v-input .v-label {
  font-size: 14px !important;
}
.v-input__control,
.v-datatable .v-input--selection-controls {
  margin-top: -9px !important;
  max-height: 20px !important;
}
.padding-20 {
  padding: 20px 40px;
}

pre {
  overflow: auto;
}
pre .string {
  color: #885800;
}
pre .number {
  color: blue;
}
pre .boolean {
  color: magenta;
}
pre .null {
  color: red;
}
pre .key {
  color: green;
}

h1 {
  text-align: center;
  font-size: 36px;
  margin-top: 20px;
  margin-bottom: 10px;
  font-weight: 500;
}

fieldset {
  border: 0;
}

.panel {
  margin-bottom: 20px;
  background-color: #fff;
  border: 1px solid transparent;
  border-radius: 4px;
  -webkit-box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
  border-color: #ddd;
}

.panel-heading {
  color: #333;
  background-color: #f5f5f5;
  border-color: #ddd;

  padding: 10px 15px;
  border-bottom: 1px solid transparent;
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
}

.panel-body {
  padding: 15px;
}

.field-checklist .wrapper {
  width: 100%;
}
</style>

<template>
  <v-flex xs12 row wrap>
    <VProgress v-if="loadingEA" message="Loading content" />
    <iframe ref="iframe" :style="iframeStyle" :class="iframeClasses" :src="eaUrl" scrolling="no"></iframe>
  </v-flex>
</template>

<script>
export default {
  data() {
    return {
      loadingEA: true,
      iframeDimensions: null
    };
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
      this.iframeDimensions = event.data;
    }
  },
  computed: {
    iframeStyle() {
      return this.iframeDimensions
        ? `opacity: 1; border: none!important; width: 100%; height: ${
            this.iframeDimensions.height
          }px;`
        : "opacity: 0";
    },
    iframeClasses() {
      return this.iframeDimensions ? "animated fadeIn" : null;
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

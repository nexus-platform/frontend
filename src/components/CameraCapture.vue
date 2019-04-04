<template>
  <v-container class="text-lg-center">
    <v-layout row>
      <v-flex xs12>
        <video ref="video" id="video" width="480" height="360" autoplay></video>
      </v-flex>
    </v-layout>

    <v-layout class="text-xs-center" row>
      <v-flex xs12 style="margin-top: -53px; background-color: #1e1e1e; z-index: 999; opacity: .7;">
        <template v-if="videoDevices.length > 0">
          <v-menu offset-y transition="fade-transition" bottom dark>
            <v-btn class="white--text" flat slot="activator">
              <v-icon class="fa">fas fa-camera</v-icon>Device
            </v-btn>
            <v-list>
              <v-list-tile
                v-for="(item, index) in videoDevices"
                :key="`dev-${index}`"
                @click="switchVideoDevice(index)"
              >{{item.label}}</v-list-tile>
            </v-list>
          </v-menu>
          <!--<v-menu offset-y transition="fade-transition" bottom dark>
            <v-btn class="white--text" flat slot="activator">
              <v-icon class="fa">fas fa-mobile-alt</v-icon>Size
            </v-btn>
            <v-list>
              <v-list-tile v-for="(item, index) in videoSizes" :key="`dev-${index}`" @click="switchVideoSize(index)">
                {{item.label}}
              </v-list-tile>
            </v-list>
          </v-menu>-->
          <v-btn flat dark v-on:click="capture()">
            <v-icon>camera</v-icon>Shoot
          </v-btn>
        </template>

        <v-btn flat dark v-on:click="close()">
          <v-icon>close</v-icon>Close
        </v-btn>
      </v-flex>
    </v-layout>

    <v-layout row>
      <v-flex xs12>
        <canvas ref="canvas" id="canvas" width="480" height="360"></canvas>
      </v-flex>
    </v-layout>

    <v-snackbar
      class="mt-4"
      :timeout="5000"
      :top="true"
      :center="true"
      v-model="snackbar"
      color="error"
    >
      <v-icon size="22" class="fa">info</v-icon>
      {{ operationMessage }}
      <v-btn flat @click.native="snackbar = false">
        <v-icon size="22" class="fa">close</v-icon>
      </v-btn>
    </v-snackbar>

    <!--<template v-if="captures.length > 0">
      <v-divider style="margin: 10px 0;"></v-divider>
      <h3>Choose a picture below</h3>
      <v-layout row>
        <v-flex xs12>
          <ul>
            <v-container>
              <v-layout row wrap class="centered">
                <li v-for="(c, l) in captures" :key="`snap-${l}`">
                  <div class="snap-container" :class="c.color === 'info' ? 'selected' : 'unselected'">
                    <img class="snap-thumb" v-on:click="selectSnap(l)" v-bind:src="c.value"/>
                    <v-btn class="btn-sm" :color="c.color" v-on:click="selectSnap(l)" style="position: relative; margin-right: 50px;">
                      <icon name="check" class="fa" style="margin-left: 5px;"></icon>
                    </v-btn>
                    <v-btn class="btn-sm" color="error" v-on:click="deleteSnap(l)">
                      <icon name="trash" class="fa" style="margin-left: 5px;"></icon>
                    </v-btn>
                  </div>
                </li>
              </v-layout>
            </v-container>
          </ul>
        </v-flex>
      </v-layout>
    </template>-->
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      snackbar: false,
      operationMessage: "",
      image: null,
      video: {},
      canvas: {},
      captures: [],
      videoDevices: [],
      videoSizes: [
        {
          label: "DEFAULT",
          width: 480,
          height: 360
        },
        {
          label: "QVGA",
          width: 320,
          height: 240
        },
        {
          label: "VGA",
          width: 640,
          height: 480
        },
        {
          label: "HD",
          width: 1280,
          height: 720
        },
        {
          label: "FULL HD",
          width: 1920,
          height: 1200
        }
      ],
      videoDevice: null,
      videoDeviceIndex: -1,
      videoSizeIndex: 0
    };
  },
  mounted() {
    this.video = this.$refs.video;
    this.canvas = this.$refs.canvas;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .enumerateDevices()
        .then(this.gotDevices)
        .then(this.getStream)
        .catch(this.handleError);
      /*var constraints = { video: true };

      navigator.mediaDevices.getUserMedia(constraints).then(stream => {
        try {
          this.video.srcObject = stream;
        } catch (error) {
          this.video.src = URL.createObjectURL(stream);
        }
        this.video.play();
      });*/
    }
  },
  methods: {
    switchVideoSize(i) {
      this.videoSizeIndex = i;
      this.getStream();
    },
    switchVideoDevice(i) {
      this.videoDeviceIndex = i;
      this.getStream();
    },
    gotDevices(deviceInfos) {
      for (let i = 0; i !== deviceInfos.length; ++i) {
        var deviceInfo = deviceInfos[i];
        if (deviceInfo.kind === "videoinput") {
          var newDevice = { id: deviceInfo.deviceId, label: deviceInfo.label };
          this.videoDevices.push(newDevice);
        }
      }
      this.videoDeviceIndex = 0;
    },
    getStream() {
      var constraints = {
        video: {
          deviceId: { exact: this.videoDevices[this.videoDeviceIndex].id },
          width: { ideal: this.videoSizes[this.videoSizeIndex].width }
          /*width: { min: this.videoSizes[this.videoSizeIndex].width },
          height: { min: this.videoSizes[this.videoSizeIndex].height }*/
        }
      };
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then(this.gotStream)
        .catch(this.handleError);
    },
    gotStream(stream) {
      try {
        this.video.srcObject = stream;
      } catch (error) {
        this.video.src = URL.createObjectURL(stream);
      }
      this.snackbar = false;
      this.video.play();
    },
    handleError(error) {
      //console.error("Error: ", error);
      //console.error(this.videoSizes[this.videoSizeIndex]);
      this.snackbar = true;
      if (error.name === "OverconstrainedError") {
        this.operationMessage = "Unsupported resolution";
      } else {
        this.operationMessage = error.name;
      }
    },
    /*selectSnap(i) {
      this.captures.forEach(element => {
        element.color = "default";
      });
      this.captures[i].color = "info";
      this.image = this.captures[i].value;
      this.$emit("set-signature", this.image);
    },
    deleteSnap(i) {
      if (this.captures[i].color === "info") {
        this.image = null;
      }
      this.captures.splice(i, 1);
    },*/
    close() {
      this.$emit("close");
    },
    capture() {
      this.canvas = this.$refs.canvas;
      var context = this.canvas
        .getContext("2d")
        .drawImage(
          this.video,
          0,
          0,
          this.$refs.video.width,
          this.$refs.video.height
        );
      this.captures.push({
        color: "default",
        value: canvas.toDataURL("image/png")
      });
      this.image = canvas.toDataURL("image/png");
      this.$emit("set-signature", this.image);
    }
  }
};
</script>

<style scoped>
#video {
  background-color: #000000;
}
#canvas {
  display: none;
}
li {
  display: inline;
  padding: 5px;
}
.snap-container {
  -moz-box-shadow: 1px 1px 3px #999;
  -webkit-box-shadow: 1px 1px 3px #999;
  border: 1px solid #ddd;
  border-radius: 3px;
  padding: 5px;
  width: 160px;
  height: 180px;
}
.snap-container:hover {
  /*-webkit-transform: rotate(-2deg);
  -moz-transform: rotate(-2deg);*/
  -moz-box-shadow: 1px 1px 5px #999;
  -webkit-box-shadow: 1px 1px 5px #999;
}
.snap-thumb {
  padding: 5px 0;
  height: 110px;
  width: auto;
  cursor: pointer;
}
.selected {
  background-color: #ececec;
  border: 1px solid gray;
}
.unselected {
  background-color: transparent;
}
</style>

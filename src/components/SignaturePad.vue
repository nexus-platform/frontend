<template>
  <v-container fluid>
    <canvas class="signature"></canvas>
    <div class="clearfix"></div>
    <v-container>
      <v-layout row>
        <v-flex>
          <v-btn color="warning" v-on:click="clearPad()"><icon name="trash-alt" class="fa"></icon> Clear</v-btn>
          <v-btn color="info" v-on:click="setSignature()"><icon name="check" class="fa"></icon> Use signature</v-btn>
          <v-btn color="error" v-on:click="closeDialog()"><icon name="times" class="fa"></icon> Close</v-btn>
        </v-flex>
      </v-layout>
    </v-container>
  </v-container>
</template>

<script>
import SignaturePad from "signature_pad";

export default {
  data() {
    return {
      pad: null,
      image: null
    };
  },
  mounted() {
    this.initPad();
    if (this.image) {
      this.pad.fromDataURL(this.image);
    }
  },
  methods: {
    setImage(image) {
      this.image = image;
      var canvas = document.querySelector(".signature");
      var signaturePad = new SignaturePad(canvas);
      this.pad.fromDataURL(this.image);
    },
    initPad() {
      let canvas = document.querySelector(".signature");
      this.pad = new SignaturePad(canvas, {
        minWidth: 3,
        maxWidth: 7,
        throttle: 0,
        penColor: "rgb(" + this.red + "," + this.green + "," + this.blue + ")",
        onEnd: () => {}
      });
      window.addEventListener("resize", this.resizeCanvas);
      this.resizeCanvas();
      this.draw();
    },
    setSignature() {
      let canvas = document.querySelector(".signature");
      this.image = this.pad.toDataURL();
      this.$emit("set-signature", this.image);
    },
    resizeCanvas() {
      let canvas = document.querySelector(".signature");
      if (canvas) {
        var ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = window.innerWidth * 0.9;
        canvas.height = window.innerHeight * 0.7;
      }
    },
    draw() {
      this.pad.penColor =
        "rgb(" + this.red + "," + this.green + "," + this.blue + ")";
      let canvas = document.querySelector(".signature");
      var ctx = canvas.getContext("2d");
      ctx.globalCompositeOperation = "source-over";
      canvas.style.cursor = "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAIGNIUk0AAHolAACAgwAA+f8AAIDoAABSCAABFVgAADqXAAAXb9daH5AAAAT4SURBVHjatJbfT5NXGMcbmJPb7WrZ37HspvxooecUe176tnJeNGALuM1akaIgWLGggmzLpsmSZS6a7QJcZhRX5ZcSNe6XN3PD8UMWlGw43RQsv9ZSbGfb7y7KW1qQ9qXDkzzJey6a59Pv93me86gI45wK0hhhvIsy3koYzyGMv0kYzyCMq+Sgcd8bGSoqSH/qi0pAGIeGGqGhRmj1pnmdoXiIMH6KMG4ljL9NGX/9pQAQxnuoIKHp/c9w7KMz2FN7FGWVVTCYtiOPiMguEJBHjMgvND8hjHcTxtsI4/qNBGjR6kW0nfwSl64N4fqtUfz9eAp3R0fR1XMVH3z8CRy1h7DN8h7yC83IzhegLTSDCtJpwnjmRgDkaKgR1fWtuH5rFAv+AOQTDocRCDzDzMwMJiYm8O33P6L96wuw7nIgV28GFaT2lbWSDsAbGmry7rTXwb8YBABEIhHEn1AohGAwiMXn/8L34AGGj7aiwrQNuQYOKkidhPHN/wcgs2DL1hFR2gGPZzoGEB/yiUxPY7LlOB46ajBUUwvL1lLkGopliIx0AVSE8c81VMTtn++sCRD2eOA/cRK+BieeHDyER3X1GHDsX4Lgsh2b0gWwqLUMp79oXw0AIDw1Bf+Jk/A2OOFzNWPB1RyDGKqpRUVxmazERcJ4VjoAb+XoiiJOV+uy3EvJI34/nnV8Be+BBvhczbFYaDqCxw1OPKqrx2BNLXaYY3acW093yB+vafWmKeu7VQgGlwoRQNi3gOC1mwi4u7F46jR8jYcTIeKUGHDsh3W5JjqU1oSKGLiKGLhKZyjuIYxj7N541HOfL5r84mUEuvoQ6LkahTh0GL7DTQlKJNoRq4lzSuyIv3yo1jL09t8Anj9HsP96NPnl3mishFhhRzxE+bIS7lR2xF+oRm/Cbkc9ZvtvAHLi+FCoxIBjP8qWayLpsEq4UEE6k02MqC63Ya7zEtDbnwTiTFIlBmPdERtWr6YEIIy/QgWpPZuaYC+3wXP+mxQQyQtTSYu+SJYMKkidairCXr47fSViLZowrFa16FrFsZkKUmc2NaG60o7ZlBBrK/FwtRId8W9HshbJoILUrqYm7LYu2dHXn15hHqjHUPU+lBtLkBN9Rd0yRKpBkUkFya2mIqoq7ZjrvIxIrwKIlROzrh5/NRzEaN8VWGwO5BQUgQrSWcJ4ppJxmUUF6ZyamrC30q6gJlYo4WzEQtNRzP4ygDm/H2P37mOnrQYaagIVpBqlj0YGFaQOWQnPeXcKJZYK09mIhSPHELp3HwDg9XoxPz+HkZFRmEqsKNiydWQ9T2emrITNaktZmP5PT8HnakZofDxhyfF6vZiZmcGuqlpoqPhwvQtEFhWki3J3rGmHuxuBrj6E/piIvqgrFpub3/0AfVEJdIbi2+msUZvk7pBbNMEOdzcCPVcQfupJSC4D3BkchpFbkF9oBmG8NN1lMjas9lTEDaulfx6efPrC5CN3fwMzl0JDRVBBalHShsliMxUkd8yOC5cQuXINoSeTayY3couc/LiSQbSOFhWxt9yGufHfV610cnKRW5BHRFBBcikZxeu146xaVwT7Pifm5/9JWOnvDA7Hy+5S8hilbYday+Coa8Tk1BQAYODXIYjSatlfBoAM0ZGrM6Kk7B1U7TuILeJ2aKOzv0XRQrIBkUkFqS2/0DyWR8RpnaH4JypIFcl+898AF0q4m6jKnzkAAAAASUVORK5CYII='), auto";
    },
    clearPad() {
      this.pad.clear();
      this.initPad();
      this.image = null;
      this.$emit("clear-signature", this.image);
    },
    closeDialog() {
      this.$emit("close-dialog");
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
.signature {
  margin-top: 2%;
  border: 2px solid gray;
  border-radius: 5px;
}
</style>

<template>
  <v-tooltip top>
    <span></span>
  </v-tooltip>
</template>

<script>
import Speech from "speak-tts";

export default {
  data() {
    return {
      playingText: false,
      voicesLoaded: false,
      speechSupport: false,
      voices: null
    };
  },
  mounted() {
    this.initSpeech();
  },
  methods: {
    speechSupported() {
      return !this.voices && Speech.browserSupport();
    },
    initSpeech() {
      if (this.speechSupported()) {
        window.speechSynthesis.onvoiceschanged = e => {
          this.voices = window.speechSynthesis.getVoices();
          for (var voice of this.voices) {
            if (voice.lang === "en-US" || voice.lang === "en-GB") {
              Speech.init({
                volume: 1,
                rate: 0.8,
                pitch: 0.8
              });
              Speech.setLanguage(voice.lang);
              Speech.setVoice(voice.name);
              this.voicesLoaded = true;
              this.$emit("voices-loaded");
              break;
            }
          }
        };
        window.speechSynthesis.getVoices();
      }
    },
    speak(text) {
      Speech.speak({
        text: text,
        onError: e => {
          console.log("Error on speech", e);
          this.$emit("speech-end");
        },
        onEnd: () => {
          console.log("End of speech");
          this.$emit("speech-end");
        }
      });
    }
  }
};
</script>

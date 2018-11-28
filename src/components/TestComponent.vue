<template>
  <v-container fluid style='margin-top: 60px;'>
    <v-flex xs12>
      <loader :loading="true" :color="'#ccc'" :size="'10px'"></loader>
    </v-flex>
  </v-container>
</template>

<script>
import Speech from "speak-tts";
import Loader from "vue-spinner/src/ScaleLoader.vue";

export default {
  data() {
    return {};
  },
  components: { Loader },
  mounted() {
    if (Speech.browserSupport()) {
      var voices = speechSynthesis.getVoices();
      for (var voice of voices) {
        if (voice.lang === "en-US" || voice.lang === "en-GB") {
          Speech.init({
            volume: 1,
            rate: 0.8,
            pitch: 0.8
          });
          Speech.setLanguage(null);
          Speech.setVoice(voice.name);
          Speech.speak({
            text: "This is an example text",
            onError: e => {
              console.log("Error on speech", e);
            },
            onEnd: () => {}
          });
          break;
        }
      }
    }
  },
  methods: {
    _prepareSpeakButton() {
      const speakButton = document.getElementById("play");
      const textarea = document.getElementById("text");
      const languages = document.getElementById("languages");
      speakButton.addEventListener("click", () => {
        Speech.setLanguage(languages.value);
        Speech.setVoice(
          languages.options[languages.selectedIndex].dataset.name
        );
        Speech.speak({
          text: textarea.value,
          onEnd: () => {
            console.log("end of text");
          }
        });
      });
    }
  }
};
</script>

<template>
  <IframeComponent :eaUrl="eaUrl"/>
</template>

<script>
import IframeComponent from "@/components/Iframe";

export default {
  data() {
    return {
      acSlug: null,
      eaUrl: null
    };
  },
  components: {
    IframeComponent
  },
  mounted() {
    this.acSlug = this.$store.getters.getRegistrations.ac[0].slug;
    this.switchAC();
  },
  methods: {
    switchAC() {
      this.eaUrl = `${process.env.VUE_APP_EA_API}backend/users?ac=${
        this.acSlug
      }&jwt=${
        this.$store.getters.getJWT
      }&XDEBUG_SESSION_START=netbeans-xdebug&base_url=${
        process.env.VUE_APP_BASE_API
      }`;
    }
  }
};
</script>

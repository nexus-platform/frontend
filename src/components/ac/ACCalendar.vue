<template>
  <v-layout>
    <template v-if="$store.getters.isStudent && !ac.user_data.ac_booking_enabled">
      <v-layout row wrap mt-3 class="animated fadeIn">
        <v-flex md6 offset-md3>
          <v-toolbar tabs color="indigo">
            <v-toolbar-title class="white--text">
              <v-icon class="white--text fa">school</v-icon>
              {{ ac.name }}
            </v-toolbar-title>
          </v-toolbar>
          <v-card>
            <v-card-text>
              <h3>Your request form has been successfully submitted.
                <br>You'll be notified when the Manager approves or denies it.
              </h3>
            </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
    </template>

    <IframeComponent v-else :eaUrl="eaUrl"/>
  </v-layout>
</template>

<script>
import IframeComponent from "@/components/Iframe";

export default {
  data() {
    return {
      acSlug: "",
      eaUrl: "",
      ac: null
    };
  },
  components: {
    IframeComponent
  },
  created() {
    if (this.$store.getters.isStudent) {
      this.ac = this.$store.getters.getACInfo;
      if (!this.ac.user_data.ac_form_full_submit) {
        this.$router.push(`/assessment-centre/${this.ac.slug}/index`);
      }
    }
  },
  mounted() {
    this.acSlug = this.$store.getters.getRegistrations.ac[0].slug;
    this.switchAC();
  },
  methods: {
    switchAC() {
      this.eaUrl = `${process.env.VUE_APP_EA_API}${
        this.$store.getters.isStudent ? "appointments" : "backend"
      }/index?ac=${this.acSlug}&jwt=${
        this.$store.getters.getJWT
      }&XDEBUG_SESSION_START=netbeans-xdebug&base_url=${
        process.env.VUE_APP_BASE_API
      }`;
    }
  }
};
</script>

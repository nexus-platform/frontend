<template>
  <v-container fluid mt-5>
    <v-layout row wrap justify-center mt-4>
      <v-flex xs12 sm6 md3 mr-2 mb-2 class="animated fadeIn" v-for="(registration, i) in registrations" :key="`reg-${i}`">
        <v-card slot="activator" class="elevation-1" :to="`/${registration.component}/${registration.slug}/index`">
          <v-toolbar dark :color="registration.component === 'dsa' ? 'blue' : 'deep-purple'">
            <v-icon v-if="registration.component === 'dsa'">school</v-icon>
            <v-icon v-else-if="registration.component === 'assessment-centre'">assessment</v-icon>
            <v-toolbar-title style="font-size: 16px;">
              {{ registration.type }}
              </v-toolbar-title>
          </v-toolbar>
          <v-container>
            <v-icon small>arrow_forward</v-icon>
            {{ registration.name }}
          </v-container>
        </v-card>
      </v-flex>
      </v-layout>
	</v-container>
</template>

<script>

export default {
  data() {
    return {
      registrations: []
    };
  },
  props: {
    source: String
  },
  created() {
    this.$store.state.authType = null;
    this.registrations = this.$store.state.registrations;
    console.log(this.registrations[0]);
  },
};
</script>

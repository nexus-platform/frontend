<template>
  <v-container fluid mt-5>
    <v-layout row wrap justify-center mt-3>
      <v-flex xs12 sm6 md3 mr-2 mb-2 class="animated fadeIn" v-for="(registration, i) in registrations" :key="`reg-${i}`">
        <v-card class="elevation-1" :to="`/${registration.component}/${registration.slug}/index`">
          <v-toolbar dark color="deep-purple">
            <v-toolbar-title style="font-size: 16px;">{{ registration.type }}</v-toolbar-title>
          </v-toolbar>
          <v-container>
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
    this.registrations = this.$store.state.registrations;
  },
  methods: {
    
  },
  computed: {
    
  }
};
</script>

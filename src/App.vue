<template>
  <v-app>
    <Toolbar/>
    <v-container mt-5 pt-5>
      <v-layout row wrap class="animated fadeIn">
        <router-view/>
      </v-layout>
    </v-container>
  </v-app>
</template>

<script>
import Toolbar from './views/Toolbar'
import Vue from 'vue'
import animate from 'animate.css'
//import { scrypt } from 'crypto';
Vue.use(animate);

export default {
  name: "App",
  components: {
    Toolbar
  },
  data() {
    return {};
  }
};
</script>

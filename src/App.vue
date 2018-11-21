<template>
  <v-app>
    <toolbar></toolbar>
    <router-view />
  </v-app>
</template>

<script>
import Toolbar from "./components/Toolbar";
import axios from "axios";

export default {
  name: "Nexus",
  data() {
    return {
    };
  },
  components: { Toolbar }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>

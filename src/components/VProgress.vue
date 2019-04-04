<template>
  <v-flex xs12>
    <p class="subheading text-uppercase text-xs-center primary--text">
      <template v-if="message">
        <span>{{ message }}</span>
        <br>
      </template>
      <v-progress-circular :width="2" indeterminate class="mt-3" color="blue-grey"></v-progress-circular>
    </p>
  </v-flex>
</template>

<script>
export default {
  data() {
    return {};
  },
  props: ["message"]
};
</script>
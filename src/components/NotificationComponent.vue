<template>
  <v-container fluid mt-5>

    <v-snackbar :timeout="5000" :bottom="true" :right="true" v-model="snackbar" :color="operationMessageType">
      <icon class="fa" name="info-circle"></icon> {{ operationMessage }}
      <v-btn flat @click.native="snackbar = false"><icon name="times"></icon></v-btn>
    </v-snackbar>

	</v-container>
</template>

<script>

export default {
  data() {
    return {
      snackbar: false,
      operationMessage: null,
      operationMessageType: null,
    };
  },
  mounted() {
    this.$root.$on('notify', (event) => {
      console.log(event);
    });
  },
  methods: {
    handleHttpResponse(event) {
      this.operationMessage = response.msg;
      this.operationMessageType = response.code;
      this.snackbar = true;
    }
  }
};
</script>
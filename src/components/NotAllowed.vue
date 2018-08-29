<template>
  <v-container fluid mt-5 class="animated fadeIn">
    <v-flex lg12>
      <img class="img-fluid" src="static/img/403.png" /><br />
      <router-link to="/">
        <v-btn color="primary text-lg-center"><icon name="home" class="gray--text"></icon>&nbsp;Go to Homepage</v-btn>
      </router-link>
    </v-flex>
  </v-container>
</template>

<style scoped>
a {
  text-decoration: none;
}
.img-fluid {
  max-width: 100%;
  height: auto;
}
</style>

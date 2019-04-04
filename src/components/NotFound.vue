<template>
  <v-flex xs12>
    <v-img :src="require('../assets/img/404.png')" contain height="300"></v-img>
    <p class="text-xs-center mt-3">
      <span class="title">Your request got lost in outer space...</span><br />
      <router-link to="/">
        <v-btn color="primary" class="mt-2">
          <v-icon class="fa">home</v-icon>Go to Homepage
        </v-btn>
      </router-link>
    </p>
  </v-flex>
</template>

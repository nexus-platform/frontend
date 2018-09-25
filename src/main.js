import Vue from 'vue';
import App from './App';
import router from './router';

import Vuetify from 'vuetify';
import Vuex from 'vuex';
import store from './store';

import 'vue-awesome/icons';
import Icon from 'vue-awesome/components/Icon';

import DaySpanVuetify from 'dayspan-vuetify';

import 'vuetify/dist/vuetify.min.css';
import 'material-design-icons-iconfont/dist/material-design-icons.css';
import 'dayspan-vuetify/dist/lib/dayspan-vuetify.min.css';
import animate from "animate.css";

Vue.config.productionTip = false;

Vue.component('icon', Icon);


Vue.use(animate);
Vue.use(Vuetify);
Vue.use(Vuex);
Vue.use(DaySpanVuetify, {
  methods: {
    getDefaultEventColor() {
      return '#1976d2';
    }
  }
});


new Vue({
  el: '#app',
  router,
  store,
  components: {
    App
  },
  data: {
    
  },
  template: '<App/>'
});

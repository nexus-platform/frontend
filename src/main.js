import Vue from 'vue';
import App from './App';
import router from './router';

import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';
import Vuex from 'vuex';
import store from './store';
import 'vue-awesome/icons';
import Icon from 'vue-awesome/components/Icon';

Vue.component('icon', Icon);

import animate from "animate.css";

Vue.use(animate);
Vue.use(Vuetify);
Vue.use(Vuex);

Vue.config.productionTip = false;

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

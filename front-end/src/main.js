import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import {BootstrapVue, IconsPlugin} from 'bootstrap-vue'
import VueClipboard from 'vue-clipboard2'

import '@fortawesome/fontawesome-free/css/brands.css';
import '@fortawesome/fontawesome-free/css/regular.css';
import '@fortawesome/fontawesome-free/css/solid.css';
import '@fortawesome/fontawesome-free/css/fontawesome.css';

Vue.config.productionTip = false;

Vue.use(BootstrapVue);
Vue.use(VueClipboard);
Vue.use(IconsPlugin);
Vue.use(VueRouter);

// app.js
import './styles/bootstrap.scss';

import {createRouter} from './router';
import store from './store'

export async function createApp(context = {}) {
  // Read arguments
  const {
    beforeApp = () => {},
    afterApp = () => {}
  } = context;

  const router = createRouter();

  await beforeApp({
    router,
  });

  const app = new Vue({
    router,
    store,
    render: h => h(App)
  });

  const result = {
    app,
    router,
    store
  };

  await afterApp(result);

  return result
}

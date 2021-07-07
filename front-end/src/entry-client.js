import { loadAsyncComponents } from '@akryum/vue-cli-plugin-ssr/client'

import { createApp } from './main'

// import Vue from 'vue';
// import VueToastr from 'vue-toastr';

createApp({
  async beforeApp ({
    router
  }) {
    await loadAsyncComponents({ router })
  },

  afterApp ({
    app,
    router,
    store
  }) {

    router.onReady(() => {

      if (window.__LAYER_STATE__) {
        // We initialize the store state with the data injected from the server
        store.replaceState(window.__LAYER_STATE__)
      }

      // Vue.use(VueToastr);
      app.$mount('#app')
    })
  }
});

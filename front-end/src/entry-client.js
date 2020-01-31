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
  }) {

    router.onReady(() => {

      // Vue.use(VueToastr);
      app.$mount('#app')
    })
  }
})

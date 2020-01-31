import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter);

import Main from '../components/Main.vue';
import Layout from '../components/Layout.vue';
import SubmitLambdaLayer from '../components/SubmitLambdaLayer.vue';
import SuccessfulSubmission from '../components/SuccessfulSubmission.vue';
import LambdaLayerDownloader from '../components/LambdaLayerDownloader.vue';
import ViewLambdaLayer from '../components/ViewLambdaLayer.vue';

export function createRouter() {
    const routes = [
      {
        path: '/',
        component: Layout,
        children: [
          {
            path: '',
            component: Main
          },
          {
            path: '/submit',
            component: SubmitLambdaLayer
          },
          {
            path: '/submission-successful',
            component: SuccessfulSubmission
          },
          {
            path: '/submit',
            component: SubmitLambdaLayer
          },
          {
            path: '/layer-downloader',
            component: LambdaLayerDownloader
          },
          {
            path: '/layer/:layerId',
            component: ViewLambdaLayer
          }
        ]
      }
    ];

    const router = new VueRouter({
      mode: 'history',
      base: process.env.BASE_URL,
      routes
    });

    return router;
}
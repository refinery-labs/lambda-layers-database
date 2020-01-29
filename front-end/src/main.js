import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import {BootstrapVue, IconsPlugin} from 'bootstrap-vue'
import {library} from '@fortawesome/fontawesome-svg-core'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import {faFontAwesome} from '@fortawesome/free-brands-svg-icons'
import {fab} from '@fortawesome/free-brands-svg-icons';
import VueClipboard from 'vue-clipboard2'

import VueToastr from 'vue-toastr';

import {faEdit} from '@fortawesome/fontawesome-free-solid'

library.add(fab, faEdit, faFontAwesome);

Vue.component('font-awesome-icon', FontAwesomeIcon);

Vue.config.productionTip = false;

Vue.use(BootstrapVue);
Vue.use(VueClipboard);
Vue.use(IconsPlugin);
Vue.use(VueRouter);
Vue.use(VueToastr);

// app.js
import './styles/bootstrap.scss';

import Main from './components/Main.vue';
import Layout from './components/Layout.vue';
import SubmitLambdaLayer from './components/SubmitLambdaLayer.vue';
import SuccessfulSubmission from './components/SuccessfulSubmission.vue';
import LambdaLayerDownloader from './components/LambdaLayerDownloader.vue';
import ViewLambdaLayer from './components/ViewLambdaLayer.vue';

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
    routes, // short for `routes: routes`
    base: '/',
    // mode: 'history'
});

new Vue({
    router,
    render: h => h(App),
}).$mount('#app');

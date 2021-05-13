import Vue from 'vue'
import VueCompositionApi from '@vue/composition-api'

import Buefy from 'buefy'
// import 'buefy/dist/buefy.css'
import './sass/bingoBuefy.scss'
import '@mdi/font/css/materialdesignicons.css'

import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false

Vue.use(VueCompositionApi)
Vue.use(Buefy)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

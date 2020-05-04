// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import VueI18n from 'vue-i18n'
import VueClipboard from 'vue-clipboard2'

import Buefy from 'buefy'
import 'buefy/dist/buefy.css'

import App from './App'
import router from './router'

Vue.use(Buefy)
Vue.config.productionTip = false
Vue.use(VueClipboard)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})

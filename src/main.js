// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import VueI18n from 'vue-i18n'
import VueClipboard from 'vue-clipboard2'

import Buefy from 'buefy'
import 'buefy/dist/buefy.css'

import Chat from 'vue-beautiful-chat'

import App from './App'
import router from './router'

import CopyLink from './components/CopyLink.vue'
import GameTitle from './components/GameTitle.vue'
import Footer from './components/Footer.vue'

Vue.use(Buefy)
Vue.use(Chat)

Vue.config.productionTip = false
Vue.use(VueClipboard)

Vue.component('CopyLink', CopyLink)
Vue.component('GameTitle', GameTitle)
Vue.component('Footer', Footer)

// Focus input. Use `v-focus` attribute
Vue.directive('focus', {
  inserted: function (el) {
    el.focus()
  }
})

Vue.prototype.$GAME_CODE_LENGTH = 4
Vue.prototype.$GAME_INVITE_LINK = 'https://vett.space/#/?g='

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})

import Vue from 'vue'
import Vuex from 'vuex'
import VueClipboard from 'vue-clipboard2'

import Button from 'buefy/dist/components/button'
import Checkbox from 'buefy/dist/components/checkbox'
import Input from 'buefy/dist/components/input'
import Radio from 'buefy/dist/components/radio'
import Toast from 'buefy/dist/components/toast'
import Snackbar from 'buefy/dist/components/snackbar'

import Chat from 'vue-beautiful-chat'

import App from './App.vue'
import router from './router'

import CopyLink from './components/CopyLink.vue'
import GameTitle from './components/GameTitle.vue'
import Footer from './components/Footer.vue'

Vue.use(Button)
Vue.use(Checkbox)
Vue.use(Input)
Vue.use(Radio)
Vue.use(Toast)
Vue.use(Snackbar)
Vue.use(Chat)
Vue.use(Vuex)

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
Vue.prototype.$GAME_INVITE_LINK = 'https://dots.subinsb.com/#/?g='
Vue.prototype.$GAME_TURN_TIME = 15 // in seconds

Vue.prototype.isGameCodeValid = (gameCode) => {
  try {
    const [gridSize, gameID] = gameCode.split('.')

    if (gameID.length !== Vue.prototype.$GAME_CODE_LENGTH) {
      return false
    }

    let [x, y] = gridSize.split('x')

    x = parseInt(x)
    y = parseInt(y)

    if (x < 1 || y < 1) {
      return false
    }

    return true
  } catch (e) {
    console.log(e)
    return false
  }
}

var announceURLs = [
  'wss://wsswt.herokuapp.com/',
  'wss://tracker.openwebtorrent.com',
  'ws://127.0.0.1:5000',
  'wss://tracker.sloppyta.co:443/announce',
  'wss://tracker.novage.com.ua:443/announce',
  'wss://tracker.btorrent.xyz:443/announce'
  // 'ws://192.168.43.64:8085'
]

if (window.location.hostname === 'localhost') {
  announceURLs = ['ws://localhost:5000']
}

Vue.prototype.$GAME_ANNOUNCE_URLS = announceURLs

// For adding a new tracker
window.$ADD_TRACKER = function (trackerURL) {
  if (announceURLs.indexOf(trackerURL) === -1) {
    if (window.p2pt) {
      window.p2pt.addTracker(trackerURL)
    }
    announceURLs.push(trackerURL)
  }
}

const store = new Vuex.Store({
  state: {
    audio: true,
    name: ''
  },
  mutations: {
    init (state) {
      // Check if the ID exists
      if (window.localStorage.getItem('settings')) {
        this.replaceState(
          Object.assign(state, JSON.parse(window.localStorage.getItem('settings')))
        )
      }
    },

    setName (state, value) {
      state.name = value
    },

    setAudio (state, value) {
      state.audio = value
    }
  }
})

store.commit('init')

// Store in localstorage
store.subscribe((mutation, state) => {
  // Store the state object as a JSON string
  window.localStorage.setItem('settings', JSON.stringify(state))
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})

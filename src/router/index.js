import Vue from 'vue'
import Router from 'vue-router'
import Index from '@/components/Index'
import Register from '@/components/Register'
import Game from '@/components/Game'
import Settings from '@/components/Settings'
import FindPlayers from '@/components/FindPlayers'
import About from '@/components/About'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Index',
      component: Index
    },
    {
      path: '/register',
      name: 'Register',
      component: Register
    },
    {
      path: '/game',
      name: 'Game',
      component: Game
    },
    {
      path: '/settings',
      name: 'Settings',
      component: Settings
    },
    {
      path: '/find-players',
      name: 'FindPlayers',
      component: FindPlayers
    },
    {
      path: '/about',
      name: 'About',
      component: About
    }
  ]
})

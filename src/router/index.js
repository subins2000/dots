import Vue from 'vue'
import Router from 'vue-router'
import Index from '@/components/Index.vue'
import NewGame from '@/components/NewGame.vue'
import Register from '@/components/Register.vue'
import Game from '@/components/Game.vue'
import Settings from '@/components/Settings.vue'
import FindPlayers from '@/components/FindPlayers.vue'
import About from '@/components/About.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Index',
      component: Index
    },
    {
      path: '/new',
      name: 'NewGame',
      component: NewGame
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

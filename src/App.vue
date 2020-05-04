<template>
  <div id="app">
    <GameTitle v-if='displayTitle' />
    <transition name='slide'>
      <router-view/>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'App',

  computed: {
    displayTitle () {
      return this.$route.name === 'Index' || this.$route.name === 'Register'
    }
  }
}
</script>

<style>
#app {
  font-family: 'Ubuntu', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>

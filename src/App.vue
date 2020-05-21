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
      return this.$route.name === 'Index' || this.$route.name === 'Register' || this.$route.name === 'Settings'
    }
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400&display=swap');

#app {
  font-family: 'Ubuntu', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>

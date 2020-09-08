<template>
  <div class='container has-text-centered' id='game-title'>
    <div class='content'>
      <h1 class='title is-1'><router-link to="/">Vett</router-link></h1>
      <h2 class='title is-3'>The <router-link to='/about'>Dots and Boxes</router-link> Game<br/><span class='is-size-5'>you played in school :)</span></h2>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GameTitle'
}
</script>

<style>
#game-title {
  padding-top: 5vh;
}
</style>

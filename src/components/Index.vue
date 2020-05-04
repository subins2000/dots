<template>
  <div class='container has-text-centered'>
    <div class='content'>
      <h1 class='title is-1'>Vett</h1>
      <h2 class='title is-3'>The <a href='https://en.wikipedia.org/wiki/Dots_and_Boxes' target='_blank'>Dots and Boxes</a> Game<br/><span class='is-size-5'>you played in school :)</span></h2>
    </div>
    
    <div class='content'>
      <button class='button is-medium is-primary is-center' @click='newGame'>Start New Game</button>
    </div>
    <div class='content'>
      <strong class='is-primary is-size-3 has-text-centered'>OR</strong>
    </div>

    <form class='content' @submit='joinGame'>
      <div class='field'>
        <input type='text' class='input is-primary is-focused' id='gameCode' name='gameCode' v-model='gameCode' autocomplete='off' placeholder='Paste the Game Code here' /> <button class="button is-link is-info">Join Game</button>
      </div>
    </form>

    <Footer/>
  </div>
</template>

<script>
import Footer from './Footer.vue'

export default {
  name: 'Index',

  components: { Footer },

  data () {
    return {
      gameCode: ''
    }
  },

  methods:{
    newGame () {
      this.$router.push('register')
      localStorage.setItem('gameCode', 0) // 0 indicates new game
    },
    
    joinGame () {
      if (this.gameCode.length !== 6) {
        this.$buefy.toast.open('Please enter valid Game Code')
        this.$router.push('')
      } else {
        localStorage.setItem('gameCode',this.gname)
        this.$router.push('register')
      }
    }
  }
}
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->

<style scoped>
.container {
  padding-top: 5vh;
}

#gameCode {
  width: 50%;
}
</style>

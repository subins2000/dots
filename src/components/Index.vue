<template>
  <div class='container has-text-centered'>  
    <br/>
    <div class='content'>
      <div class='columns'>
        <div class='column has-text-right starters'>
          <button class='button is-medium is-primary is-center' @click='newGame'>Host A New Game</button>
        </div>
        <div class='column has-text-left starters'>
          <router-link to='/find-players' class='button is-success is-medium'>Play With A Random Person</router-link>
        </div>
      </div>
    </div>

    <div class='content'>
      <strong class='is-primary is-size-3 has-text-centered'>OR</strong>
    </div>

    <form class='content' @submit='joinGame'>
      <div class='field'>
        <input type='text' class='input is-primary' id='gameCode' name='gameCode' v-model='gameCode' autocomplete='off' placeholder='Paste the Game Code here' /> <button class="button is-link is-info">Join Game</button>
      </div>
    </form>

    <div class='content'>
      <router-link to='/settings' class='button is-warning'>Game Settings</router-link>
    </div>

    <Footer/>
  </div>
</template>

<script>
export default {
  name: 'Index',

  data () {
    return {
      gameCode: ''
    }
  },

  methods: {
    newGame () {
      this.$router.push('register')

      var gameCode = Math.random().toString(36).substr(2, this.$GAME_CODE_LENGTH)

      localStorage.setItem('gameCreator', true)
      localStorage.setItem('gameCode', gameCode)
    },

    joinGame (e) {
      e.preventDefault()

      if (this.gameCode.length !== this.$GAME_CODE_LENGTH) {
        this.$buefy.toast.open('Please enter valid Game Code')
      } else {
        localStorage.setItem('gameCode', this.gameCode)
        this.$router.push('register')
      }
    }
  },

  mounted () {
    localStorage.removeItem('gameCode')

    var gameCode = this.$route.query.g
    if (gameCode) {
      this.gameCode = gameCode
    }
  }
}
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->

<style scoped>
#gameCode {
  width: 50%;
}

@media screen and (max-width: 960px) {
  .starters {
    text-align: center !important;
  }
}
</style>

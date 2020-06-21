<template>
  <div>
    <GameTitle />
    <div class='container has-text-centered'>  
      <br/>
      <div class='content'>
        <div class='columns'>
          <div class='column has-text-right starters'>
            <router-link to='/new' class='button is-medium is-primary is-center'>Host A New Game</router-link>
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
        <router-link to='/settings' class='button is-warning'>Game Settings</router-link>&nbsp;
        <router-link to='/about' class='button is-warning'>Help</router-link>
      </div>

      <Footer/>
    </div>
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
    joinGame (e) {
      e.preventDefault()

      if (!this.isGameCodeValid(this.gameCode)) {
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

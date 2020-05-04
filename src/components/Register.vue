<template>
  <div>
    <div class='container has-text-centered'>
      <form @submit='playGame'>
        <div class='content'>
          <p>What is your name ?</p>
          <input type='text' class='input' id='playerName' name='name' v-model='playerName' placeholder='Type your name here' />
        </div>
        <div class='content'>
          <button class='button is-medium is-success is-center'>Play !</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Register',
  data () {
    return {
      playerName: localStorage.getItem('name')
    }
  },

  methods: {
    playGame (e) {
      e.preventDefault()

      this.$buefy.toast.open({
        message: 'Hi ' + this.playerName,
        type: 'is-success'
      })

      localStorage.setItem('name', this.playerName)

      this.$router.push('game')
    }
  },

  mounted () {
    if (!localStorage.getItem('gameCode') || localStorage.getItem('gameCode').length !== this.$GAME_CODE_LENGTH) {
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
#playerName {
  width: 70%;
}
</style>

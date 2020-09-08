<template>
  <div>
    <GameTitle />
    <div class='container has-text-centered'>
      <form @submit='playGame'>
        <div class='content'>
          <label class='label'>What is your name ?</label>
          <input type='text' class='input' id='playerName' name='name' v-model='playerName' ref='nameInput' placeholder='Type your name here' />
        </div>
        <div class='content'>
          <button class='button is-medium is-success is-center'>Join Game !</button>
        </div><br/>
        <CopyLink />
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Register',
  data () {
    return {
      playerName: this.$store.state.name
    }
  },

  methods: {
    playGame (e) {
      e.preventDefault()

      if (this.playerName.trim() === '') {
        this.$buefy.toast.open({
          message: 'Name cannot be blank',
          type: 'is-warning'
        })
        return
      }

      this.$buefy.toast.open({
        message: 'Hi ' + this.playerName,
        type: 'is-success'
      })

      this.$store.commit('setName', this.playerName)

      this.$router.push('game')
    }
  },

  mounted () {
    if (!this.isGameCodeValid(localStorage.getItem('gameCode'))) {
      this.$router.push('/')
    }

    if (this.playerName === '') {
      this.$refs.nameInput.focus()
    }
  }
}
</script>

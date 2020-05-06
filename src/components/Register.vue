<template>
  <div>
    <div class='container has-text-centered'>
      <form @submit='playGame'>
        <div class='content'>
          <p>What is your name ?</p>
          <input type='text' class='input' id='playerName' name='name' v-model='playerName' v-focus placeholder='Type your name here' />
        </div>
        <div class='content'>
          <button class='button is-medium is-success is-center'>Join Game !</button>
        </div><br/>
        <div class='content'>
          <p>Share this link with your friend for them to join the game :</p>
          <div class="row">
            <div class="col-sm-12">
              <div class="form-control wizard-form-control d-flex align-items-center testing-code px-20px mb-10px">
                <input class='input is-medium is-flat' id='linkInput' @click="$event.target.select()" :value='gameLink' readonly />
                <span class='button is-primary is-medium' @click='copyGameLink' v-clipboard='gameLink'>Copy</span>
              </div>
            </div>
          </div>
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
      playerName: localStorage.getItem('name'),
      gameLink: this.$GAME_INVITE_LINK + localStorage.getItem('gameCode')
    }
  },

  methods: {
    copyGameLink () {
      this.$buefy.toast.open({
        duration: 2000,
        message: `Invite Link Copied !`,
        position: 'is-bottom',
        type: 'is-primary'
      })
    },

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
#playerName, #linkInput {
  width: 70%;
}
</style>

<template>
  <div class='content'>
    <p>Share this link with your friends for them to join the game :</p>
    <div class="row">
      <div class="col-sm-12">
        <div class="form-control wizard-form-control d-flex align-items-center testing-code px-20px mb-10px">
          <input class='input is-medium is-flat' id='linkInput' @click="$event.target.select()" :value='gameLink' readonly />
          <span class='button is-primary is-medium' @click='copyGameLink' v-clipboard='gameLink'>Copy</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CopyLink',

  data () {
    return {
      gameLink: this.$GAME_INVITE_LINK + localStorage.getItem('gameCode')
    }
  },

  methods: {
    copyGameLink () {
      this.$buefy.toast.open({
        duration: 2000,
        message: `Invite Link Copied !`,
        position: 'is-top',
        type: 'is-success'
      })
    },
  }
}
</script>

<style scoped>
#linkInput {
  width: 70%;
}
</style>
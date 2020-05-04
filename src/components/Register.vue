<template>
  <div>
    <div class='container has-text-centered'>
      <div class='content'>
        <p>What is your name ?</p>
        <input type='text' class='input' id='playerName' name='name' v-model='playerName' placeholder='Type your name here' />
      </div>
      <div class='content'>
        <button class='button is-medium is-success is-center' @click='success'>Play !</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Register',
  data () {
    return {
      playerName: ''
    }
  },
  methods: {
    success () {
      this.$buefy.toast.open({
        message: 'Hi ' + this.playerName,
        type: 'is-success'
      })
      localStorage.setItem('name', this.playerName)

      this.$router.push('game')
    }
  }
}
</script>

<style scoped>
#playerName {
  width: 70%;
}
</style>

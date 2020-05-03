<template>
  <div>
    <div class="container has-text-centered">
      <p>What is your name ?</p><br/>
      <input type="text" class="input" name="name" v-model="pname" placeholder="Type your name here" />
    </div><br/>
    <div class="has-text-centered">
      <button class="button is-medium is-success is-center" @click="success">Play !</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Register',
  data () {
    return {
      pname: ''
    }
  },
  methods: {
    success () {
      this.$buefy.toast.open({
        message: 'Hi ' + this.pname,
        type: 'is-success'
      })
      localStorage.setItem('name', this.pname)

      this.$router.push('game')
    }
  }
}
</script>

<style scoped>
.container {
  padding-top: 10vh;
}
button {
  margin-top: 4px;
  margin: 0 auto;
  display: inline-block;
}
</style>

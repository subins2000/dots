<template>
<div>
  <div class="container">
    <h1 class="title is-1">Register Here</h1>
      <input type="text" class="input" name="name" v-model="pname" />
  </div>
  <div  class="has-text-centered">
  <button class="button is-medium is-success is-center" @click="success">Register</button>
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
      localStorage.setItem('YourItem', this.pname)
    }
  }
}
</script>
Sound kelkathilla,nte mic and speaker illa
<style scoped>
button{
  margin-top: 4px;
  margin: 0 auto;
  display: inline-block;
}
</style>

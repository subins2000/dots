<template>
  <div>
    <div class="container has-text-centered">
    <h1 class="title is-1">{{ msg }}</h1>
   <input type="text" class="input" name="name" v-model="gname" placeholder="Paste the Game Name here and Press Enter" @keyup.enter="join" /><br/><br/>
   <strong class="is-primary has-text-centered">OR</strong><br/>
    </div><br/>
   <div class="has-text-centered">
      <button class="button is-medium is-primary is-center" @click="nwgame">START New Game</button>
    </div>
</div>
</template>

<script>
export default {
  name: 'Index',
  data () {
    return {
      gname: ''
    }
  },
  methods:{
    nwgame () {
      this.$router.push('register')
      localStorage.setItem('gameName',0)
    },
    join(){
      if (this.gname===''){
        alert("Please Enter Valid Game Name")
        this.$router.push('')
      }
      localStorage.setItem('gameName',this.gname)
      this.$router.push('register')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->

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

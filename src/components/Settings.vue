<template>
  <div>
    <div class='container'>
      <form @submit='saveSettings'>
        <div class='field'>
          <label class='label'>Name</label>
          <div class='control'>
            <input type='text' class='input' id='name' name='name' v-model='name' v-focus placeholder='Type your name here' />
          </div>
        </div>
        <div class='field'>
          <div class='control'>
            <b-checkbox v-model='audio'>Sound Effects</b-checkbox>
          </div>
        </div>
        <div class='field'>
          <button class='button is-medium is-success is-center'>Save</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Settings',
  data () {
    return {
      audio: this.$store.state.audio,
      name: this.$store.state.name
    }
  },

  methods: {
    saveSettings (e) {
      e.preventDefault()

      this.$store.commit('setName', this.name)
      this.$store.commit('setAudio', this.audio)

      this.$buefy.toast.open({
        message: 'Saved',
        type: 'is-success'
      })
    }
  }
}
</script>
<template>
  <div>
    <GameTitle />
    <div class='container has-text-centered'>
      <form @submit='startGame'>
        <div class='content'>
          <p>Choose the grid size (rows x columns)</p>
          <div class='gridSizes'>
            <div class='gridSize' v-for='size in gridSizes'>
              <b-radio-button v-model='gridSize'
                :native-value='size'
                type='is-success'>
                <span>{{ size }}</span>
              </b-radio-button>
            </div><br/><br/>
            <b-radio-button class='gridSize' v-model='gridSize' native-value='custom' type='is-success'>Custom</b-radio-button>
            <div class='customSize is-mobile customSize' v-if='gridSize === "custom"'>
              <b-input class='part' type='number' v-model='customSizeX' maxlength="2">x</b-input>
              <div class='part'>x</div>
              <b-input class='part' type='number' v-model='customSizeY' maxlength="2"></b-input>
            </div>
          </div>
        </div>
        <div class='content'>
          <button class='button is-medium is-primary is-center'>Start Game</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NewGame',
  data () {
    return {
      gridSize: '',
      gridSizes: [
        '3x8',
        '4x4',
        '6x6',
        '8x8',
        '10x10'
      ],
      customSizeX: 0,
      customSizeY: 0
    }
  },

  methods: {
    startGame (e) {
      e.preventDefault()

      let gridSize = this.gridSize
      
      if (gridSize === 'custom') {
        const x = this.customSizeX
        const y = this.customSizeY

        if (x < 1 && y < 1) {
          this.$buefy.toast.open({
            message: 'Invalid size',
            type: 'is-warning'
          })
          return
        }
        gridSize = `${x}x${y}`
      }

      const gameID = Math.random().toString(36).substr(2, this.$GAME_CODE_LENGTH)
      const gameCode = gridSize + '.' + gameID

      localStorage.setItem('gameCode', gameCode)

      this.$router.push('register')
    }
  }
}
</script>

<style>
.gridSize {
  display: inline-block;
  margin-right: 5px;
}
.gridSize input[type=radio] {
  display: none;
}
.customSize {
  display: table;
  max-width: 160px;
  margin: 10px auto;
}
.customSize .part {
  display: inline-block;
  vertical-align: top;
  max-width: 40%;
}
</style>
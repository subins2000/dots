<!--
Vett, online multiplayer Dots-and-Boxes game
https://subinsb.com/vett
Copyright (C) 2020 Subin Siby
Copyright (C) 2020 Athul Cyriac Ajay

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.
-->

<template>
  <div>
    <div id='header' class='has-background-primary'>
      <div class='container'>
        <nav class='level is-mobile'>
          <div class='level-left'>
            <span class='level-item'>
              <router-link to='/' class='button'>Vett !</router-link>
              &nbsp;&nbsp;
              <span class='has-text-weight-bold' title='Game Code'></b>{{ gameCode }}</span>
            </span>
          </div>
          <span class='level-item has-text-centered'>{{ status }}</span>
          <div class='level-right' style='text-align: right;'>
            <span class='level-item' v-if='friendName'>Playing with {{ friendName }}</span>
          </div>
        </nav>
      </div>
    </div>
    <div class='container' id='game-content'>
      <div class='content' id='game-wrapper'>
        <svg id='game' ref='game' viewBox='0 0 260 260' preserveAspectRatio='xMidYMid meet'></svg>
        <div class='is-hidden'>
          <audio v-for='a in audio' v-bind:id='"audio-" + a' v-bind:ref='"audio-" + a' async='async'>
            <source v-bind:src='"static/" + a + ".ogg"' type='audio/ogg'>
          </audio>
        </div>
      </div>
      <div>
        <table class='table scoreboard content'>
          <tbody>
            <tr v-for='p in players' v-bind:style='"border: 3px dashed " + p.colors[0]' v-if='reRenderScoreboard'>
              <td>{{ p.name }}</td>
              <td>{{ p.score }}</td>
            </tr>
          </tbody>
        </table>
        <div class='content' v-if='!gameFinished'>
          <span v-if='myTurn'>Your turn</span>
          <span v-else>Waiting for opponent's move</span>
        </div>
        <div id='game-end' class='content' v-if='gameFinished'>
          <h1 class='is-size-1'>Game Over</h1>
          <div>
            <div v-if='gameStatus === "draw"'>
              <h3 class='is-size-3'>Draw !</h3>
              <p>Y'all played it to a draw ! 😱</p>
            </div>
            <div v-else-if='gameStatus === "win"'>
              <h3 class='is-size-3'>You win !</h3>
              <p>You won the game ! 🥳🥳</p>
            </div>
            <div v-else>
              <h3 class='is-size-3'>You lost !</h3>
              <p>Tough luck, you lost this game :(</p>
            </div>
          </div><br/>
          <b-button size='is-medium' type='is-success' @click='playAgain'>Play Again !</b-button><br/><br/>
        </div>
      </div>
      <CopyLink v-if='gameStatus === "playerwait"' />
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3'
import { P2PT } from 'p2pt'

var randomColor = () => {
  return `hsla(${~~(360 * Math.random())},70%,50%,0.8)`
}

var announceURLs = [
  "wss://tracker.openwebtorrent.com",
  "wss://tracker.sloppyta.co:443/announce",
  "wss://tracker.novage.com.ua:443/announce",
  "wss://tracker.btorrent.xyz:443/announce",
]

if (window.location.hostname === "localhost") {
  announceURLs = ["ws://localhost:5000"]
}

var gridSize = 6
var cellWidth = 40
var cellMargin = 5

export default {
  name: 'Game',
  
  friend: null,
  p2pt: null,

  myID: '',

  data () {
    return {
      status: 'Waiting for player...',
      myName: localStorage.getItem('name'),
      friendName: '',

      myTurn: false,
      myScore: 0,
      opponentScore: 0,
      gameCode: 'ckO2',
      gameFinished: false,
      gameStatus: 'playerwait',
      audio: ['box', 'mark', 'end'],

      players: {},
      playerTurns: [],

      // For some weird reason, score update isn't immediate after property change. Tried :key and .$set and yet it didn't work. So had to go with this terrible hack
      reRenderScoreboard: true
    }
  },

  watch: {
    playerTurns: {
      deep: true,
      
      handler () {
        this.myTurn = this.playerTurns.indexOf(true) == this.myID
      }
    }
  },

  methods: {
    init () {
      if (!localStorage.getItem('gameCode') || localStorage.getItem('gameCode').length !== this.$GAME_CODE_LENGTH) {
        this.$router.push('/')
        return
      }

      this.game = this.$refs.game
      this.svg = d3.select(this.$refs.game)
      this.makeGameBoard()

      this.gameCode = localStorage.getItem('gameCode')

      if (!sessionStorage.getItem('myID')) {
        sessionStorage.setItem('myID', parseInt(Math.random().toString().substr(2, 4)))
      }

      this.myID = sessionStorage.getItem('myID')

      this.players[this.myID] = {
        name: this.myName,
        colors: [randomColor()],
        score: 0
      }
      this.$set(this.playerTurns, this.myID, false)

      this.connect()
    },

    connect () {
      this.p2pt = new P2PT(announceURLs, 'vett' + this.gameCode)

      const $this = this

      this.p2pt.on('peerconnect', (peer) => {
        if (this.gameFinished) {
          return
        }

        $this.friend = peer

        this.p2pt.send(peer, JSON.stringify({
          type: 'init',
          playerID: $this.myID,
          name: $this.myName,
          colors: $this.players[$this.myID].colors
        }))

        $this.gameStatus = 'joined'
        $this.status = ''
      })

      this.p2pt.on('peerclose', (peer) => {
        $this.gameStatus = 'close'
        $this.status = 'Connection lost'
      })

      this.p2pt.on('msg', (peer, msg) => {
        msg = JSON.parse(msg)

        if (msg.type === 'move') {
          var line = msg.line === 'h' ? 'hline' : 'vline'
          var [row, col] = msg.move.split('-')

          $this.activateLine($this.game.querySelector('.' + line + '[id="' + row + '-' + col + '"]'), msg.playerID)
        } else if (msg.type === 'init') {
          $this.friendName = msg.name
          
          $this.players[msg.playerID] = {
            name: msg.name,
            colors: msg.colors,
            score: 0
          }

          $this.playerTurns[msg.playerID] = false

          // Set first item in array to true
          $this.$set(this.playerTurns, $this.playerTurns.indexOf(false), true)
        } else if (msg.type === 'playagain') {
          this.$buefy.toast.open({
            message: 'Your opponent wants to play again. Click the Play Again button at the bottom if you want to.',
            position: 'is-top',
            type: 'is-warning',
            duration: 6000
          })
        }
      })

      this.p2pt.start()
    },

    makeGameBoard () {
      // Add a bit margin
      var game = this.svg.append('g')
        .attr('transform', 'translate(10, 10)')

      var row, cell
      for (var i = 0; i < gridSize; i++) {
        // Make grid
        row = game.append('g')
          .attr('class', 'row')
          .attr('transform', () => {
            return 'translate(0, ' + cellWidth * i + ')'
          })
        for (var j = 0; j < gridSize; j++) {
          cell = row.append('g')
            .attr('class', 'col')
            .attr('transform', () => {
              return 'translate(' + cellWidth * j + ', 0)'
            })

          // Add box
          cell.append('rect')
            .attr('class', 'cell')
            .attr('width', cellWidth)
            .attr('height', cellWidth)
            .attr('x', cellMargin - 3)
            .attr('y', cellMargin - 3)
            .attr('id', i + '-' + j)

          // Add lines
          cell.append('line')
            .attr('class', 'line vline')
            .attr('y1', cellMargin)
            .attr('y2', cellWidth - cellMargin)
            .attr('x1', 0)
            .attr('x2', 0)
            .attr('stroke-width', cellMargin)
            .attr('stroke-linecap', 'round')
            .attr('id', i + '-' + j)

          cell.append('line')
            .attr('class', 'line hline')
            .attr('x1', cellMargin)
            .attr('x2', cellWidth - cellMargin)
            .attr('y1', 0)
            .attr('y2', 0)
            .attr('stroke-width', cellMargin)
            .attr('stroke-linecap', 'round')
            .attr('id', i + '-' + j)
          
          cell.append('circle')
            .attr('class', 'dot')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', cellMargin)

          // Add horizontal line below last row elems
          if (i == gridSize - 1) {
            cell.append('line')
              .attr('class', 'line hline')
              .attr('x1', cellMargin)
              .attr('x2', cellWidth - cellMargin)
              .attr('y1', cellWidth)
              .attr('y2', cellWidth)
              .attr('stroke-width', cellMargin)
              .attr('stroke-linecap', 'round')
              .attr('id', (i + 1) + '-' + j)

            cell.append('circle')
              .attr('class', 'dot')
              .attr('cx', 0)
              .attr('cy', cellWidth)
              .attr('r', cellMargin)
          }

          // Add vertical line on right of last column elems
          if (j == gridSize - 1) {
            cell.append('line')
              .attr('class', 'line vline')
              .attr('y1', cellMargin)
              .attr('y2', cellWidth - cellMargin)
              .attr('x1', cellWidth)
              .attr('x2', cellWidth)
              .attr('stroke-width', cellMargin)
              .attr('stroke-linecap', 'round')
              .attr('id', i + '-' + (j + 1))

            cell.append('circle')
              .attr('class', 'dot')
              .attr('cx', cellWidth)
              .attr('cy', 0)
              .attr('r', cellMargin)
            
            // The last dot in the bottom-right corner
            cell.append('circle')
              .attr('class', 'dot')
              .attr('cx', cellWidth)
              .attr('cy', cellWidth)
              .attr('r', cellMargin)
          }
        }
      }

      // Add events
      const $this = this
      this.game.querySelectorAll('.line').forEach((elem) => {
        elem.addEventListener('click', $this.onLineClick)
      })
    },

    onLineClick (e) {
      if (this.gameStatus === 'close') {
        this.$buefy.toast.open({
          message: 'Connection lost. Retrying...',
          position: 'is-bottom',
          type: 'is-error'
        })
        this.p2pt.requestMorePeers()

        return false
      }

      if (this.gameStatus === 'playerwait') {
        this.$buefy.toast.open({
          message: 'Waiting for players to join...',
          position: 'is-bottom',
          type: 'is-warning'
        })

        return false
      }

      if (this.gameFinished) {
        this.$buefy.toast.open({
          message: 'Game finished. There\'s a "Play Again" button at the bottom',
          position: 'is-top',
          type: 'is-warning'
        })

        return false
      }

      var elem = e.target

      if (!this.myTurn || elem.classList.contains('active')) {
        return false
      }

      this.p2pt.send(this.friend, JSON.stringify({
        type: 'move',
        playerID: this.myID,
        line: elem.classList.contains('hline') ? 'h' : 'v',
        move: elem.id
      }))

      this.activateLine(elem, this.myID)
    },

    activateLine (line, playerID) {
      var audioToPlay = 'mark'

      line.classList.add('active')
      line.style.stroke = this.players[playerID].colors[0]

      var completedBoxes = this.boxComplete(line)
      var box

      for (var id in completedBoxes) {
        box = completedBoxes[id]
        
        if (box) {
          box = this.game.querySelector('.cell[id="' + id + '"]')
          
          box.classList.add('active')
          box.style.fill = this.players[playerID].colors[0]

          // Select parent <g> of box
          box = d3.select(box.parentNode)
          box
            .insert('text')
            .attr('x', cellWidth / 2)
            .attr('y', cellWidth / 2)
            .attr('dominant-baseline', 'middle')
            .attr('text-anchor', 'middle')
            .text(this.players[playerID].name[0])

          this.$set(this.players[playerID], 'score', this.players[playerID].score + 1)

          this.reRenderScoreboard = false
          this.reRenderScoreboard = true

          audioToPlay = 'box'

          var cells = this.game.getElementsByClassName('cell')
          if (cells.length === this.game.getElementsByClassName('cell active').length) {
            // All cells completed
            this.gameFinished = true

            var largestScore = 0
            var smallestScore = Infinity
            
            var player
            for (var i in this.players) {
              player = this.players[i]
              if (player.score > largestScore) {
                largestScore = player.score
              }
              
              if (player.score < smallestScore) {
                smallestScore = player.score
              }
            }

            if (largestScore === smallestScore) {
              this.gameStatus = 'draw'
            } else if (largestScore === this.players[this.myID].score) {
              this.gameStatus = 'win'
            } else {
              this.gameStatus = 'lose'
            }

            audioToPlay = 'end'
          }
        }
      }

      if (audioToPlay === 'box') {
        // A box was made because of this line. So, one more turn
        this.playerTurns[playerID] = true
      } else {
        /**
          * Get the playerID of the next player after the current player in array
          * indexOf() second param is startIndex
          */
        if (playerID == this.playerTurns.length - 1) {
          var nextPlayerID = this.playerTurns.indexOf(false, 0) // Get first item in array
        } else {
          var nextPlayerID = this.playerTurns.indexOf(false, playerID)
        }
        
        // Vue watch only gets triggered if changed with $set : https://vuejs.org/v2/guide/reactivity.html#For-Arrays
        this.playerTurns[playerID] = false
        this.$set(this.playerTurns, nextPlayerID, true)
      }

      this.playAudio(audioToPlay)
    },

    boxComplete (activeLine) {
      // Will have the lines to check if active to know which boxes got filled
      var lines = []

      // The boxes being considered to be filled
      // If activeLine is vertical, then consider boxes left & right of the line
      // If activeLine is horizontal, then consider boxes top & down of the line
      var consideringBoxes = []

      var [row, col] = activeLine.id.split('-')
      row = parseInt(row)
      col = parseInt(col)

      // If horizontal line is chosen
      if (activeLine.classList.contains('hline')) {
        if (row > 0) {
          lines.push(
            this.game.querySelector('.vline[id="' + (row - 1) + '-' + col + '"]')
          )
          lines.push(
            this.game.querySelector('.hline[id="' + (row - 1) + '-' + col + '"]')
          )

          if (col + 1 <= gridSize) {
            lines.push(
              this.game.querySelector('.vline[id="' + ((row - 1) + '-' + (col + 1)) + '"]')
            )
          }

          consideringBoxes[((row - 1) + '-' + col)] = false
        }

        if (row + 1 <= gridSize) {
          lines.push(
            this.game.querySelector('.vline[id="' + (row + '-' + col) + '"]')
          )
          lines.push(
            this.game.querySelector('.hline[id="' + ((row + 1) + '-' + col) + '"]')
          ) // Cause row'th one is the activeLine

          if (col + 1 <= gridSize) {
            lines.push(
              this.game.querySelector('.vline[id="' + (row + '-' + (col + 1)) + '"]')
            )
          }

          consideringBoxes[(row + '-' + col)] = false
        }
      }

      // If vertical line is chosen
      if (activeLine.classList.contains('vline')) {
        if (col > 0) {
          lines.push(
            this.game.querySelector('.vline[id="' + row + '-' + (col - 1) + '"]')
          )
          lines.push(
            this.game.querySelector('.hline[id="' + row + '-' + (col - 1) + '"]')
          )

          if (row + 1 <= gridSize) {
            lines.push(
              this.game.querySelector('.hline[id="' + ((row + 1) + '-' + (col - 1)) + '"]')
            )
          }

          consideringBoxes[(row + '-' + (col - 1))] = false
        }

        if (col + 1 <= gridSize) {
          lines.push(
            this.game.querySelector('.vline[id="' + (row + '-' + (col + 1)) + '"]')
          ) // Cause col'th one is the activeLine
          lines.push(
            this.game.querySelector('.hline[id="' + (row + '-' + col) + '"]')
          )

          if (row + 1 <= gridSize) {
            lines.push(
              this.game.querySelector('.hline[id="' + ((row + 1) + '-' + col) + '"]')
            )
          }

          consideringBoxes[(row + '-' + col)] = false
        }
      }

      // Is first box complete ?
      consideringBoxes[Object.keys(consideringBoxes)[0]] = lines[0].classList.contains('active') && lines[1].classList.contains('active') && lines[2].classList.contains('active')

      // Is second box complete ?
      if (lines[3]) {
        consideringBoxes[Object.keys(consideringBoxes)[1]] = lines[3].classList.contains('active') && lines[4].classList.contains('active') && lines[5].classList.contains('active')
      }

      return consideringBoxes
    },

    copyGameCode() {
      this.$buefy.toast.open({
        duration: 2000,
        message: `Game Code Copied !`,
        position: 'is-bottom',
        type: 'is-success'
      })
    },

    playAudio (audioID) {
      this.$refs['audio-' + audioID][0].play()
    },

    playAgain () {
      var players = this.players
      
      // Reset data
      Object.assign(this.$data, this.$options.data.apply(this))

      this.p2pt.send(this.friend, JSON.stringify({
        'type': 'playagain'
      }))

      this.p2pt.destroy()
      this.svg.selectAll('*').remove()

      this.init()
    }
  },

  mounted () {
    this.init()
  }
}
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style>
#header {
  padding: 1em;
  color: #fff;
}

#game-content {
  text-align: center;
}

#game-wrapper {
  height: 60vh;
  margin: 20px auto 0;
}

#game {
  width: 97%;
  height: 100%;
}

svg {
  -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
          user-select: none;
}
svg text::selection {
    background: none;
}

#game .cell {
  fill: #EEE;
  opacity: 0.6;
}

#game .dot {
  stroke: #BBB;
  fill: #fff;
}

#game .line {
  stroke: #BBB;
}

#game .cell, #game .line {
  transition: 0.5s all;
}

.scoreboard {
  margin: 0 auto;
}
</style>
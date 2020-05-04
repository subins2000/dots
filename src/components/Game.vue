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
    <div id='header'>
      <div class='container'>
        <nav class='level'>
          <div class='level-left'>
            <span class='level-item'>
              <span class='has-text-weight-bold	'></b>{{ gameCode }}</span>
              <span class='level-item'>
                <b-button size="is-small" type="is-text" outlined @click="copyGameCode" v-clipboard="gameCode">Copy Game Code</b-button>
              </span>
              <span class='level-item has-text-centered'>{{ status }}</span>
            </span>
          </div>
          <div class='level-right' style='text-align: right;'>
            <span class='level-item'>Playing with {{ friendName }}</span>
          </div>
        </nav>
      </div>
    </div>
    <div class='container' id='game-content'>
      <div class='content' id='game-wrapper'>
        <svg id='game' ref='game' viewBox='0 0 280 280'></svg>
      </div>
      <div>
        <div id='game-end' class='content' v-if='gameFinished'>
          <h1 class='is-size-1'>Game Over</h1>
          <div v-if='gameStatus === "draw"'>
            <h3 class='is-size-3'>Draw !</h3>
            <p>Y'all played it to a draw !</p>
          </div>
          <div v-else-if='gameStatus === "win"'>
            <h3 class='is-size-3'>You win !</h3>
            <p>You won the game !</p>
          </div>
          <div v-else>
            <h3 class='is-size-3'>You lost !</h3>
            <p>Tough luck, you lost this game !</p>
          </div>
        </div>
        <table class='table scoreboard content'>
          <tbody>
            <tr v-bind:class='{ active: myTurn }'>
              <td>{{ myName }}</td>
              <td>{{ myScore }}</td>
            </tr>
            <tr v-bind:class='[!myTurn ? "active" : ""]'>
              <td>{{ friendName }}</td>
              <td>{{ opponentScore }}</td>
            </tr>
          </tbody>
        </table>
        <div class='content' v-if='!gameFinished'>
          <span v-if='myTurn'>Your turn</span>
          <span v-else>Waiting for opponent's move</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3'
import { P2PT } from 'p2pt'

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
  data () {
    return {
      status: 'Waiting for players...',
      myName: localStorage.getItem('name'),
      friendName: '',
      myTurn: false,
      myScore: 0,
      opponentScore: 0,
      gameCode: 'ckO2',
      gameFinished: false,
      gameStatus: 'playerwait'
    }
  },
  methods: {
    connect () {
      this.p2pt = new P2PT(announceURLs, 'vett' + this.gameCode)

      const $this = this

      this.p2pt.on('peerconnect', (peer) => {
        $this.friend = peer

        this.p2pt.send(peer, JSON.stringify({
          type: 'name',
          name: this.myName
        }))

        $this.gameStatus = 'joined'
        $this.status = 'Connected to peer'
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

          $this.activateLine($this.game.querySelector('.' + line + '[id="' + row + '-' + col + '"]'), true)

          $this.myTurn = true
        } else if (msg.type === 'name') {
          $this.friendName = msg.name
        }
      })

      this.p2pt.start()
    },

    makeGameBoard () {
      this.svg.attr('width', '100%')
      this.svg.attr('height', '100%')

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
            .attr('width', cellWidth - cellMargin)
            .attr('height', cellWidth - cellMargin)
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
          type: 'is-error'
        })
        this.p2pt.requestMorePeers()

        return false
      }

      if (this.gameStatus === 'playerwait') {
        this.$buefy.toast.open({
          message: 'Waiting for players to join...',
          type: 'is-warning'
        })

        return false
      }

      var elem = e.target

      if (!this.myTurn || elem.classList.contains('active')) {
        return false
      }

      // It's a line
      this.activateLine(elem)

      this.p2pt.send(this.friend, JSON.stringify({
        type: 'move',
        line: elem.classList.contains('hline') ? 'h' : 'v',
        move: elem.id
      }))

      this.myTurn = false
    },

    activateLine (line, friend = false) {
      line.classList.add('active')
      line.classList.add(friend ? 'friend' : 'me')

      var completedBoxes = this.boxComplete(line)
      var box
      for (var id in completedBoxes) {
        box = completedBoxes[id]
        if (box) {
          box = this.game.querySelector('.cell[id="' + id + '"]')
          box.classList.add('active')
          box.classList.add(friend ? 'friend' : 'me')

          if (friend) {
            this.opponentScore++
          } else {
            this.myScore++
          }

          var cells = this.game.getElementsByTagName('cell')
          if (cells.length === cells.getElementsByTagName('active').length) {
            // All cells completed
            this.gameFinished = true

            if (this.myScore === this.opponentScore) {
              this.gameStatus = 'draw'
            } else if (this.myScore > this.opponentScore) {
              this.gameStatus = 'win'
            } else {
              this.gameStatus = 'lose'
            }
          }
        }
      }
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
        message: `Game Code Copied !!!`,
        position: 'is-top',
        type: 'is-primary'
      })
    }
  },
  mounted () {
    this.game = this.$refs.game
    this.svg = d3.select(this.$refs.game)
    this.makeGameBoard()

    this.gameCode = localStorage.getItem('gameCode')

    if (this.gameCode === '0') {
      this.gameCode = Math.random().toString(36).substr(2, 6)
      localStorage.setItem('initiator', true)
      localStorage.setItem('gameCode', this.gameCode)
    }

    if (localStorage.getItem('initiator')) {
      this.myTurn = true
    }

    this.connect()
  }
}
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style>
#header {
  padding: 1em;
  background-color: #00d1b2;
  color: #fff;
}

#game-content {
  text-align: center;
}

#game-wrapper {
  height: 60vh;
  width: 60vh;
  margin: 20px auto 0;
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
  fill: #EEE
}

#game .cell.active {
  fill: #ffa7d3
}

#game .cell.active.friend {
  fill: #d978ff
}

#game .line {
  stroke: #BBB
}

#game .line.active {
  stroke: #CF649A
}

#game .line.active.friend {
  stroke: #a519dd
}

.scoreboard {
  margin: 0 auto;
}

.scoreboard tr.active {
  background: #00d1b2;
  color: #fff;
}
</style>

<template>
  <div>
    <div id='header'>
      <div class='container'>
        <div class='columns is-mobile'>
          <div class='column is-half'>
            {{ gameName }} : {{ status }}
          </div>
          <div class='column' style='text-align: right;'>
            <span>Playing with {{ friendName }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class='container'>
      <div id='game-wrapper'>
        <svg id='game' ref='game' viewBox='0 0 280 280'></svg>
      </div>
      <div>
        <div class='scoreboard'>
          <div class='columns is-mobile'>
            <div class='column' v-bind:class="{ active: myTurn }">{{ myName }}</div>
            <div class='column' v-bind:class="[!myTurn ? 'active' : '']">{{ friendName }}</div>
          </div>
          <div class='columns is-mobile'>
            <div class='column'>{{ myScore }}</div>
            <div class='column'>{{ opponentScore }}</div>
          </div>
        </div><br/>
        <center>
          <span v-if='myTurn'>Your turn</span>
          <span v-else>Waiting for opponent's move</span>
        </center>
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
      myName: localStorage.getItem('name'),
      friendName: '',
      gameName: 'ckO2',
      status: 'Connecting...',
      myScore: 0,
      myTurn: false,
      opponentScore: 0
    }
  },
  methods: {
    connect () {
      this.p2pt = new P2PT(announceURLs, 'vett' + this.gameName)

      const $this = this

      this.p2pt.on('peerconnect', (peer) => {
        $this.friend = peer

        this.p2pt.send(peer, JSON.stringify({
          type: 'name',
          name: this.myName
        }))

        $this.status = 'Connected to peer'
      })

      this.p2pt.on('peerclose', (peer) => {
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
        elem.addEventListener('click', $this.onClick)
      })
    },
    onClick (e) {
      var elem = e.target

      if (elem.classList.contains('line')) {
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
      }
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
    }
  },
  mounted () {
    this.game = this.$refs.game
    this.svg = d3.select(this.$refs.game)
    this.makeGameBoard()

    this.gameName = localStorage.getItem('gameName')
    if (this.gameName === '0') {
      this.gameName = Math.random().toString(36).substring(7)
      localStorage.setItem('initiator', true)
      localStorage.setItem('gameName', this.gameName)
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

#game-wrapper {
  height: 60vh;
  width: 60vh;
  margin: 20px auto;
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
  display: table;
  margin: 0 auto;
}

.scoreboard .column {
  border-radius: 20px;
  padding: 0.5em;
  background: #EEE;
  border: 1px dashed #000;
  text-align: center;
  min-width: 100px;
}

.scoreboard .column.active {
  background: #00d1b2;
  color: #fff;
}
</style>

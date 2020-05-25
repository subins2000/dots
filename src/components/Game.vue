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
              <span class='has-text-weight-bold' title='Game Code'>{{ gameCode }}</span>
            </span>
          </div>
          <span class='level-item has-text-centered'>{{ status }}</span>
          <div class='level-right' style='text-align: right;'>
            <span class='level-item' v-if='gameStatus !== "playerwait"'>
              {{ Object.keys(players).length }}
              <span v-if='gameStatus === "restore"'>
                /{{ expectingPlayerCount }}
              </span>
              &nbsp;Players
            </span>
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
        <div class='content' v-if='gameStatus === "playerwait"'>
          <CopyLink />
          <span>Only start the game after everyone join.</span><br/>
          <span>Tap to draw line</span>
        </div>
        <div class='content' v-if='!gameFinished'>
          <span v-if='myTurn'>Your turn</span>
          <span v-else>Waiting for opponent's move</span>
        </div>
        <table class='table scoreboard content'>
          <tbody>
            <tr v-for='(p, pid) in players' v-bind:style='"border: 3px dashed " + p.colors[0]' v-bind:key='pid' v-if='reRenderScoreboard'>
              <td>{{ p.name }}</td>
              <td>{{ p.score }}</td>
            </tr>
          </tbody>
        </table>
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
    </div>
    <beautiful-chat
      :colors="chatColors"
      :participants="chatParticipants"
      :onMessageWasSent="chatSendMessage"
      :messageList="chatMsgs"
      :newMessagesCount="chatNewMessagesCount"
      :isOpen="chatIsOpen"
      :close="chatClose"
      :open="chatOpen"
      :showEmoji="true"
      :showFile="false"
      :alwaysScrollToBottom="true"
      :messageStyling="false"
    >
      <template v-slot:text-message-body="scopedProps">
        <p class='sc-message--system' v-if='scopedProps.message.author !== "!game!" && scopedProps.message.author !== "me"'>
          <strong>{{ scopedProps.message.author }}</strong>
          <div style='margin: 3px;'></div>
        </p>
        <p class="sc-message--text-content" v-html="scopedProps.messageText"></p>
        <p v-if="scopedProps.message.data.meta" class='sc-message--meta' :style="{color: scopedProps.messageColors.color}">{{scopedProps.message.data.meta}}</p>
      </template>
    </beautiful-chat>
  </div>
</template>

<script>
import * as d3 from 'd3'
const P2PT = require('p2pt')

var randomColor = () => {
  return `hsla(${~~(360 * Math.random())},70%,50%,0.8)`
}

var gridSize = 6
var cellWidth = 40
var cellMargin = 5

/**
 * Storage for restoring gamestate if needed
 * Only used for players who need to restore game from other peers
 */
var restoreGameData = false

export default {
  name: 'Game',

  p2pt: null,

  myID: '',

  data () {
    return {
      status: 'Waiting for players...',
      myName: this.$store.state.name,

      myTurn: false,
      gameCode: 'ckO2',
      gameFinished: false,
      gameStatus: 'playerwait',
      audio: ['box', 'mark', 'end'],

      players: {},

      /**
       * If game is in restoring mode, and not all players
       * info has been fetched, then this will have the required count
       */
      expectingPlayerCount: 0,

      /**
       * Will have playerID => false
       * The player whose turn is now will only have true
       */
      playerTurns: [],

      // For some weird reason, score update isn't immediate after property change. Tried :key and .$set and yet it didn't work. So had to go with this terrible hack
      reRenderScoreboard: true,

      /**
       * History of all line markings
       * Index: a sequential ID
       * Value: [playerID, lineType, lineID]
       */
      gameHistory: {},
      gameHistoryIndex: -1,

      /**
       * History of all line markings that made a box completion
       * Value: lineType+lineID
       * Eg: v4-3, h4-1
       */
      boxLineHistory: [],

      /**
       * ----
       * CHAT
       * ----
       */
      chatIsOpen: false,

      chatParticipants: [
        {
          id: '!game!',
          name: 'Game',
          imageUrl: 'static/favicon.png'
        }
      ],

      chatNewMessagesCount: 0,

      chatMsgs: [],

      chatColors: {
        header: {
          bg: '#4e8cff',
          text: '#ffffff'
        },
        launcher: {
          bg: '#4e8cff'
        },
        messageList: {
          bg: '#ffffff'
        },
        sentMessage: {
          bg: '#4e8cff',
          text: '#ffffff'
        },
        receivedMessage: {
          bg: '#eaeaea',
          text: '#222222'
        },
        userInput: {
          bg: '#f4f7f9',
          text: '#565867'
        }
      }
    }
  },

  watch: {
    playerTurns: {
      deep: true,
      
      handler () {
        this.myTurn = this.playerTurns.indexOf(true) == this.myID

        if (this.myTurn && this.gameHistoryIndex > 0 && this.gameHistory[this.gameHistoryIndex][0] != this.myID && this.chatIsOpen) {
          this.$buefy.toast.open({
            message: 'It\'s your turn now !',
            type: 'is-success'
          })
        }
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
        sessionStorage.setItem('myColor', randomColor())
      }

      this.myID = sessionStorage.getItem('myID')

      this.players[this.myID] = {
        name: this.myName,
        colors: [sessionStorage.getItem('myColor')],
        score: 0
      }
      this.$set(this.playerTurns, this.myID, false)

      this.connect()
    },

    connect () {
      this.p2pt = new P2PT(this.$GAME_ANNOUNCE_URLS, 'vett' + this.gameCode)
      this.p2pt.start()

      const $this = this

      this.p2pt.on('peerconnect', (peer) => {
        if (this.gameFinished) {
          return
        }

        $this.p2pt.send(peer, JSON.stringify({
          type: 'join',
          playerID: $this.myID,
          name: $this.myName,
          colors: $this.players[$this.myID].colors,
          historyIndex: $this.gameHistoryIndex,
          playerCount: Object.keys(this.players).length
        }))

        $this.gameStatus = 'joined'
        $this.status = ''
      })

      this.p2pt.on('peerclose', (peer) => {
        var player
        for (var id in $this.players) {
          player = $this.players[id]
          if (player.conn && player.conn.id === peer.id) {
            var name = $this.players[id].name

            delete $this.playerTurns[id]
            delete $this.players[id]

            $this.chatAddMsg('!game!', `Connection lost with ${name}`)

            $this.fixPlayerTurns()

            break
          }
        }
      })

      this.p2pt.on('msg', (peer, msg) => {
        msg = JSON.parse(msg)

        if (msg.type === 'move') {
          var line = msg.line === 'h' ? 'hline' : 'vline'
          var [row, col] = msg.move.split('-')

          if (row.length !== 1 && col.length !== 1) {
            return
          }

          $this.activateLine($this.game.querySelector('.' + line + '[id="' + row + '-' + col + '"]'), msg.playerID)
        } else if (msg.type === 'join') {
          $this.$set($this.players, msg.playerID, {
            conn: peer,
            name: msg.name,
            colors: msg.colors,
            score: 0
          })

          $this.playerTurns[msg.playerID] = false

          $this.chatParticipants.push({
            id: msg.name,
            name: msg.name,
            imageUrl: 'static/avatar.png'
          })

          if (msg.historyIndex > $this.gameHistoryIndex) {
            // My game history is not latest
            // I probably joined the game in between
            $this.expectingPlayerCount = Math.max($this.expectingPlayerCount, msg.playerCount)

            $this.p2pt.send(peer, JSON.stringify({
              type: 'gameState'
            }))

            $this.gameStatus = 'restore'
            $this.status = 'Restoring game'
          }

          $this.fixPlayerTurns()

          $this.timeToRestoreGame()
        } else if (msg.type === 'playagain') {
          $this.$buefy.toast.open({
            message: 'One of your opponents want to play again. Click the Play Again button at the bottom if you want to.',
            position: 'is-top',
            type: 'is-warning',
            duration: 6000
          })
        } else if (msg.type === 'gameState') {
          var gameState = {
            type: 'gameRestore',
            gameHistory: this.gameHistory
          }

          $this.p2pt.send(peer, JSON.stringify(gameState))
        } else if (msg.type === 'gameRestore') {
          restoreGameData = msg

          this.gameStatus = 'restore'
          this.status = 'Restoring game'

          $this.timeToRestoreGame()
        } else if (msg.type === 'chat') {
          if (msg.emoji) {
            this.chatAddMsg(msg.name, msg.emoji, 'emoji')
          } else {
            this.chatAddMsg(msg.name, msg.text)
          }
        }
      })
    
      var warningCount = 0
      this.p2pt.on('trackerwarning', (error, stats) => {
        warningCount++
        
        if (warningCount >= stats.total && stats.connected === 0) {
          $this.status = 'Cannot connect to WebTorrent trackers'

          $this.$buefy.toast.open({
            message: 'We couldn\'t connect to any WebTorrent trackers. A page refresh might help.\nYour ISP might be blocking them 🤔',
            position: 'is-top',
            type: 'is-danger',
            duration: 6000
          })
        }
      })

      this.p2pt.on('trackerconnect', () => {
        warningCount--
      })
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
      if (this.gameStatus === 'close' && this.playerTurns.length === 1) {
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
        this.p2pt.requestMorePeers()

        return false
      }

      if (this.gameStatus === 'restore') {
        this.$buefy.toast.open({
          message: 'Game is being restored...',
          position: 'is-bottom',
          type: 'is-warning'
        })
        this.p2pt.requestMorePeers()
        this.timeToRestoreGame()

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

      this.sendToAll({
        type: 'move',
        playerID: this.myID,
        line: elem.classList.contains('hline') ? 'h' : 'v',
        move: elem.id
      })

      this.activateLine(elem, this.myID)
    },

    activateLine (line, playerID, playAudio = true, historyIndex = false) {
      if (historyIndex && this.gameHistory[historyIndex]) {
        return
      }

      var audioToPlay = 'mark'

      line.classList.add('active')
      line.style.stroke = this.players[playerID].colors[0]

      var lineType = line.classList.contains('hline') ? 'h' : 'v'

      if (historyIndex) {
        this.gameHistory[historyIndex] = [playerID, lineType, line.id]
        this.gameHistoryIndex = historyIndex
      } else {
        this.gameHistory[++this.gameHistoryIndex] = [playerID, lineType, line.id]
      }

      var completedBoxes = this.boxComplete(line)
      var box

      for (var id in completedBoxes) {
        box = completedBoxes[id]
        
        if (box) {
          box = this.game.querySelector('.cell[id="' + id + '"]')
          
          box.classList.add('active')
          box.playerID = playerID
          box.style.fill = this.players[playerID].colors[0]

          this.boxLineHistory.push(lineType + line.id)

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
            this.updateScores()

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

      this.fixPlayerTurns()

      if (playAudio)
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
      if (this.$store.state.audio)
        this.$refs['audio-' + audioID][0].play()
    },

    playAgain () {
      var players = this.players

      this.sendToAll({
        'type': 'playagain'
      })

      this.$buefy.toast.open({
        message: 'Asking others to play again...',
        position: 'is-top',
        type: 'is-warning'
      })

      const $this = this

      setTimeout(() => {
        // Reset data
        Object.assign(this.$data, $this.$options.data.apply(this))

        $this.p2pt.destroy()
        $this.svg.selectAll('*').remove()

        $this.init()
      }, 2000)
    },

    sendToAll (json) {
      var player;
      for (var id in this.players) {
        player = this.players[id]

        // Me (the player) won't have the conn
        if (player.conn) {
          this.p2pt.send(player.conn, JSON.stringify(json))
        }
      }
    },

    restoreGameState (history) {
      var h
      for (var historyIndex in history) {
        h = history[historyIndex] // [playerID, lineType, lineID]

        if ((h[1] !== 'h' && h[1] !== 'v') || h[2].length !== 3) {
          continue
        }

        this.activateLine(this.game.querySelector('.' + h[1] + 'line[id="' + h[2] + '"]'), h[0], false, historyIndex)
      }
    },

    /**
     * Will restore game if all players info is obtained
     */
    timeToRestoreGame () {
      if (!restoreGameData) {
        return false
      }
      
      // Only restore if all online, active players info is obtained. Otherwise this.players object will be incomplete and activateLine() will fail
      if (this.expectingPlayerCount > Object.keys(this.players).length) {
        this.p2pt.requestMorePeers()
        return false
      }

      if (restoreGameData.colors) {
        this.players[this.myID].colors = restoreGameData.colors
      }

      this.restoreGameState(restoreGameData.gameHistory)
      restoreGameData = false

      this.gameStatus = 'play'
      this.status = ''
      this.expectingPlayerCount = 0
    },

    updateScores () {
      var markedBoxes = Array.from(this.game.getElementsByClassName('cell active'))

      var playerScores = []

      for (var playerID in this.playerTurns) {
        playerScores[playerID] = 0
      }

      markedBoxes.forEach(e => {
        playerScores[e.playerID]++
      })

      for (var playerID in playerScores) {
        this.players[playerID].score = playerScores[playerID]
      }
    },

    /**
     * Calculate whose turn is it next
     * and change playerTurns array accordingly
     */
     fixPlayerTurns () {
      for (var playerID in this.playerTurns) {
        this.playerTurns[playerID] = false
      }

      var nextPlayerID;

      if (this.gameHistoryIndex === -1) {
        // First player in list has the turn
        nextPlayerID = this.playerTurns.indexOf(false)
      } else {
        var lastPlay = this.gameHistory[this.gameHistoryIndex]
        var lastPlayerID = parseInt(lastPlay[0])
        var lastPlayedLine = lastPlay[1] + lastPlay[2]

        if (this.boxLineHistory.indexOf(lastPlayedLine) !== -1) {
          // The last played line made a box. So repeat turn
          nextPlayerID = lastPlayerID
        } else {
          /**
           * Get the playerID of the next player after the current player in array
           * indexOf() second param is startIndex
           */
          if (lastPlayerID === this.playerTurns.length - 1) {
            // Get first item in array
            nextPlayerID = this.playerTurns.indexOf(false, 0)
          } else {
            // +1 cause don't want to include this playerID
            nextPlayerID = this.playerTurns.indexOf(false, lastPlayerID + 1)
          }
        }
      }

      // Vue watch only gets triggered if changed with $set
      // https://vuejs.org/v2/guide/reactivity.html#For-Arrays
      this.$set(this.playerTurns, nextPlayerID, true)
    },

    /**
     * ----
     * CHAT
     * ----
     */
    chatSendMessage (msgData) {
      var name = this.players[this.myID].name

      if (msgData.type === 'emoji') {
        this.sendToAll({
          type: 'chat',
          name: name,
          emoji: msgData.data.emoji
        })

        this.chatAddMsg('me', msgData.data.emoji, 'emoji')
      } else {
        this.sendToAll({
          type: 'chat',
          name: name,
          text: msgData.data.text
        })

        this.chatAddMsg('me', msgData.data.text)
      }
    },

    chatOpen () {
      // called when the user clicks on the fab button to open the chat
      this.chatIsOpen = true
      this.chatNewMessagesCount = 0
    },

    chatClose () {
      // called when the user clicks on the botton to close the chat
      this.chatIsOpen = false
    },

    chatAddMsg (name, msg, type = 'text') {
      this.chatMsgs.push({
        type: type === 'text' ? 'text' : 'emoji',
        author: name,
        data: {
          [type === 'text' ? 'text' : 'emoji']: msg,
          meta: new Date().toLocaleTimeString()
        }
      })

      if (name !== '!game!') {
        this.chatNewMessagesCount = this.chatIsOpen
          ? this.chatNewMessagesCount
          : this.chatNewMessagesCount + 1
      }
    },

    onBeforeUnload (e = null) {
      if (this.chatIsOpen) {
        this.chatIsOpen = false

        if (e) {
          e.preventDefault()
          e.returnValue = ''
        }

        return true
      }
      return false
    }
  },

  mounted () {
    this.init()
    window.addEventListener('beforeunload', this.onBeforeUnload)
  },

  beforeDestroy() {
    if (this.p2pt) {
      this.p2pt.destroy()
      this.svg.selectAll('*').remove()
    }
    window.removeEventListener('beforeunload', this.onBeforeUnload)
  },

  beforeRouteLeave (to, from, next) {
    if (this.onBeforeUnload()) {
      next(false)
    } else {
      next(true)
    }
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
  margin: 20px auto 10px;
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
  margin: 0 auto 10px;
}
</style>
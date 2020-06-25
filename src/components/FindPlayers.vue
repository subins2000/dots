<template>
  <div>
    <GameTitle />
    <div class='container has-text-centered'>
      <p class='content'>I'm gonna try finding players who are also looking for someone to play with :)</p>
      <p>{{ status }}</p>
      <p>Found {{ count }} online players</p>
      <div class='is-hidden'>
        <audio ref='foundPlayerAudio' async='async'>
          <source src='static/box.ogg' type='audio/ogg'>
        </audio>
      </div>
    </div>
  </div>
</template>

<script>
const P2PT = require('p2pt')

export default {
  name: 'FindPlayers',

  p2pt: null,

  data () {
    return {
      offer: false,
      status: 'Connecting to tracker...',
      count: 0
    }
  },

  methods: {
    init () {
      this.p2pt = new P2PT(this.$GAME_ANNOUNCE_URLS, 'vett')

      var myDiceNumber = parseInt(Math.random().toString().substr(2, 5))

      this.p2pt.on('peerconnect', (peer) => {
        this.count++
        this.p2pt
          .send(peer, 'play-' + myDiceNumber)
          .then(([peer, peerDiceNumber]) => {
            if (this.offer !== false) return

            peerDiceNumber = parseInt(peerDiceNumber)

            this.offer = peer.id

            if (myDiceNumber > peerDiceNumber) {
              // I will decide the game code
              this.startGame(peer)

              this.status = 'Found a player ! Handshaking...'
            }
          }).catch((error) => {
            this.status = 'Failed connecting to a player. Trying again...'

            this.offer = false
            this.p2pt.requestMorePeers()
          })
      })

      this.p2pt.on('msg', (peer, msg) => {
        var action = msg.substr(0, 4)

        if (msg.substr(4, 1) !== '-') return

        if (action === 'play' && !this.offer) {
          this.offer = peer.id

          let [blah, peerDiceNumber] = msg.split('-')
          peerDiceNumber = parseInt(peerDiceNumber)
          
          if (myDiceNumber > peerDiceNumber) {
            this.$refs.foundPlayerAudio.play()

            // I will decide the game code
            this.startGame(peer)
            
            this.status = 'Found a player ! Handshaking with sanitized hands...'
          }
        } else if (action === 'strt') {
          if (peer.id !== this.offer) return

          this.$refs.foundPlayerAudio.play()
          this.status = 'Found a player ! Handshaking with sanitized hands...'

          let [blah, gameCode] = msg.split('-')

          if (gameCode.length === this.$GAME_CODE_LENGTH) {
            localStorage.setItem('gameCode', gameCode)
            this.$router.push('register')
          }
        }
      })

      let connected = false
      let warningCount = 0
      this.p2pt.on('trackerwarning', (error, stats) => {
        warningCount++
        if (warningCount >= stats.total && !connected) {
          this.status = 'Have no connections to torrent trackers. Perhaps reload page or make sure WebTorrent trackers are not blocked by your ISP'
        }
      })

      this.p2pt.on('trackerconnect', () => {
        connected = true
        warningCount--
        this.status = 'Searching for online players...'
      })

      this.p2pt.start()
    },

    startGame (peer) {
      let gameCode = '6x6.' + Math.random().toString(36).substr(2, this.$GAME_CODE_LENGTH)

      localStorage.setItem('gameCode', gameCode)

      var failed = false
      setTimeout(() => {
        if (failed) return
        this.$router.push('register')
      }, 1000)

      this.p2pt.send(
        peer, 'strt-' + gameCode
      ).catch((error) => {
        failed = true
        
        this.status = 'Failed connecting to a player. Trying again...\nA page refresh might help'

        this.offer = false
        this.p2pt.requestMorePeers()
      })
    }
  },

  mounted () {
    this.init()
  },

  beforeDestroy() {
    if (this.p2pt) {
      this.p2pt.destroy()
    }
  }
}
</script>
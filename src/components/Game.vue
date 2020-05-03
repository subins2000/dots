<template>
  <div class='container'>
    <div id='game-wrapper'>
      <svg id='game' ref='game' preserveAspectRatio='xMidYMid meet' viewBox='0 0 300 300'></svg>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3'

var gridSize = 6
var cellWidth = 40
var cellMargin = 5

export default {
  name: 'Game',
  data () {
    return {

    }
  },
  methods: {
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
          
          // Add lines
          cell.append('line')
            .attr('class', 'vline')
            .attr('y1', cellMargin)
            .attr('y2', cellWidth - cellMargin)
            .attr('x1', 0)
            .attr('x2', 0)
            .attr('stroke-width', cellMargin)
            .attr('stroke-linecap', 'round')
          
          cell.append('line')
            .attr('class', 'hline')
            .attr('x1', cellMargin)
            .attr('x2', cellWidth - cellMargin)
            .attr('y1', 0)
            .attr('y2', 0)
            .attr('stroke-width', cellMargin)
            .attr('stroke-linecap', 'round')
        }
      }
    }
  },
  mounted () {
    this.svg = d3.select(this.$refs.game)
    this.makeGameBoard()
  }
}
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style>
#game .cell {
  fill: #EEE
}

#game .hline, #game .vline {
  stroke: #BBB
}

#game-wrapper {
  height: 46vh;
  width: 46vh;
  margin: 20px auto;
}
</style>

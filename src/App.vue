<template>
  <div class="app">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script>
import GameMain from './js/main'

export default {
  name: 'App',

  data () {
    return {}
  },

  mounted () {
    window.app = this
    this.gameMain = new GameMain(this.$refs.canvas)
    document.body.addEventListener('touchmove', function (e) {
      e.preventDefault()
      return false
    }, {
      passive: false
    })
  }
}
</script>

<style>
* {
  padding: 0;
  margin: 0;
}

html,
body,
.app {
  height: 100%;
}
canvas {
  display: block;
  width: 100%;
  height: 100%;
  background-color: black;
}
</style>

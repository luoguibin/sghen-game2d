<template>
  <div class="app0">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script>
const DPR = window.devicePixelRatio || 1

export default {
  name: 'App0',

  data () {
    return {
    }
  },

  mounted () {
    window.app0 = this

    this.init()
    document.oncontextmenu = function () {
      return false
    }
    document.body.addEventListener(
      'touchmove',
      function (e) {
        e.preventDefault()
        e.stopPropagation()

        return false
      },
      {
        passive: false
      }
    )

    const image = new Image()
    image.onload = e => {
      this.image = e.target
      this.image.onload = null
      this.render()
    }
    image.src = require('@/images/bullet.png')
  },

  methods: {
    init () {
      /** @type {HTMLCanvasElement} */
      const canvas = this.$refs.canvas
      canvas.width = canvas.clientWidth * DPR
      canvas.height = canvas.clientHeight * DPR

      this.ctx = canvas.getContext('2d')
      this.render()
    },

    render () {
      /** @type {CanvasRenderingContext2D} */
      const ctx = this.ctx
      ctx.save()
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      ctx.translate(0.5, 0.5)
      // ctx.scale(DPR, DPR)

      ctx.font = '20px sans-serif'
      ctx.fillStyle = '#333333'
      ctx.fillText('20px sans-serif', 10, 20 * 1.5)

      ctx.strokeStyle = ctx.fillStyle
      ctx.beginPath()
      ctx.moveTo(10, 60)
      ctx.lineTo(300, 60)
      ctx.lineTo(300, 60 * 2)
      ctx.stroke()

      if (this.image) {
        ctx.drawImage(this.image, 10, 200)
      }

      ctx.restore()
    }
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
.app0 {
  height: 100%;
}
canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>

import {
  PIXEL_RATIO,
  WINDOW_WIDTH,
  WINDOW_HEIGHT,
  CANVAS_WIDTH,
  CANVAS_HEIGHT
} from '../js/const'

import Tank from './tank'

export default class TankWorld {
  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor (canvas) {
    this.canvas = canvas
    // 抗锯齿
    canvas.setAttribute('width', CANVAS_WIDTH)
    canvas.setAttribute('height', CANVAS_HEIGHT)
    canvas.width = CANVAS_WIDTH
    canvas.height = CANVAS_HEIGHT
    canvas.style.width = WINDOW_WIDTH + 'px'
    canvas.style.height = WINDOW_HEIGHT + 'px'
    const ctx = canvas.getContext('2d', {
      antialias: true
    })
    ctx.scale(PIXEL_RATIO, PIXEL_RATIO)
    ctx.translate(0.5, 0.5)
    this.ctx = ctx

    this.tank = new Tank(0)

    window.tankWorld = this

    this.loop = this.loop.bind(this)
    this.loop()
  }

  setTankValves (valves) {
    this.tank.setValves(valves)
  }

  setTankRadians (radians) {
    this.tank.setRadians(radians)
  }

  loop () {
    this.calculate()
    this.render()
    this.handler = requestAnimationFrame(this.loop)
  }

  calculate () {
    this.tank.update()
  }

  render () {
    const ctx = this.ctx
    ctx.clearRect(-0.5, -0.5, CANVAS_WIDTH, CANVAS_HEIGHT)

    this.tank.draw(ctx)
  }
}

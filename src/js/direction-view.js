import {
  WINDOW_WIDTH,
  WINDOW_HEIGHT
} from './const'

export const DIRECTIONS = {
  TOP: 3,
  RIGHT: 2,
  BOTTOM: 0,
  LEFT: 1
}

export default class DirectionView {
  constructor () {
    this.D_WIDTH = 50
    this.D_HEIGHT = 50

    this.cX = this.D_WIDTH * 2
    this.cY = WINDOW_HEIGHT - this.D_HEIGHT * 2
    this.directions = [
      { key: 'L', value: DIRECTIONS.LEFT, x: this.cX - this.D_WIDTH * 1.5, y: this.cY - this.D_HEIGHT * 0.5 },
      { key: 'R', value: DIRECTIONS.RIGHT, x: this.cX + this.D_WIDTH * 0.5, y: this.cY - this.D_HEIGHT * 0.5 },
      { key: 'D', value: DIRECTIONS.BOTTOM, x: this.cX - this.D_WIDTH * 0.5, y: this.cY + this.D_HEIGHT * 0.5 },
      { key: 'U', value: DIRECTIONS.TOP, x: this.cX - this.D_WIDTH * 0.5, y: this.cY - this.D_HEIGHT * 1.5 },

      { key: 'S0', value: -99, x: WINDOW_WIDTH - this.D_WIDTH * 2, y: this.cY - this.D_HEIGHT * 0.5 }
    ]
  }

  testXY (x0, y0) {
    const directions = this.directions
    for (let i = 0; i < directions.length; i++) {
      const { x, y } = directions[i]
      const xVal = x0 - x
      const yVal = y0 - y
      if (xVal >= 0 && xVal <= this.D_WIDTH && yVal >= 0 && yVal <= this.D_HEIGHT) {
        return directions[i]
      }
    }

    return null
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   */
  render (ctx) {
    ctx.save()

    ctx.strokeStyle = '#148acf'
    ctx.fillStyle = ctx.strokeStyle

    this.directions.forEach(o => {
      ctx.strokeRect(o.x, o.y, this.D_WIDTH, this.D_HEIGHT)
      ctx.fillText(o.key, o.x + this.D_WIDTH / 3, o.y + this.D_HEIGHT / 2 + 4)
    })

    ctx.restore()
  }
}

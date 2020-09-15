import { getDistance } from './utils'

const ORIGIN_WIDTH = 30
const OROGIN_HEIGHT = 52
const SKILL_SIZE = {
  WIDTH: 8,
  HEIGHT: 16,
  HALF_WIDTH: 8 / 2,
  HALF_HEIGHT: 16 / 2
}

export const SKILL_DIRECTION = {
  BOTTOM: 2,
  LEFT: -1,
  RIGHT: 1,
  TOP: 0,
  fromPlayerDirection: function (v) {
    if (v === 0) {
      return 2
    } else if (v === 1) {
      return -1
    } else if (v === 2) {
      return 1
    } else {
      return 0
    }
  }
}

export default class Skill0 {
  constructor (params = {}) {
    const { id, x, y, radian, xv, yv, md } = params
    this.id = id
    this.img = new Image()
    this.img.src = require('@/images/bullet.png')

    this.radian = radian
    this.x = x
    this.y = y
    this.ox = x
    this.oy = y
    this.xv = xv
    this.yv = yv
    this.maxDistance = md || 2000
    this.isEnd = false
  }

  update () {
    this.x += this.xv
    this.y += this.yv
    if (getDistance(this.ox, this.oy, this.x, this.y) > this.maxDistance) {
      this.isEnd = true
    }
  }

  /**
   * 绘制人物
   * @param {CanvasRenderingContext2D} ctx
   */
  render (ctx) {
    ctx.save()
    ctx.translate(this.x, this.y)
    ctx.rotate(this.radian)

    ctx.drawImage(
      this.img,
      0,
      0,
      ORIGIN_WIDTH,
      OROGIN_HEIGHT,
      -SKILL_SIZE.HALF_WIDTH,
      -SKILL_SIZE.HALF_HEIGHT,
      SKILL_SIZE.WIDTH,
      SKILL_SIZE.HEIGHT
    )

    ctx.restore()
  }
}

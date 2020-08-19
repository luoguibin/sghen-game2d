import {
  PIXEL_RATIO,
  WINDOW_HEIGHT
} from './const'

const STEP = PIXEL_RATIO * 3

const SKILL_WIDTH = 30
const SKILL_HEIGHT = 52
const SKILL_SIZE = {
  WIDTH: SKILL_WIDTH,
  HEIGHT: SKILL_HEIGHT,
  HALF_WIDTH: SKILL_WIDTH / 2,
  HALF_HEIGHT: SKILL_HEIGHT / 2
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
  constructor (x, y, direction) {
    this.img = new Image()
    this.img.src = require('@/images/bullet.png')

    this.direction = SKILL_DIRECTION.fromPlayerDirection(direction)
    this.x = x
    this.y = y
    this.stepValue = 0
    this.isEnd = false
    this.isBullet = true
  }

  update () {
    this.stepValue += STEP
    switch (this.direction) {
      case SKILL_DIRECTION.TOP:
        this.y -= STEP
        break
      case SKILL_DIRECTION.RIGHT:
        this.x += STEP
        break
      case SKILL_DIRECTION.BOTTOM:
        this.y += STEP
        break
      case SKILL_DIRECTION.LEFT:
        this.x -= STEP
        break
      default:
        break
    }
    if (this.stepValue > WINDOW_HEIGHT * 2) {
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
    ctx.rotate(Math.PI / 2 * this.direction)

    ctx.drawImage(
      this.img,
      0,
      0,
      SKILL_SIZE.WIDTH,
      SKILL_SIZE.HEIGHT,
      -SKILL_SIZE.HALF_WIDTH,
      -SKILL_SIZE.HALF_HEIGHT,
      SKILL_SIZE.WIDTH,
      SKILL_SIZE.HEIGHT
    )

    ctx.restore()
  }
}

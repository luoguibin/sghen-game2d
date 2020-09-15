import {
  SKILL_DIRECTION
} from './bullet'

const MAX_COUNT = 14
const ROW_COUNT = 5
const SKILL_WIDTH = 64
const SKILL_HEIGHT = 48
const SKILL_SIZE = {
  WIDTH: SKILL_WIDTH,
  HEIGHT: SKILL_HEIGHT,
  HALF_WIDTH: SKILL_WIDTH / 2,
  HALF_HEIGHT: SKILL_HEIGHT / 2
}

export default class Skill1 {
  constructor (x, y, direction = -99) {
    this.img = new Image()
    this.img.src = require('@/images/explosions.png')

    this.x = x
    this.y = y
    this.direction = direction
    if (direction === SKILL_DIRECTION.TOP) {
      this.y -= SKILL_HEIGHT * 2
    } else if (direction === SKILL_DIRECTION.RIGHT) {
      this.x += SKILL_WIDTH * 2
    } else if (direction === SKILL_DIRECTION.BOTTOM) {
      this.y += SKILL_HEIGHT * 2
    } else if (direction === SKILL_DIRECTION.LEFT) {
      this.x -= SKILL_WIDTH * 2
    }
    this.index = 0
    this.isEnd = false
  }

  update () {
    this.index += 0.33
    this.isEnd = this.index >= MAX_COUNT
  }

  /**
     * 绘制人物
     * @param {CanvasRenderingContext2D} ctx
     */
  render (ctx) {
    ctx.save()
    ctx.translate(this.x, this.y)
    const i = Math.floor(this.index % ROW_COUNT)
    const j = Math.floor(this.index / ROW_COUNT)
    ctx.scale(2, 2)
    ctx.drawImage(
      this.img,
      SKILL_SIZE.WIDTH * i,
      SKILL_SIZE.HEIGHT * j,
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

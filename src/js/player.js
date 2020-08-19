import {
  PIXEL_RATIO,
  WINDOW_WIDTH,
  WINDOW_HEIGHT
} from './const'
import { DIRECTIONS } from './direction-view'
import Skill0 from './skill0'
import Skill1 from './skill1'

const getDistance = function (x1, y1, x2, y2) {
  const x = x1 - x2
  const y = y1 - y2
  return Math.sqrt(x * x + y * y)
}
const PLAYER_WIDTH = 180 / 4
const PLAYER_HEIGHT = 270 / 4
export const PLAYER_SIZE = {
  WIDTH: PLAYER_WIDTH,
  HEIGHT: PLAYER_HEIGHT,
  HALF_WIDTH: Math.round(PLAYER_WIDTH / 2),
  HALF_HEIGHT: Math.round(PLAYER_HEIGHT / 2)
}

const STEP = PIXEL_RATIO * 1
const MAX_BULLET_COUNT = 100

/**
 * 玩家
 */
export default class Player {
  constructor () {
    this.img = new Image()
    this.img.src = require('@/images/player.png')
    this.direction = DIRECTIONS.TOP

    this.x = WINDOW_WIDTH / 2
    this.y = WINDOW_HEIGHT / 2
    this.stepValue = 0
    this.score = 0

    this.skills = []

    this.bulletTotal = 5
    this.bulletCount = this.bulletTotal
  }

  walk (direction) {
    this.direction = direction
  }

  addBullet (v0, max = 0) {
    this.bulletTotal += max
    this.bulletTotal = Math.min(MAX_BULLET_COUNT, this.bulletTotal)
    this.bulletCount += v0
    this.bulletCount = Math.min(this.bulletTotal, this.bulletCount)
  }

  startNextSkill0 () {
    if (this.bulletCount > 0) {
      const skill0 = new Skill0(this.x, this.y, this.direction)
      this.skills.push(skill0)
      this.addBullet(-1)
    }
  }

  updateSkill (obstacles) {
    const skills = this.skills
    for (let i = skills.length - 1; i >= 0; i--) {
      if (skills[i].isEnd) {
        skills.splice(i, 1)
        this.addBullet(1)
      } else {
        const skill = skills[i]
        skill.update()

        if (!skill.isBullet) {
          continue
        }
        for (let j = obstacles.length - 1; j >= 0; j--) {
          const obstacle = obstacles[j]
          const d = getDistance(obstacle.x, obstacle.y, skill.x, skill.y)
          if (d < obstacle.value + 15) {
            if (obstacle.type === 'add') {
              this.addBullet(obstacle.value)
            } else if (obstacle.type === 'add-all') {
              this.addBullet(obstacle.value, 1)
            }
            obstacles.splice(j, 1)
            skills.splice(i, 1)
            this.addBullet(1)

            const skill1 = new Skill1(obstacle.x, obstacle.y)
            this.skills.push(skill1)

            this.addScore(obstacle.value)
          }
        }
      }
    }
  }

  getScreenXY () {
    return {
      x: this.x - WINDOW_WIDTH / 2,
      y: this.y - WINDOW_HEIGHT / 2
    }
  }

  addScore (v) {
    this.score += v
  }

  update (MAP) {
    this.stepValue += STEP / PLAYER_SIZE.WIDTH * 2
    switch (this.direction) {
      case DIRECTIONS.TOP:
        this.y -= STEP
        break
      case DIRECTIONS.RIGHT:
        this.x += STEP
        break
      case DIRECTIONS.BOTTOM:
        this.y += STEP
        break
      case DIRECTIONS.LEFT:
        this.x -= STEP
        break
      default:
        break
    }
    if (this.x < PLAYER_SIZE.HALF_WIDTH) {
      this.x = PLAYER_SIZE.HALF_WIDTH
    } else if (this.x > MAP.WIDTH - PLAYER_SIZE.HALF_WIDTH) {
      this.x = MAP.WIDTH - PLAYER_SIZE.HALF_WIDTH
    }
    if (this.y < PLAYER_SIZE.HALF_HEIGHT) {
      this.y = PLAYER_SIZE.HALF_HEIGHT
    } else if (this.y > MAP.HEIGHT - PLAYER_SIZE.HALF_HEIGHT) {
      this.y = MAP.HEIGHT - PLAYER_SIZE.HALF_HEIGHT
    }
  }

  /**
   * 绘制人物
   * @param {CanvasRenderingContext2D} ctx
   */
  render (ctx) {
    ctx.save()
    ctx.translate(this.x, this.y)
    ctx.drawImage(
      this.img,
      Math.floor(this.stepValue) % 4 * PLAYER_SIZE.WIDTH,
      this.direction * PLAYER_SIZE.HEIGHT,
      PLAYER_SIZE.WIDTH,
      PLAYER_SIZE.HEIGHT,
      -PLAYER_SIZE.HALF_WIDTH,
      -PLAYER_SIZE.HALF_HEIGHT,
      PLAYER_SIZE.WIDTH,
      PLAYER_SIZE.HEIGHT
    )

    ctx.translate(-WINDOW_WIDTH / 2, -WINDOW_HEIGHT / 2)
    ctx.fillStyle = '#ffffff'
    ctx.fillText(`x:${this.x} y:${this.y}`, 0, 12)
    ctx.fillText(`bullet: ${this.bulletCount}/${this.bulletTotal} score: ${this.score}`, WINDOW_WIDTH / 2 - 30, 12)
    ctx.restore()

    this.skills.forEach(o => {
      o.render(ctx)
    })
  }
}

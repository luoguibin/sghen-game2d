import {
  WINDOW_WIDTH,
  WINDOW_HEIGHT
} from './const'
import Bullet from './bullet'
import Explosion from './explosion'
import { getDistance } from './utils'

const SPEED_MAX = 4

export default class Tank {
  constructor (id, userName) {
    this.id = id
    this.userName = userName
    this.isSelf = false
    this.obstacleCall = function () {}
    this.score = 0

    /**
     * 机身形状、位置、角度
     */
    this.width = 50
    this.height = 70
    this.circleLimit = Math.sqrt(Math.pow((this.width + this.height) / 4, 2) * 2)
    this.x = 200
    this.y = 200
    this.bodyRadian = 0

    /**
     * 炮筒角度、炮弹个数
     */
    this.barrelRadian = 0
    this.barrelUserRadian = 0
    this.barrelStepRadian = Math.PI / 90
    this.bulletMax = 10
    this.bullets = []
    this.bulletLoadedCount = 0

    this.explosions = []

    /**
     * 直线前进最大速度
     * 油门范围[0, 1]
     */
    this.speedMax = SPEED_MAX
    this.speedValve = 0

    /**
     * 驱动阀门值，正数相对机身则前进，负数则后退
     * 阀门值越大，驱动力越大；左右阀门值可实现机身不同驱动方向
     * MAX:1
     * MIN:-1
     */
    this.rightValve = 0
    this.leftValve = 0
    this.rightStep = 0
    this.leftStep = 0
    this.wheelStep = 0
    this.stepRadian = 0
    this.setValves()

    window.tank = this
  }

  setValves (values = {}) {
    if (values.leftValve !== undefined) {
      this.leftValve = values.leftValve
    }
    if (values.rightValve !== undefined) {
      this.rightValve = values.rightValve
    }
    if (values.speedValve !== undefined) {
      this.speedValve = values.speedValve
    }

    const valve = this.rightValve - this.leftValve
    const stepRadian = Math.abs(valve) / Math.PI / 2

    // const valve = this.rightValve - this.leftValve
    // // 计算拐弯角度，弧度范围[0.00001, 0.5]，接着计算出半径
    // const circleR = 10 / Math.max(Math.abs(valve), 0.00001)
    // const stepRadian = Math.asin(this.speedMax / 2 / circleR) * 2
    this.stepRadian = valve >= 0 ? -stepRadian : stepRadian
  }

  setRadians (values = {}) {
    if (values.bodyRadian !== undefined) {
      this.bodyRadian = values.bodyRadian
    }

    if (values.barrelRadian !== undefined) {
      const barrelUserRadian = values.barrelRadian
      // barrelRadian [0, Math.PI * 2)
      this.barrelUserRadian = barrelUserRadian % (Math.PI * 2)
      this.barrelStepRadian = Math.abs(this.barrelStepRadian)

      if (Math.abs(this.barrelRadian - barrelUserRadian) < Math.PI) {
        if (barrelUserRadian < this.barrelRadian) {
          this.barrelStepRadian = -this.barrelStepRadian
        }
      } else {
        if (barrelUserRadian > this.barrelRadian) {
          this.barrelStepRadian = -this.barrelStepRadian
        }
      }
    }
  }

  addScore (v) {
    this.score += v
  }
  addSpeed (v = 2) {
    this.speedMax = SPEED_MAX + v
    if (this.speedTimer) {
      clearTimeout(this.speedTimer)
    }
    this.speedTimer = setTimeout(() => {
      this.speedMax = SPEED_MAX
      this.speedTimer = null
    }, 10000)
  }

  addBulletMax (v) {
    this.bulletMax += v || 1
  }

  newHit (obstacle, bulletId) {
    const index = this.bullets.findIndex(o => o.id === bulletId)
    if (index < 0) {
      return
    }
    this.bullets.splice(index, 1)
    this.explosions.push(new Explosion(obstacle.x, obstacle.y))
  }

  /**
   * 发射一发炮弹所需的信息
   */
  getBarrelBullet () {
    const radian = this.bodyRadian + this.barrelRadian
    const bulletSpeed = 16

    const o = {
      md: WINDOW_HEIGHT * 5,
      radian: radian,
      xv: Math.sin(radian) * bulletSpeed,
      yv: -Math.cos(radian) * bulletSpeed
    }

    const height = this.height / 2 + 20
    o.id = this.bulletLoadedCount++
    o.x = this.x + height * Math.sin(radian)
    o.y = this.y - height * Math.cos(radian)
    o.ox = o.x
    o.oy = o.y

    return o
  }

  getScreenXY () {
    return {
      x: this.x - WINDOW_WIDTH / 2,
      y: this.y - WINDOW_HEIGHT / 2
    }
  }

  fire (o) {
    if (this.bullets.length < this.bulletMax) {
      this.bullets.push(new Bullet(o))
    }
  }

  update (gameMap, obstacles, tanks) {
    const bodyValve = 1
    this.bodyRadian += this.stepRadian * bodyValve * this.speedValve
    const wheelValve = (Math.abs(this.leftValve) + Math.abs(this.rightValve)) / 2
    const speed = this.speedMax * wheelValve * this.speedValve

    let stepX = Math.sin(this.bodyRadian) * speed
    let stepY = -Math.cos(this.bodyRadian) * speed // 因画布坐标轴Y轴向下
    if (this.leftValve < 0 && this.rightValve < 0) {
      // 后退
      stepX = -stepX
      stepY = -stepY
    }

    this.x += stepX
    this.y += stepY

    // 障碍物检测
    if (this.x > gameMap.width - this.width / 2 || this.x < this.width / 2) {
      this.x -= stepX
    }
    if (this.y > gameMap.height - this.height / 2 || this.y < this.height / 2) {
      this.y -= stepY
    }
    for (let j = obstacles.length - 1; j >= 0; j--) {
      const o = obstacles[j]
      if (getDistance(o.x, o.y, this.x, this.y) < o.value + this.circleLimit) {
        this.x -= stepX
        this.y -= stepY
      }
    }
    for (let i = tanks.length - 1; i >= 0; i--) {
      const o = tanks[i]
      if (o.isSelf) {
        continue
      }
      if (getDistance(o.x, o.y, this.x, this.y) < this.circleLimit * 2) {
        this.x -= stepX
        this.y -= stepY
      }
    }

    this.wheelStep++
    if (this.wheelStep % 10 === 0) {
      if (this.leftValve * this.speedValve !== 0) {
        if (this.leftStep === 0) {
          this.leftStep = this.leftValve < 0 ? -5 * this.leftValve : 5 * this.leftValve
        } else {
          this.leftStep = 0
        }
      }
      if (this.rightValve * this.speedValve !== 0) {
        if (this.rightStep === 0) {
          this.rightStep = this.rightValve < 0 ? -5 * this.rightValve : 5 * this.rightValve
        } else {
          this.rightStep = 0
        }
      }
    }

    if (this.barrelRadian !== this.barrelUserRadian) {
      this.barrelRadian += this.barrelStepRadian
      if (Math.abs(this.barrelRadian - this.barrelUserRadian) < Math.abs(this.barrelStepRadian)) {
        this.barrelRadian = this.barrelUserRadian
      }

      if (this.barrelRadian < 0) {
        this.barrelRadian = this.barrelRadian + Math.PI * 2
      } else if (this.barrelRadian >= Math.PI * 2) {
        this.barrelRadian = this.barrelRadian - Math.PI * 2
      }
    }

    const bullets = this.bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
      const o = bullets[i]
      if (o.isLocked) {
        continue
      }
      o.update()

      // 命中物体，只判断本机子弹
      if (this.isSelf) {
        for (let j = obstacles.length - 1; j >= 0; j--) {
          const o_ = obstacles[j]
          if (o_.isLocked) {
            continue
          }
          if (getDistance(o_.x, o_.y, o.x, o.y) <= o_.value) {
            o_.isLocked = true
            o.isLocked = true
            this.obstacleCall(o_, o, this)
            break
          }
        }
      }

      // 超出范围
      o.update()
      if (o.isEnd) {
        bullets.splice(i, 1)
      }
    }

    const explosions = this.explosions
    for (let i = explosions.length - 1; i >= 0; i--) {
      const o = explosions[i]
      if (o.isEnd) {
        explosions.splice(i, 1)
      } else {
        o.update()
      }
    }
  }

  /**
   * 绘制
   * @param {CanvasRenderingContext2D} ctx
   */
  render (ctx) {
    ctx.save()
    ctx.translate(this.x, this.y)
    ctx.rotate(this.bodyRadian)

    const halfWidth = this.width / 2
    const halfHeight = this.height / 2
    // 底盘
    ctx.fillStyle = '#148acf'
    ctx.fillRect(-halfWidth, -halfHeight, this.width, this.height)
    ctx.fillRect(-halfWidth / 2, -halfHeight - 3, halfWidth, 10)

    ctx.fillStyle = '#00ffff'
    const wheelWidth = halfWidth / 3
    for (let i = 0; i < 10; i++) {
      const gap = this.height / 10 * i - halfHeight
      ctx.fillRect(-halfWidth, this.leftStep + gap, wheelWidth, 2)
      ctx.fillRect(halfWidth - wheelWidth, this.rightStep + gap, wheelWidth, 2)
    }

    // 上盘
    ctx.fillStyle = '#8a14cf'
    ctx.rotate(this.barrelRadian)
    ctx.fillRect(-halfWidth * 0.5, -halfHeight * 0.5, halfWidth, halfHeight)
    ctx.fillRect(-3, -halfHeight - 20, 6, halfHeight + 20)

    ctx.fillStyle = '#ffffff'
    ctx.rotate(-this.barrelRadian - this.bodyRadian)
    ctx.textAlign = 'center'
    ctx.fillText(this.userName, 0, 0)

    if (this.isSelf) {
      ctx.translate(0, -WINDOW_HEIGHT / 2)
      ctx.fillText(`bullet: ${this.bulletMax - this.bullets.length}/${this.bulletMax} score: ${this.score}`, 0, 12)
      ctx.textAlign = 'left'
      ctx.fillText(`x:${this.x >> 0} y:${this.y >> 0}`, -WINDOW_WIDTH / 2, 12)
    }

    ctx.restore()

    this.bullets.forEach(o => {
      o.render(ctx)
    })

    this.explosions.forEach(o => {
      o.render(ctx)
    })
  }
}

import { WINDOW_HEIGHT, WINDOW_WIDTH } from '@/js/const'

const toDegree = function (v) {
  return ~~((v % (Math.PI * 2)) / (Math.PI * 2) * 360)
}

const getDistance = function (x0, y0, x1, y1) {
  return Math.sqrt(Math.pow(x0 - x1, 2) + Math.pow(y0 - y1, 2))
}

export default class Tank {
  constructor (id) {
    this.id = id

    /**
     * 机身形状、位置、角度
     */
    this.width = 50
    this.height = 70
    this.x = 200
    this.y = 500
    this.bodyRadian = 0

    /**
     * 炮筒角度、炮弹个数
     */
    this.barrelRadian = 0
    this.barrelUserRadian = 0
    this.barrelStepRadian = Math.PI / 90
    this.bulletMax = 10
    this.bullets = []

    /**
     * 直线前进最大速度
     * 油门范围[0, 1]
     */
    this.speedMax = 4
    this.speedValve = 0

    /**
     * 驱动阀门值，正数相对机身则前进，负数则后退
     * 阀门值越大，驱动力越大；左右阀门值可实现机身不同驱动方向
     * MAX:1
     * MIN:-1
     */
    this.rightValve = 0
    this.leftValve = 0

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

  /**
   * 发射一发炮弹所需的信息
   */
  getBarrelBullet () {
    const radian = this.bodyRadian + this.barrelRadian
    const bulletSpeed = 20

    const o = {
      md: 1000,
      radian: radian,
      xv: Math.sin(radian) * bulletSpeed,
      yv: -Math.cos(radian) * bulletSpeed
    }

    o.x = this.x + this.height / 2 * Math.sin(radian)
    o.y = this.y - this.height / 2 * Math.cos(radian)
    o.ox = o.x
    o.oy = o.y

    return o
  }

  fire () {
    if (this.bullets.length < this.bulletMax) {
      const o = this.getBarrelBullet()
      this.bullets.push(o)
    }
  }

  update () {
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
    if (this.x > WINDOW_WIDTH || this.x < 0) {
      this.x -= stepX
    }
    if (this.y > WINDOW_HEIGHT || this.y < 0) {
      this.y -= stepY
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
      o.x += o.xv
      o.y += o.yv

      if (getDistance(o.ox, o.oy, o.x, o.y) > o.md) {
        bullets.splice(i, 1)
      }
    }
  }

  /**
   * 绘制
   * @param {CanvasRenderingContext2D} ctx
   */
  draw (ctx) {
    ctx.save()
    ctx.translate(this.x, this.y)
    ctx.rotate(this.bodyRadian)

    const halfWidth = this.width / 2
    const halfHeight = this.height / 2
    // 底盘
    ctx.fillStyle = '#148acf'
    ctx.fillRect(-halfWidth, -halfHeight, this.width, this.height)
    ctx.fillRect(-halfWidth / 2, -halfHeight - 3, halfWidth, 10)

    // 上盘
    ctx.fillStyle = '#8a14cf'
    ctx.rotate(this.barrelRadian)
    ctx.fillRect(-halfWidth * 0.5, -halfHeight * 0.5, halfWidth, halfHeight)
    ctx.fillRect(-3, -halfHeight - 20, 6, halfHeight + 20)

    ctx.restore()

    ctx.fillStyle = '#ffffff'
    this.bullets.forEach(o => {
      ctx.save()
      ctx.translate(o.x, o.y)
      ctx.rotate(o.radian)
      ctx.fillRect(-2, -5, 4, 10)
      ctx.restore()
    })
  }
}

const toDegree = function (v) {
  return ~~((v % (Math.PI * 2)) / (Math.PI * 2) * 360)
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
    this.bulletCount = 10
    this.bulletMax = 10

    /**
     * 直线前进最大速度
     * 油门范围[0, 1]
     */
    this.speedMax = 3
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
    const { leftValve, rightValve, speedValve } = values
    this.leftValve = leftValve || this.leftValve
    this.rightValve = rightValve || this.rightValve
    this.speedValve = speedValve || this.speedValve

    const valve = this.rightValve - this.leftValve
    // 计算拐弯角度，弧度范围[0.00001, 0.5]，接着计算出半径
    const circleR = 30 / Math.max(Math.abs(valve), 0.00001)

    const stepRadian = Math.asin(this.speedMax / 2 / circleR) * 2
    this.stepRadian = valve >= 0 ? -stepRadian : stepRadian
  }

  setRadians (values = {}) {
    const { bodyRadian, barrelRadian } = values
    this.bodyRadian = bodyRadian || this.bodyRadian

    // barrelRadian [0, Math.PI * 2)
    const barrelUserRadian = barrelRadian || this.barrelUserRadian
    this.barrelUserRadian = barrelUserRadian
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

  update () {
    const valve = Math.abs(this.leftValve - this.rightValve)
    this.bodyRadian += this.stepRadian * this.speedValve * valve / 4
    const speed = this.speedMax * this.speedValve * (2 - valve)

    let stepX = Math.sin(this.bodyRadian) * speed
    let stepY = -Math.cos(this.bodyRadian) * speed // 因画布坐标轴Y轴向下
    if (this.leftValve < 0 && this.rightValve < 0) {
      // 后退
      stepX = -stepX
      stepY = -stepY
    }

    this.x += stepX
    this.y += stepY

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
  }
}

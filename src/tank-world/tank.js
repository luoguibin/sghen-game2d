export default class Tank {
  constructor (id) {
    this.id = id

    /**
     * 机身形状、位置、角度
     */
    this.width = 50
    this.height = 70
    this.x = 200
    this.y = 100
    this.bodyRadian = 0

    /**
     * 炮筒角度、炮弹个数
     */
    this.barrelRadian = 0
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

    window.tank = this
  }

  setValves ({ leftValve, rightValve, speedValve }) {
    this.leftValve = leftValve || this.leftValve
    this.rightValve = rightValve || this.rightValve
    this.speedValve = speedValve || this.speedValve
  }

  setRadians ({ bodyRadian, barrelRadian }) {
    this.bodyRadian = bodyRadian || this.bodyRadian
    this.barrelRadian = barrelRadian || this.barrelRadian
  }

  update () {
    let speedX = 0
    let speedY = 0

    // left 驱动点 (-0.5, leftValve)
    // right驱动点 (0.5, rightValve)
    let vectorY = this.rightValve - this.leftValve
    let speedRadian = (-vectorY / 100) * this.speedValve

    if (this.leftValve > 0 && this.rightValve > 0) {
      // 前进
      if (vectorY < 0) {
        // 右前进
        speedX = Math.sin(speedRadian) * this.speedMax
        speedY = -Math.cos(speedRadian) * this.speedMax
      } else {
        speedX = -Math.sin(speedRadian) * this.speedMax
        speedY = -Math.cos(speedRadian) * this.speedMax
      }
    } else if (this.leftValve < 0 && this.rightValve < 0) {
      // 后退
      if (vectorY > 0) {
        speedX = -Math.sin(speedRadian) * this.speedMax
        speedY = Math.cos(speedRadian) * this.speedMax
      } else {
        speedX = -Math.sin(speedRadian) * this.speedMax
        speedY = Math.cos(speedRadian) * this.speedMax
      }
    } else {
      // 原地打转
    }
    speedX *= this.speedValve
    speedY *= this.speedValve
    console.log(speedX, speedY)
    this.x += speedX
    this.y += speedY
    this.bodyRadian += speedRadian * 2
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

    // 上盘
    ctx.fillStyle = '#8a14cf'
    ctx.rotate(this.barrelRadian)
    ctx.fillRect(-halfWidth * 0.5, -halfHeight * 0.5, halfWidth, halfHeight)
    ctx.fillRect(-3, -halfHeight - 20, 6, halfHeight + 20)

    ctx.restore()
  }
}

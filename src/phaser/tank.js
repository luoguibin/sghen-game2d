import Phaser from 'phaser'

/**
 * 坦克实体，只包含一个矩形碰撞
 */
export default class Tank extends Phaser.GameObjects.Container {
  /**
   *
   * @param {Phaser.Scene} scene
   * @param {Number} x
   * @param {Number} y
   */
  constructor (scene, x, y) {
    super(scene, x, y)

    // 附加属性
    this.tankSpeed = 0
    this.tankTurn = 0
    this.barrelTurn = 0
    this.userName = 'Tank'

    this.bulletSpeed = 20
    this.bulletMax = 30
    this.bulletCount = 30

    // 底盘
    this.tankBody = new Phaser.GameObjects.Image(scene, 0, 0, 'tank-00', 'tank-body')
    this.tankBody.setRotation(-Math.PI / 2)
    this.add(this.tankBody)
    // 炮塔
    this.tankBarrel = new Phaser.GameObjects.Image(scene, 0, 0, 'tank-00', 'tank-barrel')
    this.tankBarrel.setOrigin(0.5, 0.3)
    this.tankBarrel.setRotation(-Math.PI / 2)
    this.add(this.tankBarrel)

    this.tankName = new Phaser.GameObjects.Text(scene, 0, 0)
    this.tankName.setText(this.userName)
    this.tankName.setFontSize(30)
    this.tankName.setOrigin(0.5, 0.5)
    this.tankName.setFill('#148acf')
    this.add(this.tankName)

    // 设置当前容器为物理碰撞实体
    const { width, height } = this.tankBody
    scene.matter.add.gameObject(this)
    this.setBody({
      type: 'rectangle',
      width: height * 0.9,
      height: width * 0.9
    })
    this.setTankFriction()
    this.setScale(0.5, 0.5)
    this.setRotation(-Math.PI / 2)
    this.setMass(250)
    this.setData('itemType', 'tank')
    scene.add.existing(this)

    window.tank = this
  }

  setTankName (name) {
    this.tankName.setText(name)
    this.userName = name
  }

  /**
   * 设置旋转
   * @param {Number} v
   */
  setTankTurn (v) {
    this.tankTurn = v || 0
  }
  /**
   * 设置炮塔旋转
   * @param {Number} v
   */
  setTankBarrelTurn (v) {
    this.barrelTurn = v || 0
  }
  /**
   * 设置速度
   * @param {Number} v
   */
  setTankSpeed (v) {
    this.tankSpeed = v || 0
  }
  /**
   * 设置与地面摩擦
   * @param {Number} v
   */
  setTankFriction (v) {
    this.setFriction(v || 0.3, v || 0.3)
  }

  /**
   * 发射炮弹
   */
  fire () {
    if (!this.bulletCount) {
      return
    }
    const radian = this.getBarrelRadian()
    // 避免炮塔自身与炮弹直接碰撞
    const x = this.x + Math.cos(radian) * 63
    const y = this.y + Math.sin(radian) * 63
    const bullet = this.scene.matter.add.image(x, y, 'bullet')
    bullet.setRotation(radian + Math.PI / 2)
    bullet.setScale(0.3, 0.3)
    bullet.setFriction(0, 0, 0)
    bullet.setMass(0.5)
    bullet.setFixedRotation()
    bullet.setVelocity(this.bulletSpeed * Math.cos(radian), this.bulletSpeed * Math.sin(radian))
    bullet.setData('itemType', 'bullet')
    this.bulletCount--
    return bullet
  }
  /**
   * 添加炮弹数
   * @param {Number} v
   */
  addBulletCount (v = 1) {
    this.bulletCount = Math.min(this.bulletCount + v, this.bulletMax)
  }
  /**
   * 获取相对地图的炮塔弧度
   */
  getBarrelRadian () {
    return this.tankBarrel.rotation + this.rotation + Math.PI / 2
  }

  update () {
    if (this.tankTurn < 0) {
      this.setAngularVelocity(-0.02)
    } else if (this.tankTurn > 0) {
      this.setAngularVelocity(0.02)
    }
    if (this.tankSpeed !== 0) {
      const speed = this.tankSpeed
      this.setVelocity(Math.cos(this.rotation) * speed, Math.sin(this.rotation) * speed)
    }

    if (this.barrelTurn > 0) {
      this.tankBarrel.rotation += Math.PI / 80
    } else if (this.barrelTurn < 0) {
      this.tankBarrel.rotation -= Math.PI / 80
    }
    this.tankName.rotation = -this.rotation
  }
}

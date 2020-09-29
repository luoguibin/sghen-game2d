import Phaser from 'phaser'

const RATIO = Math.min(window.devicePixelRatio || 1, 2.5)

/**
 * 游戏摇杆
 */
export default class Joystick {
  /**
   *
   * @param {Phaser.Scene} scene
   */
  constructor (scene, call) {
    this.scene = scene
    this.call = call || function () {}
    this.x = 120 * RATIO
    this.y = scene.game.config.height - 120 * RATIO

    scene.input.topOnly = false
    scene.input.addPointer(3)
    scene.input.on('pointerdown', this.onPointerDown.bind(this))
    scene.input.on('pointerup', this.onPointerUp.bind(this))
    scene.input.on('drag', this.onDrag.bind(this))

    // 方向摇杆
    this.bg = scene.add.circle(this.x, this.y, 100 * RATIO, 0xeeeeee, 0.3)
    this.bg.setScrollFactor(0, 0)
    this.bg.setDepth(99)
    this.stick = scene.add.circle(this.x, this.y, 30 * RATIO, 0x148acf)
    this.stick.setScrollFactor(0, 0)
    this.stick.setDepth(99)
    this.stick.setInteractive({
      draggable: true
    })
    this.stick.setData('itemType', 'stick')

    this.bx = scene.game.config.width - 120 * RATIO
    this.by = this.y
    this.barrelLeft = scene.add.circle(this.bx, this.by, 25 * RATIO, 0xeeeeee, 0.3)
    this.barrelLeft.setScrollFactor(0, 0)
    this.barrelLeft.setDepth(99)
    this.barrelLeft.setInteractive()
    this.barrelLeft.setData('itemType', 'barrelLeft')

    this.barrelRight = scene.add.circle(this.bx + 70 * RATIO, this.by, 25 * RATIO, 0xeeeeee, 0.3)
    this.barrelRight.setScrollFactor(0, 0)
    this.barrelRight.setDepth(99)
    this.barrelRight.setInteractive()
    this.barrelRight.setData('itemType', 'barrelRight')

    this.fire = scene.add.circle(this.bx + 35 * RATIO, this.by + 70 * RATIO, 35 * RATIO, 0xeeeeee, 0.3)
    this.fire.setScrollFactor(0, 0)
    this.fire.setDepth(99)
    this.fire.setInteractive()
    this.fire.setData('itemType', 'fire')

    window.joystick = this
  }

  onPointerDown (pointer, gameObjects, dragX, dragY) {
    const gameObject = gameObjects[0]
    if (!gameObject) {
      return
    }

    switch (gameObject.getData('itemType')) {
      case 'stick':
        this.onDragStartStick(dragX, dragY)
        break
      case 'barrelLeft':
        this.barrelLeft.setAlpha(0.6)
        this.call('barrel', -1)
        break
      case 'barrelRight':
        this.barrelRight.setAlpha(0.6)
        this.call('barrel', 1)
        break
      case 'fire':
        this.fire.setAlpha(0.6)
        this.call('fire')
        break
      default:
        break
    }
  }
  onPointerUp (pointer, gameObjects, dragX, dragY) {
    const gameObject = gameObjects[0]
    if (!gameObject) {
      return
    }
    switch (gameObject.getData('itemType')) {
      case 'stick':
        this.onDragEndStick(dragX, dragY)
        break
      case 'barrelLeft':
        this.barrelLeft.setAlpha(1)
        this.call('barrel', 0)
        break
      case 'barrelRight':
        this.barrelRight.setAlpha(1)
        this.call('barrel', 0)
        break
      case 'fire':
        this.fire.setAlpha(1)
        break
      default:
        break
    }
  }
  onDrag (pointer, gameObject, dragX, dragY) {
    switch (gameObject.getData('itemType')) {
      case 'stick':
        this.onDragStick(dragX, dragY)
        break
      case 'barrelLeft':
        break
      case 'barrelRight':
        break
      case 'fire':
        break

      default:
        break
    }
  }

  onDragStartStick () {
    const { scrollX, scrollY } = this.scene.cameras.main
    this.cScrollX = scrollX
    this.cScrollY = scrollY
  }
  onDragStick (dragX, dragY) {
    const { scrollX, scrollY } = this.scene.cameras.main
    dragX -= scrollX - this.cScrollX
    dragY -= scrollY - this.cScrollY
    const radian = Math.atan2(dragY - this.y, dragX - this.x)
    const DISTANCE = 80 * RATIO
    const distance = Phaser.Math.Distance.Between(this.x, this.y, dragX, dragY)
    if (distance > DISTANCE) {
      dragX = this.x + Math.cos(radian) * DISTANCE
      dragY = this.y + Math.sin(radian) * DISTANCE
    }
    this.stick.setPosition(dragX, dragY)

    let speedRatio = Math.min(distance, DISTANCE) / DISTANCE
    if (dragY > this.y) {
      speedRatio = -speedRatio
    }
    let valueX = this.x - dragX
    valueX = speedRatio >= 0 ? -valueX : valueX
    let directionRatio = Math.min(valueX, DISTANCE) / DISTANCE
    this.call('direction', speedRatio, directionRatio)
  }
  onDragEndStick (dragX, dragY) {
    this.call('direction', 0, 0)
    this.scene.tweens.add({
      targets: this.stick,
      x: this.x,
      y: this.y,
      duration: 200
    })
  }

  update (time, delta) {

  }
}

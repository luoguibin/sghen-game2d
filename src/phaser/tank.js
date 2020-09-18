import Phaser from 'phaser'

export default class extends Phaser.Physics.Arcade.Sprite {
  /**
   *
   * @param {Phaser.Scene} scene
   * @param {Number} x
   * @param {Number} y
   */
  constructor (scene, x, y) {
    super(scene, x, y, 'tank-00', 'tank-body')
    scene.children.add(this)
    scene.physics.add.existing(this)
    this.scene = scene
    // this.body = scene.physics.add.sprite(x, y, 'tank-00', 'tank-body')
    // this.body.setBounce(0, 0)
    this.setCollideWorldBounds(true)

    this.barrel = scene.add.image(this.x, this.y, 'tank-00', 'tank-barrel')
    this.barrel.setOrigin(0.5, 0.3)
    this.barrel.setPosition(x, y - 30)
    this.barrel.active = false

    window.tank = this
  }

  setVelocityX (v) {
    super.setVelocityX(v)
    // this.body.setVelocityX(v)
    // this.barrel.setVelocityX(v)
  }

  setVelocityY (v) {
    super.setVelocityY(v)
    // this.body.setVelocityY(v)
    // this.barrel.setVelocityY(v)
  }

  update (time, delta) {
    // this.rotation += Math.PI / 100
    // super.update(time, delta)
    // this.scene.physics.velocityFromRotation(this.rotation, 100)
    this.barrel.x = this.x
    this.barrel.y = this.y - 30
  }
}

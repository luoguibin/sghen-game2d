import Phaser from 'phaser'
export default class Tank extends Phaser.GameObjects.Container {
  /**
   *
   * @param {Phaser.Scene} scene
   * @param {Number} x
   * @param {Number} y
   */
  constructor (scene, x, y) {
    super(scene, x, y)
    this.tankSpeed = 0
    this.tankTurn = 0

    this.tankBody = new Phaser.GameObjects.Image(scene, 0, 0, 'tank-00', 'tank-body')
    this.add(this.tankBody)

    this.tankBarrel = new Phaser.GameObjects.Image(scene, 0, -20, 'tank-00', 'tank-barrel')
    this.tankBarrel.setOrigin(0.5, 0.3)
    this.add(this.tankBarrel)

    scene.physics.world.enable(this)
    const { width, height } = this.tankBody
    this.setSize(width * 0.9, height * 0.9)
    this.setScale(0.5, 0.5)
    this.body.setSize(width * 0.9, height * 0.9)
    this.body.setCollideWorldBounds(true)

    scene.add.existing(this)
    window.tank = this
  }

  setTankTurn (v) {
    this.tankTurn = v || 0
  }

  setTankSpeed (v) {
    this.tankSpeed = v || 0
  }

  update () {
    if (this.tankTurn < 0) {
      this.body.rotation -= Math.PI / 50
    } else if (this.tankTurn > 0) {
      this.body.rotation += Math.PI / 50
    }
    if (this.speed > 0) {
      this.scene.physics.velocityFromRotation(this.body.rotation, this.speed, this.body.velocity)
    }
    // this.tankBarrel.rotation += Math.PI / 50
  }
}

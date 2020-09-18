import Phaser from 'phaser'

export default class Tank0 extends Phaser.Physics.Arcade.Group {
  /**
   *
   * @param {Phaser.Scene} scene
   * @param {Number} x
   * @param {Number} y
   */
  constructor (scene, x, y) {
    super(scene.physics.world, scene)

    this.body = this.create(x, y, 'tank-00', 'tank-body')
    this.barrel = this.create(x, y + 30, 'tank-00', 'tank-barrel')

    scene.physics.world.enable(this)

    window.tank0 = this
  }

  preUpdate () {
    super.preUpdate()
    console.log('preUpdate')
  }
}

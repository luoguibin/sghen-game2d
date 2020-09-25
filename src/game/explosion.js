import Phaser from '../phaser/src/phaser'

export default class Explosion extends Phaser.GameObjects.Sprite {
  /**
   *
   * @param {Phaser.Scene} scene
   * @param {Number} x
   * @param {Number} y
   */
  constructor (scene, x, y) {
    super(scene, x, y, 'explosions')

    const config = {
      key: 'explodeAnimation',
      frames: scene.anims.generateFrameNumbers('explosions', { start: 0, end: 18, first: 0 }),
      frameRate: 20,
      repeat: 0
    }

    scene.anims.create(config)
    scene.add.existing(this)
    this.play('explodeAnimation')

    this.on(Phaser.Animations.Events.SPRITE_ANIMATION_COMPLETE, () => {
      this.destroy()
    })
  }
}

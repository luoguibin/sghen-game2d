import Phaser from 'phaser'
import Tank from './tank'

export default class extends Phaser.Scene {
  constructor () {
    super({ key: 'tank-scene' })
    window.tankScene = this
  }

  preload () {

  }
  create () {
    const { width, height } = this.game.config
    this.physics.world.setBounds(0, 0, width * 4, height * 3)
    this.bg = this.add.tileSprite(0, 0, width * 4, height * 3, 'sky')
    this.bg.setOrigin(0, 0)

    // 将水平死区设置为0.5倍游戏宽度
    // this.cameras.main.setDeadzone(this.scale.width * 0.5, this.scale.height * 0.5)

    // var particles = this.add.particles('red')
    // var emitter = particles.createEmitter({
    //   speed: 88,
    //   scale: { start: 1, end: 0 },
    //   blendMode: 'ADD'
    // })
    // emitter.startFollow(this.tank)

    this.enemy = this.physics.add.image(width / 2, height / 2, 'enemy')
    this.enemy.setVelocity(200, 250)
    this.enemy.setBounce(1, 1)
    this.enemy.setCollideWorldBounds(true)

    this.positionText = this.add.text(0, 0, 'Welcome...', { font: '32px Arial', fill: '#ffffff', align: 'center' })
    this.positionText.setScrollFactor(0, 0)
    this.positionText.setAlign('left')

    // setTimeout(() => {
    //   this.scene.start('tank-scene')
    // }, 3000)

    this.cursors = this.input.keyboard.createCursorKeys()

    this.tank = new Tank(this, 200, 300)
    this.cameras.main.startFollow(this.tank)

    this.physics.add.collider(this.enemy, this.tank, () => {
      this.enemy.setVelocity(200, 250)
    })
  }

  onPause () {
    this.physics.pause()
    // this.physics.resume()
  }

  update (time, delta) {
    super.update(time, delta)

    if (this.cursors.down.isDown) {
      this.tank.setTankSpeed(-100)
    } else if (this.cursors.up.isDown) {
      this.tank.setTankSpeed(100)
    } else {
      this.tank.setTankSpeed(0)
    }
    if (this.cursors.right.isDown) {
      this.tank.setTankTurn(1)
    } else if (this.cursors.left.isDown) {
      this.tank.setTankTurn(-1)
    } else {
      this.tank.setTankTurn()
    }

    this.tank.update(time, delta)
    const { x, y } = this.tank.body
    this.positionText.setText(`x:${x >> 0}\ny:${y >> 0}`)
  }
}

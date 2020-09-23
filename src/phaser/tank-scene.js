import Phaser from 'phaser'
import Tank from './tank'
import Explosion from './explosion'
import Enemies from './enemies'

export default class extends Phaser.Scene {
  constructor () {
    super({ key: 'tank-scene' })
    window.tankScene = this
  }

  preload () {

  }
  create () {
    const { width, height } = this.game.config
    this.matter.world.setBounds(0, 0, width * 4, height * 3)
    this.bg = this.add.tileSprite(0, 0, width * 4, height * 3, 'sky')
    this.bg.setOrigin(0, 0)

    // 将水平死区设置为0.5倍游戏宽度
    // this.cameras.main.setDeadzone(this.scale.width * 0.5, this.scale.height * 0.5)

    this.positionText = this.add.text(0, 0, 'Welcome...', { font: '32px Arial', fill: '#ffffff', align: 'center' })
    this.positionText.setScrollFactor(0, 0)
    this.positionText.setAlign('left')

    this.tank = new Tank(this, 200, 300)
    this.tank.setTankName(this.game.userInfo.username)
    this.cameras.main.startFollow(this.tank)

    this.matter.world.on('collisionstart', (e, body0, body1) => {
      const obj0 = body0.gameObject
      const obj1 = body1.gameObject

      if (obj0 && obj0.getData('itemType') === 'bullet') {
        const { x, y } = obj0
        obj0.destroy()
        this.newExplosion(x, y)
      } else if (obj1 && obj1.getData('itemType') === 'bullet') {
        const { x, y } = obj1
        obj1.destroy()
        this.newExplosion(x, y)
      }
    })

    this.cursors = this.input.keyboard.createCursorKeys()

    this.enemies = new Enemies(this)
  }

  newExplosion (x, y) {
    new Explosion(this, x, y)
  }

  newTank (x, y) {
    new Tank(this, x, y)
  }

  onPause () {
    this.matter.pause()
    // this.physics.pause()
    // this.physics.resume()
  }

  update (time, delta) {
    // super.update(time, delta)

    if (this.cursors.down.isDown) {
      this.tank.setTankSpeed(-5)
    } else if (this.cursors.up.isDown) {
      this.tank.setTankSpeed(5)
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
    this.enemies.update(time, delta, this.tank)

    const { x, y } = this.tank
    this.positionText.setText(`x:${x >> 0}\ny:${y >> 0}`)
  }
}

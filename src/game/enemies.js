import Tank from './tank'

export default class Enemies {
  /**
   *
   * @param {Phaser.Scene} scene
   */
  constructor (scene) {
    this.scene = scene
    /**
     * @type {Tank[]}
     */
    this.tanks = []

    // this.newTank()
  }

  newTank () {
    const tank = new Tank(this.scene, 1000 * Math.random() >> 0, 1000 * Math.random() >> 0)
    tank.tankBody.setTint(Math.random() * 0xffffff)
    tank.setRotation(Math.PI * Math.random())
    tank._actionTime = 0
    this.tanks.push(tank)
    if (this.tanks.length < 15) {
      setTimeout(() => {
        this.newTank()
      }, 1500)
    }
  }

  update (time, delta, tank) {
    this.tanks.forEach(o => {
      o.update(time, delta)
      if (time - o._actionTime < 5000) {
        return
      }
      o._actionTime = time
      o.setTankSpeed(5)
      if (Math.random() < 0.1) {
        o.setTankTurn(Math.random() < 0.5 ? 1 : -1)
        o.setTankBarrelTurn(Math.random() < 0.5 ? 1 : -1)
      } else {
        o.setTankTurn(0)
        o.setTankBarrelTurn(0)
      }
      o.fire()
    })
  }
}

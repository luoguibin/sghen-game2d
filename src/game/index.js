import Phaser from 'phaser'
import AssetsScene from './assets-scene'
import TankScene from './tank-scene'

export default class extends Phaser.Game {
  /**
   * @type {WebSocket}
   */
  ws = null

  /**
   * @param {HTMLElement} parentEl
   * @param {Object} userInfo
   */
  constructor (parentEl, userInfo) {
    super({
      type: Phaser.AUTO,
      width: parentEl.clientWidth * window.devicePixelRatio,
      height: parentEl.clientHeight * window.devicePixelRatio,
      // resolution: window.devicePixelRatio || 1,
      parent: parentEl,
      antialias: true,
      // zoom: 1,
      physics: {
        default: 'matter',
        matter: {
          debug: process.env.NODE_ENV !== 'production',
          gravity: { y: 0 }
        }
        // arcade物理引擎只支持AABB碰撞检测
        // default: 'arcade',
        // arcade: {
        //   debug: true,
        //   gravity: { y: 0 }
        // }
      },
      disableContextMenu: true,
      scene: [AssetsScene, TankScene]
    })
    this.userInfo = userInfo

    window.phaserGame = this
  }

  getUserId () {
    return this.userInfo.id
  }
  getUserName () {
    return this.userInfo.username
  }
}

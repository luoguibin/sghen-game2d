import Phaser from 'phaser'
import AssetsScene from './assets-scene'
import TankScene from './tank-scene'
import { WS_URL } from '../const'

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
      physics: {
        default: 'matter',
        matter: {
          debug: true,
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
    // this.initWS()
    window.phaserGame = this
  }

  /**
   * 初始化WebSocket通信
   */
  initWS () {
    const socket = new WebSocket(`${WS_URL}?token=${this.userInfo.token}`)
    socket.addEventListener('open', () => {
      console.log('socket is open')
      this.ws = socket
      socket.addEventListener('message', (event) => {
        this.dealMsg(event.data)
      })
    })

    socket.addEventListener('close', () => {
      console.log('socket is closed')
      this.ws = null
    })
  }
  /**
   * 发送指令
   * @param {*} orderId
   * @param {*} toId
   * @param {*} data
   */
  sendOrder (orderId, toId, data) {
    if (!this.ws) {
      return
    }
    const order = {
      id: orderId,
      fromId: this.userInfo.id,
      data
    }
    this.ws.send(JSON.stringify(order))
  }
  /**
   * 解析指令
   * @param {*} s
   */
  parseOrder (s) {
    if (!s) {
      return
    }
    const { id } = JSON.parse(s)
    switch (id) {
      case 100:
        break
      default:
        break
    }
  }
}

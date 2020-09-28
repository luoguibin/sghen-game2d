import Phaser from 'phaser'
import Order from './order'
import { WS_URL, HEART_DELAY } from './const'

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
    this.playerInfo = null

    this.initWS()
    window.phaserGame = this
  }

  /**
   * 初始化WebSocket通信
   */
  initWS () {
    this.events.on('order-send', (e) => {
      if (!e.fromId) {
        e.fromId = this.playerInfo.id
      }
      this.ws.send(JSON.stringify(e))
    })
    const isTest = false
    if (isTest) {
      this.boxes = []
      this.map = {
        id: 0,
        width: window.screen.width,
        height: window.screen.height
      }
      this.ws = {
        send: (s) => {
          const order = JSON.parse(s)
          switch (order.id) {
            case Order.HEART_BEAT:
              break
            case Order.PLAYER_LOGIN:
              this.playerInfo = order.data
              break
            case Order.MSG:
              this.msgCall({
                id: Date.now(),
                fromName: order.data.userName,
                content: order.data.content
              })
              break
            case Order.ENTER_MAP:
              order.data = {
                player: {
                  id: this.userInfo.id,
                  userName: this.userInfo.username,
                  x: 200,
                  y: 300
                },
                map: this.map
              }
              break
            case Order.MAP_PLAYER_DATAS: {
              const { boxes } = order.data || {}
              order.data = {
                players: []
              }
              if (boxes) {
                order.data.boxes = this.boxes
              }
            }
              break
            default:
              break
          }
          setTimeout(() => {
            this.events.emit('order-deal', order)
          }, 100)
        }
      }
      setTimeout(() => {
        this.ws.send(JSON.stringify(Order.new(Order.PLAYER_LOGIN, this.userInfo.id, {
          id: this.userInfo.id,
          userName: this.userInfo.username
        })))
      }, 1000)

      setInterval(() => {
        if (this.boxes.length < 50) {
          const o = {
            id: Date.now(),
            x: Math.random() * this.map.width >> 0,
            y: Math.random() * this.map.height >> 0,
            type: Math.random() < 0.1 ? 'add' : Math.random() < 0.1 ? 'add-all' : 'show',
            value: (Math.random() * 8 >> 0) + 18
          }
          this.boxes.push(o)
          this.ws.send(JSON.stringify(Order.new(Order.MAP_BOXES, null, [o])))
        }
      }, 3000)
      return
    }

    const socket = new WebSocket(`${WS_URL}?token=${this.userInfo.token}`)
    socket.addEventListener('open', () => {
      console.log('socket is open')

      socket.addEventListener('message', (e) => {
        const order = JSON.parse(e.data)
        switch (order.id) {
          case Order.PLAYER_LOGIN:
            this.playerInfo = order.data
            break
          case Order.MSG:
            this.msgCall({
              id: Date.now(),
              fromName: order.data.userName,
              content: order.data.content
            })
            break
          default:
            this.events.emit('order-deal', order)
            break
        }
      })
      this.ws = socket
      this.heartHandler = setInterval(() => {
        this.events.emit('order-send', Order.new(Order.HEART_BEAT))
      }, HEART_DELAY)
    })

    socket.addEventListener('close', () => {
      console.log('socket is closed')
      this.ws = null
      clearInterval(this.heartHandler)
    })
  }

  /**
   * 发送聊天文本
   * @param {String} text
   */
  sendText (text) {
    this.events.emit('order-send', Order.new(Order.MSG, null, {
      userName: this.playerInfo.userName,
      content: text
    }))
  }
}

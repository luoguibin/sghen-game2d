import Phaser from 'phaser'
import Tank from './tank'
import Explosion from './explosion'
import Joystick from './joystick'
import { WS_URL } from '../const'
import { ACTION, PLAYER, SKILL, SYSTEM, newOrder } from './order'
import { throttle } from 'lodash'

export default class extends Phaser.Scene {
  constructor () {
    super({ key: 'tank-scene' })

    this.player = null
    this.players = []

    this.handleDirection = throttle(this._handleDirection, 200, { leading: true })
    this.handleBarrel = throttle(this._handleBarrel, 200, { leading: true })

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

    this.matter.world.on('collisionstart', (e, body0, body1) => {
      this.handleCollisions(body0.gameObject, body1.gameObject)
    })

    this.cursors = this.input.keyboard.createCursorKeys()

    this.joystick = new Joystick(this, (key, v0, v1) => {
      switch (key) {
        case 'direction': {
          const speed = 5 * (Math.round(v0 * 5) >> 0) / 5
          const turn = (Math.round(v1 * 3) >> 0) / 3
          this.handleDirection(speed, turn)
        }
          break
        case 'barrel':
          this.handleBarrel(v0)
          break
        case 'fire': {
          const o = this.player.getBullet()
          o && this.sendMsg(newOrder(SKILL.START, PLAYER.ALL, o))
        }
          break
        default:
          break
      }
    })

    this.initWS()
  }

  /**
   * 初始化WebSocket通信
   */
  initWS () {
    const socket = new WebSocket(`${WS_URL}?token=${this.game.userInfo.token}`)
    socket.addEventListener('open', () => {
      console.log('socket is open')
      this.ws = socket
      socket.addEventListener('message', (event) => {
        this.parseOrder(event.data)
      })
    })

    socket.addEventListener('close', () => {
      console.log('socket is closed')
      this.ws = null
    })
  }
  _handleDirection (speed, turn) {
    this.sendMsg(newOrder(ACTION.MOVING, PLAYER.ALL, { speed, turn }))
  }
  _handleBarrel (value) {
    this.sendMsg(newOrder(ACTION.BARREL, PLAYER.ALL, { value }))
  }
  /**
   * @param {Phaser.GameObjects} obj0
   * @param {Phaser.GameObjects} obj1
   */
  handleCollisions (obj0, obj1) {
    if (obj1 && !obj0) {
      this.handleCollisions(obj1, obj0)
      return
    }

    const itemType0 = obj0.getData('itemType')
    const itemType1 = obj1 && obj1.getData('itemType')
    if (!itemType1) {
      if (itemType0 === 'bullet') {
        obj0.destroy()
      }
      return
    }

    if (itemType0 === 'bullet') {
      switch (itemType1) {
        case 'obstacle':
          this.newExplosion(obj0, obj1)
          break
        default:
          obj0.destroy()
          break
      }
    } else if (itemType0 === 'obstacle') {
      switch (itemType1) {
        case 'bullet':
          this.newExplosion(obj1, obj0)
          break
        default:
          obj1.destroy()
          break
      }
    }
  }
  /**
   * 发送指令
   */
  sendMsg (o) {
    if (!this.ws) {
      return
    }
    if (!o.fromId) {
      o.fromId = this.game.getUserId()
    }
    o.sceneId = this.gameMap.id
    this.ws.send(JSON.stringify(o))
  }
  sendText (text) {
    this.sendMsg(newOrder(SYSTEM.MESSAGE, PLAYER.ALL, text))
  }
  /**
   * 解析指令
   * @param {*} s
   */
  parseOrder (msg) {
    if (!msg) {
      return
    }
    const { id, fromId, data } = JSON.parse(msg)
    const fromPlayer = this.children.getByName(fromId)

    switch (id) {
      case PLAYER.RECONNECT:
      case PLAYER.LOGIN: {
        // 初始化登录的玩家
        const newPlayer = new Tank(this, 200, 200)
        newPlayer.setTankName(this.game.getUserId(), this.game.getUserName())
        if (data.actionOrder) {
          const position = data.actionOrder.data
          if (position.x !== undefined) {
            newPlayer.setPosition(position.x, position.y)
          }
        }

        this.cameras.main.startFollow(newPlayer)
        this.players = [newPlayer]
        this.player = newPlayer
        this.heartId = setInterval(() => {
          this.sendMsg(newOrder(PLAYER.HEART))
        }, 8000)
      }
        break
      case PLAYER.LOGOUT: {
        const ids = data || []
        ids.forEach(v => {
          const i = this.players.indexOf(o => o.id === v)
          if (i >= 0) {
            const player = this.players[i]
            player.destroy()
            this.players.splice(i, 1)
          }
        })
      }
        break
      case ACTION.ENTER_MAP:
        if (fromId === SYSTEM.GOD) {
          // 用户进入场景，并获取到场景中的用户列表
          this.gameMap = data.map
          const selfId = this.player.id
          data.players.forEach(o => {
            if (o.id !== selfId) {
              const newPlayer = new Tank(o.id, o.username)
              if (o.actionOrder) {
                const { data } = o.actionOrder
                if (data.x !== undefined) {
                  newPlayer.setPosition(data.x, data.y)
                }
              }
              this.players.push(newPlayer)
            }
          })
          data.obstacles.forEach(o => {
            this.newObstacle(o)
          })
        } else {
          if (fromPlayer) {
            if (data.actionOrder) {
              const position = data.actionOrder.data
              if (position.x !== undefined) {
                fromPlayer.x = position.x
                fromPlayer.y = position.y
              }
              if (data.actionOrder.id === ACTION.VALVES) {
                fromPlayer.walk(data.direction)
              }
            }
            return
          }
          const newPlayer = new Tank(data.id, data.username)
          if (data.actionOrder) {
            const position = data.actionOrder.data
            if (position.x !== undefined) {
              newPlayer.setPosition(position.x, position.y)
            }
          }
          this.players.push(newPlayer)
        }
        break
      case ACTION.MOVING:
        fromPlayer.setTankSpeed(data.speed)
        fromPlayer.setTankTurn(data.turn)
        break
      case ACTION.BARREL:
        fromPlayer.setTankBarrelTurn(data.value)
        break
      case SKILL.START:
        fromPlayer.fire(data)
        break
      case SKILL.HIT:
        this.handleHit(fromPlayer, data)
        break
      case SYSTEM.OBSTACLE:
        data.forEach(o => {
          this.newObstacle(o)
        })
        break
      case SYSTEM.MESSAGE:
        this.msgCall({
          id: Date.now(),
          fromName: fromPlayer.userName,
          content: data
        })
        break
      default:
        break
    }
  }

  newObstacle (o) {
    const obstacle = this.matter.add.image(o.x, o.y, 'xiangzi-00')
    obstacle.setName(o.id)
    obstacle.setStatic(true)
    obstacle.setData('itemType', 'obstacle')
    obstacle.setData('obstacleData', o)
    obstacle.setScale(0.2, 0.2)
    if (o.type === 'add') {
      obstacle.setTint(0x148acf)
    } else if (o.type === 'add-all') {
      obstacle.setTint(0xcf148a)
    }
    // type、value
  }

  handleHit (player, data) {
    const { id, type, value, x, y } = data
    player.addScore(value)
    if (type === 'add') {
      player.addBulletCount(10)
    } else if (type === 'add-all') {
      player.addBulletMax()
    }
    if (player !== this.player) {
      const obstacle = this.children.getByName(id)
      new Explosion(this, x, y)
      obstacle.destroy()
    }
  }

  newExplosion (bullet, obtacle) {
    const tankId = bullet.getData('tankId')
    if (tankId !== this.player.id) {
      bullet.destroy()
      return
    }
    this.sendMsg(newOrder(SKILL.HIT, PLAYER.ALL, {
      bulletId: bullet.name,
      ...obtacle.getData('obstacleData')
    }))

    new Explosion(this, obtacle.x, obtacle.y)
    bullet.destroy()
    obtacle.destroy()
  }

  fire () {
    const o = this.player.getBarrelBullet()
    if (!o) {
      return
    }
    this.sendMsg(newOrder(SKILL.START, PLAYER.ALL, o))
  }

  onPause () {
    this.matter.pause()
    // this.physics.pause()
    // this.physics.resume()
  }

  update (time, delta) {
    // super.update(time, delta)

    this.players.forEach(o => {
      o.update(time, delta)
    })
    this.joystick.update(time, delta)

    if (this.player) {
      const { x, y } = this.player
      this.positionText.setText([`x:${x >> 0}\ny:${y >> 0}`, `score:${this.player.score}`])
    }
  }
}

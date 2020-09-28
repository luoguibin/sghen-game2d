import Phaser from 'phaser'
import Tank from './tank'
import Explosion from './explosion'
import Joystick from './joystick'
import Order from './order'
import { throttle } from 'lodash'

export default class TankScene extends Phaser.Scene {
  /**
   * 地图信息
   */
  gameMap = null

  /**
   * 玩家自身
   */
  player = null

  /**
   * 所有玩家集合
   */
  players = []

  constructor () {
    super({ key: 'tank-scene' })

    this.handleDirection = throttle(this._handleDirection, 200, { leading: true })
    this.handleBarrel = throttle(this._handleBarrel, 200, { leading: true })

    window.tankScene = this
  }

  preload () {
  }

  create () {
    const { width, height } = this.game.config
    this.matter.world.setBounds(0, 0, width, height)
    this.bg = this.add.tileSprite(0, 0, width, height, 'sky')
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
          o && this.sendOrder(Order.new(Order.SKILL_START, null, o))
        }
          break
        default:
          break
      }
    })

    this.game.events.on('order-deal', (o) => {
      this.dealOrder(o)
    })

    // 请求进入场景
    this.sendOrder(Order.new(Order.ENTER_MAP))
  }

  /**
   * 发送指令
   * @param {Object} order
   */
  sendOrder (order) {
    if (this.gameMap) {
      order.sceneId = this.gameMap.id
    }

    this.game.events.emit('order-send', order)
  }

  /**
   * 解析指令
   */
  dealOrder (order) {
    const { id, fromId, data } = order
    const fromPlayer = this.children.getByName(fromId)

    switch (id) {
      case Order.ENTER_MAP: {
        const info = data.player

        if (info.id === this.game.playerInfo.id) {
          // 重置地图信息
          this.gameMap = data.map
          const { width, height } = this.gameMap
          this.matter.world.setBounds(0, 0, width, height)
          this.bg.setSize(width, height)

          // 镜头跟随
          const player = new Tank(this, info.x, info.y, info.id, info.username)
          player.addScore(info.score || 0)
          this.cameras.main.startFollow(player)
          this.players = [player]
          this.player = player

          this.sendOrder(Order.new(Order.MAP_PLAYER_DATAS, null, { boxes: true }))
        } else {
          if (this.children.getByName(info.id)) {
            return
          }
          const player = new Tank(this, info.x, info.y, info.id, info.username)
          player.addScore(info.score || 0)
          this.players.push(player)
        }
      }
        break
      case Order.MAP_PLAYER_DATAS: {
        /** @type {Array} */
        const playerList = data.players || []
        playerList.forEach(info => {
          if (info.id !== this.player.id) {
            const player = new Tank(this, info.x, info.y, info.id, info.username)
            player.addScore(info.score || 0)
            this.players.push(player)
          }
        })

        // 箱子信息
        /** @type {Array} */
        const boxList = data.boxes || []
        boxList.forEach(o => {
          this.newObstacle(o)
        })

        this.refreshScores()
      }
        break
      case Order.PLAYER_LOGOUT: {
        /** @type {Array} */
        const list = data || []
        list.forEach(v => {
          const i = this.players.indexOf(o => o.id === v)
          if (i >= 0) {
            const player = this.players[i]
            player.destroy()
            this.players.splice(i, 1)
          }
        })
      }
        break
      case Order.MOTION:
        fromPlayer.setTankSpeed(data.speed)
        fromPlayer.setTankTurn(data.turn)
        fromPlayer.setPosition(data.x, data.y)
        break
      case Order.MOTION_BARREL:
        fromPlayer.setTankBarrelTurn(data.value)
        fromPlayer.setPosition(data.x, data.y)
        break
      case Order.SKILL_START:
        fromPlayer.fire(data)
        break
      case Order.SKILL_HIT:
        this.handleHit(fromPlayer, data)
        break
      case Order.MAP_BOXES: {
        const boxList = data || []
        boxList.forEach(o => {
          this.newObstacle(o)
        })
      }
        break
      default:
        break
    }
  }

  _handleDirection (speed, turn) {
    const { x, y } = this.player
    this.sendOrder(Order.new(Order.MOTION, Order.ALL, { speed, turn, x, y }))
  }
  _handleBarrel (value) {
    const { x, y } = this.player
    this.sendOrder(Order.new(Order.MOTION_BARREL, Order.ALL, { value, x, y }))
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

  newObstacle (o) {
    const obstacle = this.matter.add.image(o.x, o.y, 'xiangzi-00')
    obstacle.setName(o.id)
    obstacle.setStatic(true)
    obstacle.setData('itemType', 'obstacle')
    obstacle.setData('obstacleData', o)
    obstacle.setScale(0.2, 0.2)
    if (o.type === 'add') {
      //
    } else if (o.type === 'add-all') {
      //
    } else {
      obstacle.setTint(0x148acf)
    }
    // type、value
  }

  handleHit (player, data) {
    const { id, type, value, x, y, score } = data
    if (score) {
      player.addScore(value)
      if (type === 'add') {
        player.addBulletCount(10)
      } else if (type === 'add-all') {
        player.addBulletMax()
      }
    }

    if (player !== this.player) {
      const obstacle = this.children.getByName(id)
      new Explosion(this, x, y)
      obstacle.destroy()
    }
    this.refreshScores()
  }

  refreshScores () {
    this.game.scoreCall(this.players.map(o => {
      return {
        id: o.id,
        userName: o.userName,
        score: o.score
      }
    }))
  }

  newExplosion (bullet, obtacle) {
    const tankId = bullet.getData('tankId')
    if (tankId !== this.player.id) {
      bullet.destroy()
      return
    }
    this.sendOrder(Order.new(Order.SKILL_HIT, null, {
      bulletId: bullet.name,
      ...obtacle.getData('obstacleData')
    }))

    new Explosion(this, obtacle.x, obtacle.y)
    bullet.destroy()
    obtacle.destroy()
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

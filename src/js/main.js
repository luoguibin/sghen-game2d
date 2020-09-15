import { throttle } from 'lodash'
import {
  WS_URL,
  PIXEL_RATIO,
  WINDOW_WIDTH,
  WINDOW_HEIGHT,
  CANVAS_WIDTH,
  CANVAS_HEIGHT
} from './const'
import { ACTION, PLAYER, SKILL, SYSTEM, newOrder } from './order'
// import Player from './player'
import Tank from './tank'

/**
 * 游戏主函数
 */
export default class Main {
  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor (canvas, { id, token }) {
    this.id = id
    this.userName = ''
    this.token = token
    this.gameMap = null

    // 抗锯齿
    canvas.setAttribute('width', CANVAS_WIDTH)
    canvas.setAttribute('height', CANVAS_HEIGHT)
    canvas.width = CANVAS_WIDTH
    canvas.height = CANVAS_HEIGHT
    canvas.style.width = WINDOW_WIDTH + 'px'
    canvas.style.height = WINDOW_HEIGHT + 'px'
    const ctx = canvas.getContext('2d', {
      antialias: true
    })
    ctx.scale(PIXEL_RATIO, PIXEL_RATIO)
    ctx.translate(0.5, 0.5)
    this.ctx = ctx

    // 维护当前requestAnimationFrame的id
    this.aniId = 0

    this.bindLoop = this.loop.bind(this)

    this.players = []
    this.obstacles = []
    this.touchIdentifier = null

    this.msgCall = function () {}
    this.scoreCall = function () {}

    this.initWS()
    this.setTankValves = throttle(this._setTankValves, 200, { leading: true })
    this.setTankRadians = throttle(this._setTankRadians, 200, { leading: true })
  }

  initWS () {
    const socket = new WebSocket(`${WS_URL}?token=${this.token}`)
    socket.addEventListener('open', () => {
      console.log('socket is open')
      this.ws = socket
    })

    socket.addEventListener('message', (event) => {
      this.dealMsg(event.data)
    })
  }

  sendMsg (o) {
    if (!this.ws) {
      return
    }
    if (!o.fromId) {
      o.fromId = this.id
    }
    o.sceneId = this.gameMap.id
    this.ws.send(JSON.stringify(o))
  }

  _setTankValves (valves) {
    const str = JSON.stringify(valves)
    if (this._oldValvesStr === str) {
      return
    }
    this._oldValvesStr = str
    const { x, y } = this.player
    this.sendMsg(newOrder(ACTION.VALVES, PLAYER.ALL, { ...valves, x, y }))
  }

  _setTankRadians (radians) {
    const str = JSON.stringify(radians)
    if (this._oldRadiansStr === str) {
      return
    }
    this._oldRadiansStr = str
    const { x, y } = this.player
    this.sendMsg(newOrder(ACTION.RADIANS, PLAYER.ALL, { ...radians, x, y }))
  }

  fire () {
    const o = this.player.getBarrelBullet()
    if (!o) {
      return
    }
    this.sendMsg(newOrder(SKILL.START, PLAYER.ALL, o))
  }

  sendText (text) {
    this.sendMsg(newOrder(SYSTEM.MESSAGE, PLAYER.ALL, text))
  }

  dealMsg (msg) {
    if (!msg) {
      return
    }
    const { id, fromId, data } = JSON.parse(msg)
    const players = this.players
    const fromPlayer = players.find(o => o.id === fromId)

    switch (id) {
      case PLAYER.RECONNECT:
      case PLAYER.LOGIN: {
        // 初始化登录的玩家
        this.id = data.id
        this.userName = data.username
        const newPlayer = new Tank(this.id, this.userName)
        if (data.actionOrder) {
          const position = data.actionOrder.data
          if (position.x !== undefined) {
            newPlayer.x = position.x
            newPlayer.y = position.y
          }
          if (data.actionOrder.id === ACTION.VALVES) {
            newPlayer.setValves(data)
          }
        }
        newPlayer.obstacleCall = this.obstacleCall.bind(this)
        newPlayer.isSelf = true
        this.player = newPlayer
      }
        break
      case PLAYER.LOGOUT: {
        const ids = data || []
        ids.forEach(v => {
          for (let i = players.length - 1; i >= 0; i--) {
            players[i].id === v && players.splice(i, 1)
          }
        })
      }
        break
      case ACTION.ENTER_MAP:
        if (fromId === SYSTEM.GOD) {
          // 用户进入场景，并获取到场景中的用户列表
          this.gameMap = data.map
          this.players = [this.player]
          this.restart()
          const selfId = this.player.id
          data.players.forEach(o => {
            if (o.id !== selfId) {
              const newPlayer = new Tank(o.id, o.username)
              newPlayer.obstacleCall = this.obstacleCall.bind(this)
              if (o.actionOrder) {
                const { orderId, data } = o.actionOrder
                if (data.x !== undefined) {
                  newPlayer.x = data.x
                  newPlayer.y = data.y
                }
                if (orderId === ACTION.VALVES) {
                  newPlayer.setValves(data)
                }
              }

              this.players.push(newPlayer)
            }
          })
          data.obstacles.forEach(o => {
            const obstacle = {
              id: o.id,
              x: o.x,
              y: o.y,
              type: o.type,
              value: o.value
            }
            this.obstacles.push(obstacle)
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
          newPlayer.obstacleCall = this.obstacleCall.bind(this)
          if (data.actionOrder) {
            const position = data.actionOrder.data
            if (position.x !== undefined) {
              newPlayer.x = position.x
              newPlayer.y = position.y
            }
            if (data.actionOrder.id === ACTION.VALVES) {
              newPlayer.setValves(data)
            }
          }
          this.players.push(newPlayer)
        }
        break
      case ACTION.VALVES:
        fromPlayer.x = data.x
        fromPlayer.y = data.y
        fromPlayer.setValves(data)
        break
      case ACTION.RADIANS:
        fromPlayer.x = data.x
        fromPlayer.y = data.y
        fromPlayer.setRadians(data)
        break
      case SKILL.START:
        fromPlayer.fire(data)
        break
      case SKILL.HIT:
        this.handleHit(fromPlayer, data)
        break
      case SYSTEM.OBSTACLE:
        data.forEach(o => {
          this.obstacles.push({
            id: o.id,
            x: o.x,
            y: o.y,
            type: o.type,
            value: o.value
          })
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

  handleHit (player, data, isLocal) {
    if (!isLocal && player.id === this.player.id) {
      return
    }
    const { obstacleId, skillId } = data
    console.log('SKILL_HIT', obstacleId, skillId)
    const index = this.obstacles.findIndex(o => o.id === obstacleId)
    const obstacle = this.obstacles.splice(index, 1)[0]
    if (!obstacle) {
      console.log('empty obstacle')
      return
    }
    if (obstacle.type === 'add') {
      //
    } else if (obstacle.type === 'add-all') {
      player.addBulletMax()
    }
    player.addScore(obstacle.value)
    player.newHit(obstacle, skillId)

    this.scoreCall(this.players.map(o => {
      return {
        id: o.id,
        userName: o.userName,
        score: o.score
      }
    }).sort(function (o0, o1) {
      return o1.score - o0.score
    }))
  }

  restart () {
    // 清除上一局的动画
    window.cancelAnimationFrame(this.aniId)
    this.aniId = window.requestAnimationFrame(this.bindLoop)

    if (this.heartId) {
      clearInterval(this.heartId)
    }
    this.heartId = setInterval(() => {
      this.sendMsg(newOrder(PLAYER.HEART))
    }, 8000)
  }

  /**
   * canvas重绘函数
   * 每一帧重新绘制所有的需要展示的元素
   */
  render () {
    const ctx = this.ctx
    ctx.clearRect(-0.5, -0.5, CANVAS_WIDTH, CANVAS_HEIGHT)

    const { x: cameraX, y: cameraY } = this.player.getScreenXY()
    ctx.translate(-cameraX, -cameraY)

    ctx.fillStyle = '#ffffff'

    // 地图边框
    ctx.strokeStyle = '#00ff00'
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(this.gameMap.width, 0)
    ctx.lineTo(this.gameMap.width, this.gameMap.height)
    ctx.lineTo(0, this.gameMap.height)
    ctx.closePath()
    ctx.stroke()

    ctx.fillStyle = '#00ff00'
    this.obstacles.forEach(o => {
      ctx.beginPath()
      if (o.type === 'add-all') {
        ctx.arc(o.x, o.y, o.value, 0, Math.PI * 1.5, false)
      } else {
        ctx.arc(o.x, o.y, o.value, 0, Math.PI * 2, false)
      }
      o.type === 'show' ? ctx.stroke() : ctx.fill()
      ctx.fillText('' + o.value, o.x - 5, o.y + 5)
    })

    this.players.forEach(o => {
      o.render(ctx)
    })

    ctx.translate(cameraX, cameraY)
  }

  obstacleCall (obstacle, skill, player) {
    if (player !== this.player) {
      // 非自身用户不进行碰撞指令发送
      return
    }
    const order = newOrder(SKILL.HIT, skill.id, { obstacleId: obstacle.id, skillId: skill.id })
    order.fromId = player.id
    this.sendMsg(order)
    this.handleHit(this.player, order.data, true)
  }

  // 游戏逻辑更新主函数
  update () {
    // .sort(function (o1, o2) {
    //   return o1.x - o2.x && o1.y - o2.y
    // })
    this.players.forEach(o => {
      o.update(this.gameMap, this.obstacles, this.players)
    })
  }

  // 实现游戏帧循环
  loop () {
    this.update()
    this.render()

    this.aniId = window.requestAnimationFrame(this.bindLoop)
  }
}

import {
  WS_URL,
  PIXEL_RATIO,
  WINDOW_WIDTH,
  WINDOW_HEIGHT,
  CANVAS_WIDTH,
  CANVAS_HEIGHT
} from './const'
import { ACTION, PLAYER, SKILL, SYSTEM, newOrder } from './order'
import DirectionView from './direction-view'
import Player from './player'

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
    this.touchHandler = this.touchEventHandler.bind(this)
    canvas.addEventListener('touchstart', this.touchHandler)
    canvas.addEventListener('touchmove', this.touchHandler)
    canvas.addEventListener('touchend', this.touchHandler)

    this.players = []
    this.obstacles = []
    this.directionView = new DirectionView()
    this.touchIdentifier = null

    this.msgCall = function () {}
    this.scoreCall = function () {}

    this.initWS()
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
        const newPlayer = new Player(this.id, this.userName)
        if (data.actionOrder) {
          const position = data.actionOrder.data
          if (position.x !== undefined) {
            newPlayer.x = position.x
            newPlayer.y = position.y
          }
          if (data.actionOrder.id === ACTION.MOVING) {
            newPlayer.walk(data.direction)
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
              const newPlayer = new Player(o.id, o.username)
              newPlayer.obstacleCall = this.obstacleCall.bind(this)
              if (o.actionOrder) {
                const { orderId, data } = o.actionOrder
                if (data.x !== undefined) {
                  newPlayer.x = data.x
                  newPlayer.y = data.y
                }
                if (orderId === ACTION.MOVING) {
                  newPlayer.walk(data.direction)
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
              if (data.actionOrder.id === ACTION.MOVING) {
                fromPlayer.walk(data.direction)
              }
            }
            return
          }
          const newPlayer = new Player(data.id, data.username)
          newPlayer.obstacleCall = this.obstacleCall.bind(this)
          if (data.actionOrder) {
            const position = data.actionOrder.data
            if (position.x !== undefined) {
              newPlayer.x = position.x
              newPlayer.y = position.y
            }
            if (data.actionOrder.id === ACTION.MOVING) {
              newPlayer.walk(data.direction)
            }
          }
          this.players.push(newPlayer)
        }
        break
      case ACTION.MOVING:
        fromPlayer.x = data.x
        fromPlayer.y = data.y
        fromPlayer.walk(data.direction)
        break
      case ACTION.IDEL:
        fromPlayer.walk(-1)
        break
      case SKILL.START:
        fromPlayer.startNextSkill0(Math.max(this.gameMap.width, this.gameMap.height) * 1.5)
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
      player.addBullet(obstacle.value)
    } else if (obstacle.type === 'add-all') {
      player.addBullet(obstacle.value, 1)
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
      return o0.score - o1.score
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
   * 游戏触摸事件处理逻辑
   * @param {TouchEvent} e
   */
  touchEventHandler (e) {
    e.preventDefault()
    e.stopPropagation()
    switch (e.type) {
      case 'touchstart': {
        const touches = e.touches
        for (let i = 0; i < touches.length; i++) {
          const touch = touches[i]
          const { value } = this.directionView.testXY(touch.clientX, touch.clientY) || {}
          if (value !== undefined) {
            if (value > -2) {
              if (this.touchIdentifier === null) {
                this.touchIdentifier = touch.identifier
                if (this.preWalkValue === value) {
                  return
                }
                this.preWalkValue = value
                this.sendMsg(newOrder(ACTION.MOVING, this.player.id, { direction: value, x: this.player.x, y: this.player.y }))
              }
            } else {
              this.sendMsg(newOrder(SKILL.START))
            }
          }
        }
      }
        break
      case 'touchmove': {
        const touchIdentifier = this.touchIdentifier
        if (touchIdentifier === null) {
          return
        }
        const touches = e.touches
        for (let i = 0; i < touches.length; i++) {
          if (touchIdentifier === touches[i].identifier) {
            const touch = touches[i]
            const { value } = this.directionView.testXY(touch.clientX, touch.clientY) || {}
            if (value !== undefined && value > -2) {
              if (this.preWalkValue === value) {
                return
              }
              this.preWalkValue = value
              this.sendMsg(newOrder(ACTION.MOVING, this.player.id, { direction: value, x: this.player.x, y: this.player.y }))
            }
            break
          }
        }
      }
        break
      case 'touchend':
      case 'touchcancel':
        {
          const touches = [...e.touches] || []
          const index = touches.findIndex(o => o.identifier === this.touchIdentifier)
          if ((index === -1 || touches.length === 0) && this.touchIdentifier !== null) {
            this.touchIdentifier = null
            this.preWalkValue = null
            this.sendMsg(newOrder(ACTION.IDEL, this.player.id, { x: this.player.x, y: this.player.y }))
          }
        }
        break
      default:
        break
    }
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

    this.directionView.render(ctx)
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
    this.players.sort(function (o1, o2) {
      return o1.x - o2.x && o1.y - o2.y
    }).forEach(o => {
      o.update(this.gameMap)
      o.updateSkill(this.obstacles)
    })
  }

  // 实现游戏帧循环
  loop () {
    this.update()
    this.render()

    this.aniId = window.requestAnimationFrame(this.bindLoop)
  }
}

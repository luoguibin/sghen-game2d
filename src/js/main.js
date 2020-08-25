import {
  PIXEL_RATIO,
  WINDOW_WIDTH,
  WINDOW_HEIGHT,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  MAP
} from './const'
import { ORDER } from './order'
import DirectionView from './direction-view'
import Player from './player'

/**
 * 游戏主函数
 */
export default class Main {
  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor (canvas, { id, token, username }) {
    this.id = id
    this.token = token

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

    // 初始化登录的玩家
    this.player = new Player(id, username)

    this.players = []
    this.obstacles = []

    this.directionView = new DirectionView()
    this.touchIdentifier = null

    this.restart()

    this.initWS()
  }

  initWS () {
    const wsUrl = 'wss://www.sghen.cn/ggapi/auth/game2d?token=' + this.token
    // const wsUrl = 'ws://10.48.84.235:8282/auth/game2d?token=' + this.token

    if (this.heartTimer) {
      clearInterval(this.heartTimer)
    }

    const socket = new WebSocket(wsUrl)
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
    o.userId = this.id
    this.ws.send(JSON.stringify(o))
  }

  dealMsg (msg) {
    if (!msg) {
      return
    }
    const { id, userId, data } = JSON.parse(msg)
    const player = this.players.find(o => o.id === userId)

    switch (id) {
      case ORDER.MOVE_START:
        player.walk(data)
        break
      case ORDER.MOVE_STOP:
        player.walk(-1)
        break
      case ORDER.SKILL_BEGIN:
        player.startNextSkill0()
        break
      case ORDER.SKILL_HIT: {
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
      }
        break
      case ORDER.LOGIN:
        if (this.id === userId) {
          this.players.push(this.player)
          this.player.obstacleCall = this.obstacleCall.bind(this)
          this.heartTimer = setInterval(() => {
            this.sendMsg({ id: ORDER.HEART_BEAT })
          }, 5000)
        } else {
          const { id, username } = data
          const newPlayer = new Player(id, username)
          newPlayer.obstacleCall = this.obstacleCall.bind(this)
          this.players.push(newPlayer)
        }
        break
      case ORDER.LOGIN_RECONNECT:
        if (this.id === userId) {
          if (this.players.findIndex(o => o === this.player) === -1) {
            this.players.push(this.player)
            this.player.obstacleCall = this.obstacleCall.bind(this)
            this.heartTimer = setInterval(() => {
              this.sendMsg({ id: ORDER.HEART_BEAT })
            }, 5000)
          }
        }
        break
      default:
        break
    }
  }

  restart () {
    // 清除上一局的动画
    window.cancelAnimationFrame(this.aniId)

    this.aniId = window.requestAnimationFrame(this.bindLoop)
  }

  /**
   * 游戏触摸事件处理逻辑
   * @param {TouchEvent} e
   */
  touchEventHandler (e) {
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
                this.sendMsg({ id: ORDER.MOVE_START, data: value })
              }
            } else {
              this.sendMsg({ id: ORDER.SKILL_BEGIN })
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
              this.sendMsg({ id: ORDER.MOVE_START, data: value })
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
            this.sendMsg({ id: ORDER.MOVE_STOP })
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
    // for (let i = 0; i < 10; i++) {
    //   for (let j = 0; j < 10; j++) {
    //     ctx.fillText(`${i}-${j}`, i * MAP.WIDTH / 10, j * MAP.HEIGHT / 10 + 12)
    //   }
    // }

    // 地图边框
    ctx.strokeStyle = '#00ff00'
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(MAP.WIDTH, 0)
    ctx.lineTo(MAP.WIDTH, MAP.HEIGHT)
    ctx.lineTo(0, MAP.HEIGHT)
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
    this.sendMsg({ id: ORDER.SKILL_HIT, userId: player.id, data: { obstacleId: obstacle.id, skillId: skill.id } })
  }

  // 游戏逻辑更新主函数
  update () {
    this.players.forEach(o => {
      o.update(MAP)
      o.updateSkill(this.obstacles)
    })

    if (this.obstacles.length < 10) {
      const obstacle = {
        id: Date.now(),
        x: Math.random() * MAP.WIDTH >> 0,
        y: Math.random() * MAP.HEIGHT >> 0,
        type: Math.random() < 0.1 ? 'add' : Math.random() < 0.1 ? 'add-all' : 'show',
        value: (Math.random() * 8 >> 0) + 18
      }
      this.obstacles.push(obstacle)
    }
  }

  // 实现游戏帧循环
  loop () {
    this.update()
    this.render()

    this.aniId = window.requestAnimationFrame(this.bindLoop)
  }
}

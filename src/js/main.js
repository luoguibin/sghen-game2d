import {
  PIXEL_RATIO,
  WINDOW_WIDTH,
  WINDOW_HEIGHT,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  MAP
} from './const'
import DirectionView from './direction-view'
import Player from './player'

/**
 * 游戏主函数
 */
export default class Main {
  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor (canvas) {
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

    this.player = new Player()

    this.obstacles = []

    this.directionView = new DirectionView()
    this.touchIdentifier = null

    this.restart()

    const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1OTg4NjUyMzAsImlhdCI6MTU5ODI2MDQzMCwidUxldmVsIjoiOSIsInVzZXJJZCI6IjE2NDA1IiwidXNlck5hbWUiOiLkuYLmnKsifQ.2frLjnwf9C9tyiozPn93iq88BNLtfAKmZOGMtYMqiJQ`
    const wsUrl = 'wss://www.sghen.cn/ggapi/auth/game2d?token=' + token

    const socket = new WebSocket(wsUrl)
    socket.addEventListener('open', (event) => {
      console.log('socket is open', event)
    })

    socket.addEventListener('message', (event) => {
      console.log(event)
      this.dealMsg(event.data)
    })

    this.ws = socket
    setInterval(() => {
      this.sendMsg({ id: -1 })
    }, 5000)
  }

  sendMsg (o) {
    o.userId = 16405
    this.ws.send(JSON.stringify(o))
  }

  dealMsg (msg) {
    if (!msg) {
      return
    }
    console.log(msg, JSON.parse(msg))
    const { id, data } = JSON.parse(msg)
    switch (id) {
      case 100:
        this.player.walk(data)
        break
      case 101:
        this.player.startNextSkill0()
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
    const player = this.player
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
                this.sendMsg({ id: 100, data: value })
              }
            } else {
              this.sendMsg({ id: 101 })
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
              this.sendMsg({ id: 100, data: value })
            }
            break
          }
        }
      }
        break
      case 'touchend':
      case 'touchcancel':
        {
          const touches = e.touches || []
          if (touches.length === 0) {
            this.touchIdentifier = null
            this.preWalkValue = null
          } else {
            const index = touches.findIndex(o => o.identifier === this.touchIdentifier)
            if (index === -1) {
              this.touchIdentifier = null
              this.preWalkValue = null
            }
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

    this.player.render(ctx)

    ctx.translate(cameraX, cameraY)

    this.directionView.render(ctx)
  }

  // 游戏逻辑更新主函数
  update () {
    if (this.touchIdentifier !== null) {
      this.player.update(MAP)
    }

    this.player.updateSkill(this.obstacles)

    if (this.obstacles.length < 10) {
      const obstacle = {
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

import Phaser from 'phaser'
import { toProgress } from '../utils/format'

export default class AssetsScene extends Phaser.Scene {
  constructor () {
    super({
      key: 'assets-scene'
      // pack: {
      //   files: [
      //     { type: 'scenePlugin', key: 'SpinePlugin', url: 'plugins/SpinePlugin.js', sceneKey: 'spine' }
      //   ]
      // }
    })

    this.totalToLoad = 0
    this.totalComplete = 0
    this.totalFailed = 0

    window.assetsScene = this
  }

  preload () {
    this.load.on('start', this.onLoadStart.bind(this))
    this.load.on('filecomplete', this.onFileComplete.bind(this))
    this.load.on('complete', this.onLoadComplete.bind(this))
    this.load.on('loaderror', this.onLoadError.bind(this))

    this.startToLoad()
  }

  create () {
    const loadingText = this.add.text(this.scale.width / 2, this.scale.height / 2, '', { font: '40px arial', fill: '#ffffff' })
    loadingText.setOrigin(0.5, 0.5)
    this.loadingText = loadingText
    console.log('create')
  }

  /**
   * 开始加载资源
   */
  startToLoad () {
    this.load.setBaseURL('./')
    this.load.image('sky', require('@/images/cizhuan-00.png'))
    this.load.image('hero', require('@/images/hero.png'))
    this.load.image('enemy', require('@/images/enemy.png'))
    this.load.image('bullet', require('@/images/bullet.png'))
    this.load.image('xiangzi-00', require('@/images/xiangzi-00.png'))
    this.load.spritesheet('explosions', require('@/images/explosions.png'), {
      frameWidth: 64,
      frameHeight: 48,
      endFrame: 18
    })
    this.load.atlas('tank-00', '/images/tank-00.png', 'images/tank-00.json')
    // this.load.spine('spine-tank-00', '/images/spine-tank-00.json', '/images/spine-tank-00.atlas')
    this.load.start()
  }
  /**
   * 资源开始加载
   * @param {*} e
   */
  onLoadStart (e) {
    this.totalToLoad = e.totalToLoad
    this.totalComplete = 0
    this.totalFailed = 0
  }
  /**
   * 单个资源文件加载完成
   * @param {*} e
   */
  onFileComplete (e) {
    this.totalComplete++
    this.loadingText.setText([
      '文件数: ' + this.totalToLoad,
      '总进度: ' + toProgress(this.totalComplete, this.totalToLoad)
    ])
  }
  /**
   * 所有资源加载完成
   * @param {*} e
   */
  onLoadComplete (e) {
    if (this.totalFailed) {
      this.loadingText.setText([
        `共加载失败${this.totalFailed}个文件`,
        '加载总进度: ' + toProgress(this.totalComplete, this.totalToLoad)
      ])
      return
    }
    this.loadingText.setText('资源加载完成!')
    this.checkPlayerInfo()
  }

  /**
   * 检测游戏玩家信息是否准备好
   */
  checkPlayerInfo () {
    if (this.game.playerInfo) {
      this.loadingText.setText('加载完成，正在进入!')
      setTimeout(() => {
        this.scene.start('tank-scene')
      }, 300)
    } else {
      this.loadingText.setText('正在请求玩家数据...')
      setTimeout(() => {
        this.checkPlayerInfo()
      }, 100)
    }
  }
  /**
   * 文件加载出错
   * @param {*} e
   */
  onLoadError (e) {
    this.totalFailed++
  }
}

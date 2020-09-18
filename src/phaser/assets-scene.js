import Phaser from 'phaser'
import { toProgress } from '../utils/format'

export default class extends Phaser.Scene {
  constructor () {
    super({ key: 'assets-scene' })

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
    // this.load.setBaseURL('./')
    this.load.image('sky', require('@/images/cizhuan-00.png'))
    this.load.image('hero', require('@/images/hero.png'))
    this.load.image('enemy', require('@/images/enemy.png'))
    this.load.image('red', require('@/images/bullet.png'))
    this.load.atlas('tank-00', '/images/tank-00.png', 'images/tank-00.json')
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
    setTimeout(() => {
      this.scene.start('tank-scene')
    }, 300)
  }
  /**
   * 文件加载出错
   * @param {*} e
   */
  onLoadError (e) {
    this.totalFailed++
  }
}

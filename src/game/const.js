/**
 * 设备像素密度，窗口大小，画布大小
 */
export const PIXEL_RATIO = window.devicePixelRatio
export const WINDOW_WIDTH = window.innerWidth
export const WINDOW_HEIGHT = window.innerHeight
export const CANVAS_WIDTH = PIXEL_RATIO * WINDOW_WIDTH
export const CANVAS_HEIGHT = PIXEL_RATIO * WINDOW_HEIGHT

/**
 * socket地址
 */
export const WS_URL = process.env.NODE_ENV === 'production' ? 'wss://www.sghen.cn/ggapi/auth/game2d' : 'ws://10.48.84.235:8282/auth/game2d'

/**
 * 心跳时间间隔
 */
export const HEART_DELAY = 10000

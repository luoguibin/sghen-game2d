/**
 * 设备像素密度，窗口大小，画布大小
 */
export const PIXEL_RATIO = window.devicePixelRatio
export const WINDOW_WIDTH = window.innerWidth
export const WINDOW_HEIGHT = window.innerHeight
export const CANVAS_WIDTH = PIXEL_RATIO * WINDOW_WIDTH
export const CANVAS_HEIGHT = PIXEL_RATIO * WINDOW_HEIGHT

/**
 * 地图大小
 */
export const MAP = {
  WIDTH: WINDOW_WIDTH * 5,
  HEIGHT: WINDOW_HEIGHT * 3
}

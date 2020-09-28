/**
 * 格式化输出百分比字符串
 * @param {Number} a
 * @param {Number} b
 * @param {Number} f
 */
export const toProgress = function (a, b, f = 0) {
  return Number((a / b >> 0) * 100).toFixed(f) + '%'
}

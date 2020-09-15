export const getDistance = function (x0, y0, x1, y1) {
  return Math.sqrt(Math.pow(x0 - x1, 2) + Math.pow(y0 - y1, 2))
}

export const toDegree = function (v) {
  return ~~((v % (Math.PI * 2)) / (Math.PI * 2) * 360)
}

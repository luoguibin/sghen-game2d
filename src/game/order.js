export const ACTION = {
  MOVING: -1000,
  BARREL: -1001,
  ENTER_MAP: -1002,
  LEAVE_MAP: -1003
}

export const SKILL = {
  START: -2000,
  HIT: -2001
}

export const PLAYER = {
  LOGIN: -3000,
  RECONNECT: -3001,
  LOGOUT: -3002,
  ALL: -3003,
  HEART: -3004
}

export const SYSTEM = {
  GOD: -4000,
  OBSTACLE: -4001,
  MESSAGE: -4002
}

export const newOrder = function (id, toId, data) {
  return {
    id,
    toId,
    data
  }
}

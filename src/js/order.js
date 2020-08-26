export const ACTION = {
  MOVING: -1000,
  IDEL: -1001,
  ENTER_MAP: -1002,
  LEAVE_MAP: -1003
}

export const SKILL = {
  START: -2000,
  HIT: -2001
}

export const PLAYER = {
  LOGIN: -3000,
  LOGOUT: -3001,
  ALL: -3002,
  HEART: -3003
}

export const SYSTEM = {
  GOD: -4000,
  OBSTACLE: -4001
}

export const newOrder = function (id, toId, data) {
  return {
    id,
    toId,
    data
  }
}

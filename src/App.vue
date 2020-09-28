<template>
  <div class="app">
    <div :class="{ 'msg-box': true, 'box-hidden': !msgVisible }">
      <div v-show="msgVisible" class="flex-one">
        <div class="scroll">
          <div v-for="item in msgs" :key="item.id" class="msg-item">
            <span>{{ item.fromName }}:</span>
            {{ item.content }}
          </div>
        </div>
      </div>
      <div v-show="msgVisible" class="msg-input">
        <input class="flex-one" v-model="msgText" />
        <button @click="onSendMsg">发送</button>
      </div>
      <button class="block" @click="onToggleMsg">
        {{ msgVisible ? "收起" : "聊天" }}
      </button>
    </div>

    <div
      :class="{
        'msg-box': true,
        'box-hidden': !scoreVisible,
        'score-box': !scoreVisible,
      }"
    >
      <div v-show="scoreVisible" class="flex-one">
        <div class="scroll">
          <div v-for="item in players" :key="item.id" class="msg-item">
            <span>{{ item.userName }}:</span>
            {{ item.score }}
          </div>
        </div>
      </div>
      <button class="block" @click="onToggleScore">
        {{ scoreVisible ? "收起" : "排行榜" }}
      </button>
    </div>
  </div>
</template>

<script>
import PhaserGame from './game/index'

export default {
  name: 'App',

  data () {
    return {
      msgs: [],
      msgVisible: false,
      msgText: '',

      players: [],
      scoreVisible: false
    }
  },

  mounted () {
    window.app = this

    const temp = localStorage.getItem('sghen_user_info')
    const userInfo = JSON.parse(
      window.decodeURIComponent(window.atob(temp || '')) || '{}'
    )
    if (
      !userInfo.token ||
      !userInfo.timeLogin ||
      Date.now() / 1000 - userInfo.timeLogin > 3600 * 24 * 7
    ) {
      if (localStorage.getItem('login')) {
        alert('登录失败，请手动刷新界面')
        localStorage.removeItem('login')
        return
      }
      localStorage.setItem('login', 1)
      localStorage.removeItem('sghen_user_info')
      window.location.href =
        'https://www.sghen.cn/sghen-wap/index.html#/login?redirect=' +
        encodeURIComponent(window.location.href) +
        '&rand=' +
        Date.now()
      return
    }

    this.game = new PhaserGame(this.$el, userInfo)
    this.game.msgCall = this.msgCall.bind(this)
    this.game.scoreCall = this.scoreCall.bind(this)

    document.oncontextmenu = function () {
      return false
    }
    document.body.addEventListener(
      'touchmove',
      function (e) {
        e.preventDefault()
        e.stopPropagation()
        return false
      },
      {
        passive: false
      }
    )
  },

  methods: {
    msgCall (o) {
      this.msgs.push(o)
      if (this.msgs.length > 100) {
        this.msgs.shift()
      }
    },
    onToggleMsg () {
      this.msgVisible = !this.msgVisible
    },
    onSendMsg () {
      if (!this.msgText) {
        return
      }
      this.game.sendText(this.msgText)
      this.msgText = ''
    },

    scoreCall (players) {
      this.players = players || []
    },
    onToggleScore () {
      this.scoreVisible = !this.scoreVisible
    }
  }
}
</script>

<style>
* {
  padding: 0;
  margin: 0;
}

html,
body,
.app {
  height: 100%;
}
canvas {
  display: block;
  width: 100%;
  height: 100%;
  background-color: black;
  user-select: none;
}
.msg-box {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 50%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: rgb(255, 255, 255);
  z-index: 10;
}
.score-box {
  top: 2rem;
}
.box-hidden {
  width: 3rem;
  max-height: 2rem;
  z-index: 1;
  background-color: rgba(20, 139, 207, 0.3);
}
.box-hidden .block {
  background-color: rgba(20, 139, 207, 0.3);
  border: none;
  color: white;
}
.msg-box .flex-one {
  flex: 1;
}
.msg-box .scroll {
  height: 100%;
  padding: 0 0.3rem;
  box-sizing: border-box;
  overflow-y: auto;
}
.msg-item {
  margin-bottom: 0.3rem;
  word-break: break-all;
}
.msg-item span {
  font-weight: bold;
  padding-right: 3px;
}
.msg-input {
  display: flex;
  flex-direction: row;
  padding: 0.5rem 0.3rem;
  box-sizing: border-box;
  border-top: 1px solid black;
}
.msg-input input {
  display: inline-block;
  outline: none;
  border: none;
}
.msg-input button {
  min-width: 2rem;
  border: none;
  padding: 0 0.3rem;
}
.block {
  display: block;
  width: 100%;
  line-height: 2rem;
  text-align: center;
}

.tank-controller {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 1rem;
  width: 100%;
  height: 30%;
}
.tank-controller .wrapper {
  position: relative;
  height: 100%;
}
.tank-controller .pointer {
  display: inline-block;
  position: absolute;
  top: 0;
  width: 2rem;
  height: 2rem;
  line-height: 2rem;
  font-size: 1rem;
  background-color: white;
  border-radius: 5px;
  transform: translate(0, -50%);
  user-select: none;
  /* pointer-events: none; */
}
.tank-controller .left-valve {
  position: absolute;
  left: 10%;
  width: 2rem;
  height: 100%;
  background-color: rgba(105, 105, 105, 0.5);
  border-radius: 5px;
}
.tank-controller .fire {
  position: absolute;
  right: 20%;
  top: 50%;
  width: 2rem;
  height: 2rem;
  padding: 0.5rem;
  text-align: center;
  line-height: 2rem;
  color: white;
  transform: translate(0, -50%);
  background-color: rgba(20, 139, 207, 0.3);
  border-radius: 50%;
  user-select: none;
}
.tank-controller .fire:active {
  background-color: rgba(20, 139, 207, 1);
}
.left-valve::before,
.right-valve::before {
  content: "";
  position: absolute;
  top: 50%;
  width: 100%;
  height: 2px;
  background-color: yellow;
}
.tank-controller .right-valve {
  position: absolute;
  left: 50%;
  width: 2rem;
  height: 100%;
  background-color: rgba(105, 105, 105, 0.5);
  border-radius: 5px;
}
.tank-controller .speed-valve,
.tank-controller .barrel-radian {
  position: absolute;
  width: 2rem;
  height: 100%;
  background-color: rgba(105, 105, 105, 0.5);
  border-radius: 5px;
}
.tank-controller .speed-valve {
  left: 30%;
}
.tank-controller .barrel-radian {
  right: 10%;
}
</style>

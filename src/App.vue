<template>
  <div class="app">
    <canvas ref="canvas"></canvas>

    <div :class="{'msg-box': true, 'box-hidden': !msgVisible }">
      <div v-show="msgVisible" class="flex-one">
        <div class="scroll">
          <div v-for="item in msgs" :key="item.id" class="msg-item"><span>{{item.fromName}}:</span>{{item.content}}</div>
        </div>
      </div>
      <div v-show="msgVisible" class="msg-input">
        <input class="flex-one" v-model="msgText" />
        <button @click="onSendMsg">发送</button>
      </div>
      <button class="block" @click="onToggleMsg">{{msgVisible ? '收起' : '聊天'}}</button>
    </div>

    <div :class="{'msg-box': true, 'box-hidden': !scoreVisible, 'score-box': !scoreVisible }">
      <div v-show="scoreVisible" class="flex-one">
        <div class="scroll">
          <div v-for="item in players" :key="item.id" class="msg-item"><span>{{item.userName}}:</span>{{item.score}}</div>
        </div>
      </div>
      <button class="block" @click="onToggleScore">{{scoreVisible ? '收起' : '排行榜'}}</button>
    </div>
  </div>
</template>

<script>
import GameMain from './js/main'

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
    const temp = localStorage.getItem('sghen_user_info') || 'JTdCJTIyaWQlMjIlM0ExNjQwNSUyQyUyMmFjY291bnQlMjIlM0ElMjJvbjNULTQzaVliNy15ZlB6cTdZVzJMOGVJbVdvJTIyJTJDJTIycGhvbmUlMjIlM0ElMjIxNTYyNTA0NTk4NCUyMiUyQyUyMnRva2VuJTIyJTNBJTIyZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmxlSEFpT2pFMk1EQTBNREF6TnpRc0ltbGhkQ0k2TVRVNU9UYzVOVFUzTkN3aWRVeGxkbVZzSWpvaU9TSXNJblZ6WlhKSlpDSTZJakUyTkRBMUlpd2lkWE5sY2s1aGJXVWlPaUxrdVlMbW5Lc2lmUS4xd0dwZnV6eGhkT3NnT0NsaFU2ODFGbl9mUW54MFZxXy1xTURZcEZGMVU4JTIyJTJDJTIydXNlcm5hbWUlMjIlM0ElMjIlRTQlQjklODIlRTYlOUMlQUIlMjIlMkMlMjJhdmF0YXIlMjIlM0ElMjIuJTJGZmlsZSUyRnVzZXIlMkZpY29uJTJGZWUwZjc5NWViNmRjMGI0NmQ5MTI1MzJhZTE4NzZhZGYucG5nJTIyJTJDJTIybW9vZCUyMiUzQSUyMiVFNSU5NiU4MiVFNSU5NiU4MiVFNSU5NiU4MiUyMiUyQyUyMnRpbWVDcmVhdGUlMjIlM0ElMjIyMDE5LTA5LTE5VDIyJTNBMzElM0EzOSUyQjA4JTNBMDAlMjIlMkMlMjJ0aW1lVXBkYXRlJTIyJTNBJTIyMjAyMC0wNy0xMVQxOSUzQTI0JTNBMTUlMkIwOCUzQTAwJTIyJTJDJTIyZXhwaXJlRHVyYXRpb24lMjIlM0E2MDQ4MDAlMkMlMjJ0aW1lTG9naW4lMjIlM0ExNTk5Nzk1NTcwLjAxJTdE'
    const userInfo = JSON.parse(window.decodeURIComponent(window.atob(temp)) || '{}')
    console.log(userInfo)
    if (!userInfo || !userInfo.token || !userInfo.timeLogin || (Date.now() / 1000 - userInfo.timeLogin > 3600 * 24 * 7)) {
      if (localStorage.getItem('login')) {
        alert('登录失败，请手动刷新界面')
        localStorage.removeItem('login')
        return
      }
      localStorage.setItem('login', 1)
      localStorage.removeItem('sghen_user_info')
      window.location.href =
          'https://www.sghen.cn/sghen-wap/index.html#/login?redirect=' +
          encodeURIComponent(window.location.href) + '&rand=' + Date.now()
      return
    }

    this.gameMain = new GameMain(this.$refs.canvas, userInfo)
    this.gameMain.msgCall = this.msgCall.bind(this)
    this.gameMain.scoreCall = this.scoreCall.bind(this)

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
      this.gameMain.sendText(this.msgText)
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
}
.score-box {
  top: 2rem;
}
.box-hidden {
  width: 100px;
  max-height: 2rem;
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
  min-width: 1rem;
  border: none;
  padding: 0 0.3rem;
}
.block {
  display: block;
  width: 100%;
  line-height: 2rem;
  text-align: center;
}
</style>

<template>
  <div class="app">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script>
import GameMain from './js/main'

export default {
  name: 'App',

  data () {
    return {}
  },

  mounted () {
    window.app = this
    if (process.env.NODE_ENV === 'production') {
      const temp = localStorage.getItem('sghen_user_info') || '{}'
      const userInfo = JSON.parse(window.decodeURIComponent(window.atob(temp)))
      if (!userInfo || !userInfo.token) {
        if (localStorage.getItem('login')) {
          alert('登录失败，请手动刷新界面')
          localStorage.removeItem('login')
          return
        }
        localStorage.setItem('login', 1)
        window.location.href =
          'https://www.sghen.cn/sghen-wap/index.html#/login?redirect=' +
          encodeURIComponent(window.location.href)
        return
      }
      this.gameMain = new GameMain(this.$refs.canvas, userInfo)
    } else {
      // online token
      // const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1OTg4NjUyMzAsImlhdCI6MTU5ODI2MDQzMCwidUxldmVsIjoiOSIsInVzZXJJZCI6IjE2NDA1IiwidXNlck5hbWUiOiLkuYLmnKsifQ.2frLjnwf9C9tyiozPn93iq88BNLtfAKmZOGMtYMqiJQ`
      // test token
      const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1OTg5MjE4NTEsImlhdCI6MTU5ODMxNzA1MSwidXNlcklkIjoxNjQwNSwidXNlck5hbWUiOiJ5aW1vIiwidUxldmVsIjo5fQ.TlMP_RfayUfDXyX037sKeg7UsKn5uc5FxSD4ZdZyM3Y`
      this.gameMain = new GameMain(this.$refs.canvas, {
        id: 16405,
        username: 'GM',
        token
      })
    }

    document.oncontextmenu = function () {
      return false
    }
    document.body.addEventListener(
      'touchmove',
      function (e) {
        e.preventDefault()
        return false
      },
      {
        passive: false
      }
    )
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
</style>

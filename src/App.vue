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
    const temp = localStorage.getItem('sghen_user_info') || 'e30=' // btoa('{}') => 'e30='
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

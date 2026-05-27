import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './styles/global.css'

// 全局错误捕获
window.addEventListener('error', (e) => {
  const el = document.getElementById('app')
  if (el) {
    el.innerHTML = `<div style="padding:40px;color:#ff4757;font-family:monospace;white-space:pre-wrap;">
      <h2>应用错误</h2>
      <p>${e.message}</p>
      <p style="color:#aaa;font-size:12px;">${e.filename}:${e.lineno}:${e.colno}</p>
    </div>`
  }
})

window.addEventListener('unhandledrejection', (e) => {
  const el = document.getElementById('app')
  if (el) {
    el.innerHTML = `<div style="padding:40px;color:#ff4757;font-family:monospace;white-space:pre-wrap;">
      <h2>应用错误</h2>
      <p>${e.reason?.message || String(e.reason)}</p>
      <p style="color:#aaa;font-size:12px;">${e.reason?.stack || ''}</p>
    </div>`
  }
})

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')

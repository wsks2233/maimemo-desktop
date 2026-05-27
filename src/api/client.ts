import axios from 'axios'

const API_BASE = 'https://open.maimemo.com/open/api/v1'

const token = import.meta.env.VITE_MAIMEMO_API_TOKEN

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
})

// 频控队列：10s 20次, 60s 40次, 5h 2000次
const requestTimestamps: number[] = []

function canRequest(): boolean {
  const now = Date.now()
  // 清理过期记录
  while (requestTimestamps.length > 0 && requestTimestamps[0] < now - 10_000) {
    requestTimestamps.shift()
  }
  // 10秒内不超过20次
  return requestTimestamps.length < 20
}

client.interceptors.request.use(async (config) => {
  while (!canRequest()) {
    await new Promise(r => setTimeout(r, 500))
  }
  requestTimestamps.push(Date.now())
  return config
})

export default client

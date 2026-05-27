import { fetch as tauriFetch } from '@tauri-apps/plugin-http'

const API_BASE = 'https://open.maimemo.com/open/api/v1'
const token = import.meta.env.VITE_MAIMEMO_API_TOKEN

// 频控队列：10s 20次, 60s 40次, 5h 2000次
const requestTimestamps: number[] = []

function canRequest(): boolean {
  const now = Date.now()
  while (requestTimestamps.length > 0 && requestTimestamps[0] < now - 10_000) {
    requestTimestamps.shift()
  }
  return requestTimestamps.length < 20
}

async function waitSlot() {
  while (!canRequest()) {
    await new Promise(r => setTimeout(r, 500))
  }
  requestTimestamps.push(Date.now())
}

interface ApiResponse<T = any> {
  data: T
  status: number
  ok: boolean
}

async function request<T = any>(
  method: 'GET' | 'POST' | 'DELETE',
  path: string,
  body?: Record<string, unknown>,
  params?: Record<string, unknown>
): Promise<ApiResponse<T>> {
  await waitSlot()

  let url = `${API_BASE}${path}`
  if (params) {
    const searchParams = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, String(v)))
      } else {
        searchParams.set(key, String(value))
      }
    }
    const qs = searchParams.toString()
    if (qs) url += `?${qs}`
  }

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`,
  }

  const options: RequestInit = { method, headers }

  if (body && (method === 'POST' || method === 'DELETE')) {
    headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(body)
  }

  const resp = await tauriFetch(url, options)
  const text = await resp.text()
  let data: T
  try {
    data = JSON.parse(text)
  } catch {
    data = text as unknown as T
  }

  return { data, status: resp.status, ok: resp.ok }
}

const client = {
  get: <T = any>(path: string, config?: { params?: Record<string, unknown> }) =>
    request<T>('GET', path, undefined, config?.params),

  post: <T = any>(path: string, body?: Record<string, unknown>) =>
    request<T>('POST', path, body),

  delete: <T = any>(path: string) =>
    request<T>('DELETE', path),
}

export default client

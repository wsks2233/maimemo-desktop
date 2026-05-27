<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStudyStore } from '../stores/study'
import client from '../api/client'

const router = useRouter()
const store = useStudyStore()
const showDebug = ref(false)
const debugInfo = ref('')

onMounted(async () => {
  await Promise.all([store.fetchProgress(), store.fetchTodayItems()])
})

async function fetchDebug() {
  try {
    const [progressRes, itemsRes, recordsRes] = await Promise.all([
      client.post('/study/get_study_progress'),
      client.post('/study/get_today_items', {}),
      client.post('/study/query_study_records', { limit: 5 }),
    ])
    debugInfo.value = JSON.stringify({
      progress: progressRes.data,
      todayItems: itemsRes.data,
      records: recordsRes.data,
    }, null, 2)
    showDebug.value = true
  } catch (e: any) {
    debugInfo.value = `Error: ${e.message}\n${JSON.stringify(e.response?.data, null, 2)}`
    showDebug.value = true
  }
}

const progressPercent = computed(() => {
  if (!store.progress || store.progress.total === 0) return 0
  return Math.round((store.progress.finished / store.progress.total) * 100)
})

const studyTimeFormatted = computed(() => {
  if (!store.progress) return '0 分钟'
  const minutes = Math.floor(store.progress.study_time / 60000)
  if (minutes < 60) return `${minutes} 分钟`
  const hours = Math.floor(minutes / 60)
  const remainMin = minutes % 60
  return `${hours} 小时 ${remainMin} 分钟`
})
</script>

<template>
  <div class="dashboard">
    <h1 class="page-title">今日概览</h1>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">📝</div>
        <div class="stat-info">
          <div class="stat-value">{{ store.progress?.finished || 0 }} / {{ store.progress?.total || 0 }}</div>
          <div class="stat-label">今日进度</div>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">⏱️</div>
        <div class="stat-info">
          <div class="stat-value">{{ studyTimeFormatted }}</div>
          <div class="stat-label">学习时长</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">🆕</div>
        <div class="stat-info">
          <div class="stat-value">{{ store.newWordCount }}</div>
          <div class="stat-label">新词数量</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">📋</div>
        <div class="stat-info">
          <div class="stat-value">{{ store.unfinishedItems.length }}</div>
          <div class="stat-label">待复习</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-header">
        <h2>今日单词</h2>
        <button
          v-if="store.todayItems.length > 0"
          class="btn-primary"
          @click="router.push('/review')"
        >
          开始睡前回顾
        </button>
      </div>

      <div v-if="store.loading" class="loading">加载中...</div>

      <div v-else-if="store.todayItems.length === 0" class="empty">
        <p>今日暂无学习单词</p>
        <p class="empty-hint">请先在手机上打开墨墨 App 并开启自动同步</p>
        <button class="btn-debug" @click="fetchDebug">查看 API 原始返回</button>
      </div>

      <!-- 调试面板 -->
      <div v-if="showDebug" class="debug-panel">
        <div class="debug-header">
          <span>API 原始返回数据</span>
          <button class="btn-close" @click="showDebug = false">×</button>
        </div>
        <pre class="debug-content">{{ debugInfo }}</pre>
      </div>

      <div v-else class="word-list">
        <div
          v-for="item in store.todayItems"
          :key="item.voc_id"
          class="word-item"
          :class="{ finished: item.is_finished, new: item.is_new }"
          @click="router.push(`/word/${item.voc_spelling}`)"
        >
          <span class="word-spelling">{{ item.voc_spelling }}</span>
          <div class="word-badges">
            <span v-if="item.is_new" class="badge badge-new">新词</span>
            <span v-if="item.is_finished" class="badge badge-done">已完成</span>
            <span v-else class="badge badge-pending">待学习</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  max-width: 900px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-icon {
  font-size: 28px;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
}

.stat-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.progress-bar {
  height: 4px;
  background: var(--border);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 2px;
  transition: width 0.5s ease;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h2 {
  font-size: 18px;
}

.btn-primary {
  background: var(--accent);
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: var(--accent-hover);
}

.loading, .empty {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
}

.word-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 8px;
}

.word-item {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;
}

.word-item:hover {
  border-color: var(--accent);
  transform: translateY(-1px);
}

.word-item.finished {
  opacity: 0.6;
}

.word-spelling {
  font-weight: 600;
  font-size: 15px;
}

.word-badges {
  display: flex;
  gap: 6px;
}

.badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
}

.badge-new {
  background: var(--warning);
  color: #000;
}

.badge-done {
  background: var(--success);
  color: #000;
}

.badge-pending {
  background: var(--glass);
  color: var(--text-secondary);
}

.empty-hint {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 8px;
}

.btn-debug {
  margin-top: 16px;
  background: var(--glass);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  padding: 6px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
}

.btn-debug:hover {
  border-color: var(--accent);
  color: var(--text-primary);
}

.debug-panel {
  margin-top: 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}

.debug-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  font-size: 13px;
  font-weight: 600;
}

.btn-close {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 18px;
  cursor: pointer;
}

.debug-content {
  padding: 16px;
  font-size: 12px;
  font-family: 'Consolas', 'Monaco', monospace;
  color: var(--text-secondary);
  max-height: 300px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>

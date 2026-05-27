<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { getTodayItems } from '../api/study'
import { getVocabulary } from '../api/vocabulary'
import { listInterpretations } from '../api/interpretation'
import type { StudyTodayItem, Interpretation } from '../types'

const items = ref<StudyTodayItem[]>([])
const currentIndex = ref(0)
const expanded = ref(false)
const interpretations = ref<Interpretation[]>([])
const loading = ref(false)
const paused = ref(false)

// 轮播间隔（秒）
const interval = ref(30)
let timer: ReturnType<typeof setInterval> | null = null

const currentItem = computed(() => items.value[currentIndex.value])

onMounted(async () => {
  await fetchWords()
  startTimer()
})

onUnmounted(() => {
  stopTimer()
})

async function fetchWords() {
  loading.value = true
  try {
    items.value = await getTodayItems({ is_finished: false, limit: 50 })
  } catch (e) {
    console.error('获取今日单词失败:', e)
  } finally {
    loading.value = false
  }
}

async function loadInterpretations() {
  if (!currentItem.value) return
  try {
    const voc = await getVocabulary(currentItem.value.voc_spelling)
    if (voc) {
      interpretations.value = await listInterpretations(voc.id)
    }
  } catch (e) {
    interpretations.value = []
  }
}

function startTimer() {
  stopTimer()
  timer = setInterval(() => {
    if (!paused.value && items.value.length > 0) {
      nextWord()
    }
  }, interval.value * 1000)
}

function stopTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function nextWord() {
  if (items.value.length === 0) return
  currentIndex.value = (currentIndex.value + 1) % items.value.length
  expanded.value = false
  interpretations.value = []
}

function prevWord() {
  if (items.value.length === 0) return
  currentIndex.value = currentIndex.value === 0 ? items.value.length - 1 : currentIndex.value - 1
  expanded.value = false
  interpretations.value = []
}

async function toggleExpand() {
  expanded.value = !expanded.value
  if (expanded.value && interpretations.value.length === 0) {
    await loadInterpretations()
  }
}

function togglePause() {
  paused.value = !paused.value
}
</script>

<template>
  <div class="mini-widget">
    <div class="widget-header">
      <span class="widget-title">📖 Maimemo</span>
      <div class="widget-controls">
        <button class="ctrl-btn" @click="togglePause" :title="paused ? '继续' : '暂停'">
          {{ paused ? '▶' : '⏸' }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="widget-loading">加载中...</div>

    <div v-else-if="items.length === 0" class="widget-empty">
      今日无待复习单词
    </div>

    <div v-else class="widget-body" @click="toggleExpand">
      <div class="word-display">
        <span class="word-text">{{ currentItem?.voc_spelling }}</span>
      </div>

      <div v-if="expanded" class="word-expanded">
        <div v-if="interpretations.length > 0" class="interp-list">
          <div v-for="interp in interpretations" :key="interp.id" class="interp-item">
            {{ interp.interpretation }}
          </div>
        </div>
        <div v-else class="no-interp">暂无释义</div>
      </div>

      <div class="widget-footer">
        <button class="nav-btn" @click.stop="prevWord">‹</button>
        <span class="progress-text">{{ currentIndex + 1 }} / {{ items.length }}</span>
        <button class="nav-btn" @click.stop="nextWord">›</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mini-widget {
  width: 280px;
  background: rgba(26, 26, 46, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  user-select: none;
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  border-bottom: 1px solid var(--border);
  cursor: move;
}

.widget-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
}

.widget-controls {
  display: flex;
  gap: 4px;
}

.ctrl-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 14px;
  padding: 2px 6px;
  border-radius: 4px;
}

.ctrl-btn:hover {
  background: var(--glass);
  color: var(--text-primary);
}

.widget-loading, .widget-empty {
  padding: 24px;
  text-align: center;
  font-size: 13px;
  color: var(--text-secondary);
}

.widget-body {
  padding: 16px;
  cursor: pointer;
}

.word-display {
  text-align: center;
  margin-bottom: 12px;
}

.word-text {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 1px;
}

.word-expanded {
  padding: 12px;
  background: var(--glass);
  border-radius: 8px;
  margin-bottom: 12px;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

.interp-item {
  font-size: 13px;
  color: var(--text-secondary);
  padding: 4px 0;
}

.no-interp {
  font-size: 12px;
  color: var(--text-secondary);
  text-align: center;
}

.widget-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
}

.nav-btn {
  background: var(--glass);
  border: 1px solid var(--border);
  color: var(--text-primary);
  width: 28px;
  height: 28px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-btn:hover {
  background: var(--accent);
  border-color: var(--accent);
}

.progress-text {
  font-size: 12px;
  color: var(--text-secondary);
}
</style>

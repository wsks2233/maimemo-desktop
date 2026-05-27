<script setup lang="ts">
import { onMounted, computed, ref, onUnmounted } from 'vue'
import { useStudyStore } from '../stores/study'
import { useReviewStore } from '../stores/review'
import type { StudyTodayItem } from '../types'

const studyStore = useStudyStore()
const reviewStore = useReviewStore()

const previewIndex = ref(0)
const previewTimer = ref<ReturnType<typeof setInterval> | null>(null)
const showAnswer = ref(false)

onMounted(async () => {
  await studyStore.fetchTodayItems()
})

onUnmounted(() => {
  stopPreview()
})

const currentItem = computed(() => {
  if (reviewStore.phase === 'preview') {
    return studyStore.todayItems[previewIndex.value]
  }
  return reviewStore.currentItems[reviewStore.currentIndex]
})

const phaseLabel = computed(() => {
  switch (reviewStore.phase) {
    case 'preview': return '速览 - 快速过一遍今日单词'
    case 'test': return '自测 - 回忆中文意思'
    case 'reinforce': return '重点强化 - 薄弱词汇巩固'
    case 'summary': return '今日回顾完成'
    default: return ''
  }
})

function startReviewProcess() {
  const items = studyStore.todayItems
  if (items.length === 0) return
  reviewStore.startReview(items)
  startPreview()
}

function startPreview() {
  previewIndex.value = 0
  showAnswer.value = false
  previewTimer.value = setInterval(() => {
    if (previewIndex.value < studyStore.todayItems.length - 1) {
      previewIndex.value++
    } else {
      stopPreview()
      reviewStore.phase = 'test'
      showAnswer.value = false
    }
  }, 2000)
}

function stopPreview() {
  if (previewTimer.value) {
    clearInterval(previewTimer.value)
    previewTimer.value = null
  }
}

function skipPreview() {
  stopPreview()
  reviewStore.phase = 'test'
  showAnswer.value = false
}

function rateAndNext(rating: 'know' | 'vague' | 'forget') {
  if (!currentItem.value) return
  reviewStore.rateWord(currentItem.value.voc_id, rating)
  showAnswer.value = false

  if (reviewStore.currentIndex < reviewStore.currentItems.length - 1) {
    reviewStore.nextWord()
  } else {
    if (reviewStore.phase === 'test') {
      reviewStore.goToReinforce()
    } else {
      reviewStore.finishReview()
    }
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (reviewStore.phase === 'test' || reviewStore.phase === 'reinforce') {
    if (e.code === 'Space' || e.code === 'Enter') {
      e.preventDefault()
      showAnswer.value = !showAnswer.value
    } else if (showAnswer.value) {
      if (e.code === 'Digit1' || e.code === 'KeyK') rateAndNext('know')
      else if (e.code === 'Digit2' || e.code === 'KeyV') rateAndNext('vague')
      else if (e.code === 'Digit3' || e.code === 'KeyF') rateAndNext('forget')
    }
  }
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <div class="review">
    <h1 class="page-title">🌙 睡前回顾</h1>

    <!-- 未开始 -->
    <div v-if="reviewStore.phase === 'idle'" class="start-screen">
      <div class="start-card">
        <div class="start-icon">🌙</div>
        <h2>今日单词睡前回顾</h2>
        <p class="start-desc">
          共 {{ studyStore.todayItems.length }} 个单词需要回顾
        </p>
        <button
          class="btn-large"
          :disabled="studyStore.todayItems.length === 0"
          @click="startReviewProcess"
        >
          开始回顾
        </button>
      </div>
    </div>

    <!-- 进行中 -->
    <div v-else-if="reviewStore.phase !== 'summary'" class="review-area">
      <div class="phase-label">{{ phaseLabel }}</div>

      <!-- 速览阶段 -->
      <div v-if="reviewStore.phase === 'preview'" class="preview-card">
        <div class="preview-word">{{ currentItem?.voc_spelling }}</div>
        <div class="preview-progress">
          {{ previewIndex + 1 }} / {{ studyStore.todayItems.length }}
        </div>
        <div class="preview-bar">
          <div
            class="preview-fill"
            :style="{ width: ((previewIndex + 1) / studyStore.todayItems.length * 100) + '%' }"
          ></div>
        </div>
        <button class="btn-skip" @click="skipPreview">跳过速览</button>
      </div>

      <!-- 自测/强化阶段 -->
      <div v-else class="test-card">
        <div class="test-word">{{ currentItem?.voc_spelling }}</div>

        <div v-if="showAnswer" class="test-answer">
          <p>你记住了吗？</p>
        </div>
        <div v-else class="test-hint">
          <p>点击空格查看释义</p>
        </div>

        <div v-if="showAnswer" class="rating-buttons">
          <button class="btn-know" @click="rateAndNext('know')">
            <span class="key-hint">1</span> 认识
          </button>
          <button class="btn-vague" @click="rateAndNext('vague')">
            <span class="key-hint">2</span> 模糊
          </button>
          <button class="btn-forget" @click="rateAndNext('forget')">
            <span class="key-hint">3</span> 忘记
          </button>
        </div>

        <div class="test-progress">
          {{ reviewStore.currentIndex + 1 }} / {{ reviewStore.currentItems.length }}
          <span v-if="reviewStore.currentRound > 1"> (第 {{ reviewStore.currentRound }} 轮)</span>
        </div>
      </div>
    </div>

    <!-- 总结 -->
    <div v-else class="summary">
      <div class="summary-card">
        <div class="summary-icon">🎉</div>
        <h2>今日回顾完成！</h2>

        <div class="summary-stats">
          <div class="summary-stat">
            <div class="summary-stat-value">{{ reviewStore.todayStats.total }}</div>
            <div class="summary-stat-label">回顾单词</div>
          </div>
          <div class="summary-stat">
            <div class="summary-stat-value know">{{ reviewStore.todayStats.know }}</div>
            <div class="summary-stat-label">认识</div>
          </div>
          <div class="summary-stat">
            <div class="summary-stat-value vague">{{ reviewStore.todayStats.vague }}</div>
            <div class="summary-stat-label">模糊</div>
          </div>
          <div class="summary-stat">
            <div class="summary-stat-value forget">{{ reviewStore.todayStats.forget }}</div>
            <div class="summary-stat-label">忘记</div>
          </div>
        </div>

        <div class="summary-rate">
          掌握率：<strong>{{ reviewStore.todayStats.rate }}%</strong>
        </div>

        <button class="btn-large" @click="reviewStore.reset()">
          返回
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.review {
  max-width: 700px;
  margin: 0 auto;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 32px;
  text-align: center;
}

.start-screen {
  display: flex;
  justify-content: center;
  padding-top: 60px;
}

.start-card {
  text-align: center;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 48px;
}

.start-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.start-card h2 {
  font-size: 22px;
  margin-bottom: 12px;
}

.start-desc {
  color: var(--text-secondary);
  margin-bottom: 32px;
}

.btn-large {
  background: var(--accent);
  color: white;
  border: none;
  padding: 14px 48px;
  border-radius: 12px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-large:hover {
  background: var(--accent-hover);
}

.btn-large:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.review-area {
  text-align: center;
}

.phase-label {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.preview-card, .test-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 48px;
}

.preview-word, .test-word {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 24px;
  letter-spacing: 2px;
}

.preview-progress, .test-progress {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.preview-bar {
  height: 4px;
  background: var(--border);
  border-radius: 2px;
  margin-bottom: 24px;
}

.preview-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 2px;
  transition: width 0.5s ease;
}

.btn-skip {
  background: var(--glass);
  color: var(--text-secondary);
  border: 1px solid var(--border);
  padding: 8px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
}

.test-hint, .test-answer {
  margin-bottom: 32px;
  color: var(--text-secondary);
}

.rating-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;
}

.rating-buttons button {
  padding: 12px 32px;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: transform 0.1s;
}

.rating-buttons button:active {
  transform: scale(0.95);
}

.btn-know {
  background: var(--success);
  color: #000;
}

.btn-vague {
  background: var(--warning);
  color: #000;
}

.btn-forget {
  background: var(--danger);
  color: white;
}

.key-hint {
  font-size: 11px;
  opacity: 0.7;
  background: rgba(0,0,0,0.15);
  padding: 1px 6px;
  border-radius: 4px;
}

.summary {
  display: flex;
  justify-content: center;
  padding-top: 40px;
}

.summary-card {
  text-align: center;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 48px;
  min-width: 400px;
}

.summary-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.summary-card h2 {
  font-size: 22px;
  margin-bottom: 32px;
}

.summary-stats {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-bottom: 24px;
}

.summary-stat-value {
  font-size: 32px;
  font-weight: 700;
}

.summary-stat-value.know { color: var(--success); }
.summary-stat-value.vague { color: var(--warning); }
.summary-stat-value.forget { color: var(--danger); }

.summary-stat-label {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.summary-rate {
  font-size: 18px;
  margin-bottom: 32px;
  color: var(--text-secondary);
}

.summary-rate strong {
  color: var(--accent);
  font-size: 24px;
}
</style>

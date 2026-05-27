<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useStudyStore } from '../stores/study'
import { useReviewStore } from '../stores/review'

const studyStore = useStudyStore()
const reviewStore = useReviewStore()

onMounted(async () => {
  await studyStore.fetchRecords({ limit: 100 })
})

function getRecentDates(days: number) {
  const dates = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    dates.push(d.toISOString().split('T')[0])
  }
  return dates
}

const recentDates = getRecentDates(7)

function getRecordsForDate(date: string) {
  return studyStore.records.filter(r => {
    if (!r.last_study_date) return false
    return r.last_study_date.startsWith(date)
  })
}
</script>

<template>
  <div class="stats">
    <h1 class="page-title">📈 学习统计</h1>

    <div class="stats-overview">
      <div class="stat-box">
        <div class="stat-number">{{ studyStore.records.length }}</div>
        <div class="stat-desc">总规划单词</div>
      </div>
      <div class="stat-box">
        <div class="stat-number">{{ reviewStore.todayStats.total }}</div>
        <div class="stat-desc">今日回顾</div>
      </div>
      <div class="stat-box">
        <div class="stat-number">{{ reviewStore.todayStats.rate }}%</div>
        <div class="stat-desc">今日掌握率</div>
      </div>
    </div>

    <section class="section">
      <h2>近 7 日学习概况</h2>
      <div class="chart-area">
        <div class="bar-chart">
          <div v-for="date in recentDates" :key="date" class="bar-group">
            <div class="bar-wrapper">
              <div
                class="bar"
                :style="{ height: Math.max(getRecordsForDate(date).length * 4, 4) + 'px' }"
              ></div>
            </div>
            <div class="bar-label">{{ date.slice(5) }}</div>
            <div class="bar-count">{{ getRecordsForDate(date).length }}</div>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <h2>回顾记录</h2>
      <div v-if="reviewStore.todayRecords.length === 0" class="empty">
        今日暂无回顾记录
      </div>
      <div v-else class="record-list">
        <div v-for="record in reviewStore.todayRecords" :key="record.timestamp" class="record-item">
          <span class="record-word">{{ record.spelling }}</span>
          <span
            class="record-rating"
            :class="record.self_rating"
          >
            {{ record.self_rating === 'know' ? '认识' : record.self_rating === 'vague' ? '模糊' : '忘记' }}
          </span>
          <span class="record-round">第 {{ record.review_round }} 轮</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { useStudyStore } from '../stores/study'
import { useReviewStore } from '../stores/review'
import { computed } from 'vue'
</script>

<style scoped>
.stats {
  max-width: 900px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 24px;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.stat-box {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  text-align: center;
}

.stat-number {
  font-size: 36px;
  font-weight: 700;
  color: var(--accent);
}

.stat-desc {
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: 8px;
}

.section {
  margin-bottom: 32px;
}

.section h2 {
  font-size: 18px;
  margin-bottom: 16px;
}

.chart-area {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
}

.bar-chart {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 200px;
}

.bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.bar-wrapper {
  height: 160px;
  display: flex;
  align-items: flex-end;
}

.bar {
  width: 36px;
  background: var(--accent);
  border-radius: 4px 4px 0 0;
  min-height: 4px;
  transition: height 0.3s ease;
}

.bar-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.bar-count {
  font-size: 12px;
  font-weight: 600;
}

.empty {
  text-align: center;
  padding: 24px;
  color: var(--text-secondary);
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.record-item {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.record-word {
  font-weight: 600;
  min-width: 120px;
}

.record-rating {
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 13px;
}

.record-rating.know {
  background: var(--success);
  color: #000;
}

.record-rating.vague {
  background: var(--warning);
  color: #000;
}

.record-rating.forget {
  background: var(--danger);
  color: white;
}

.record-round {
  font-size: 12px;
  color: var(--text-secondary);
  margin-left: auto;
}
</style>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getVocabulary } from '../api/vocabulary'
import { listInterpretations } from '../api/interpretation'
import { listNotes } from '../api/note'
import { listPhrases } from '../api/phrase'
import type { Vocabulary, Interpretation, Note, Phrase } from '../types'

const route = useRoute()
const spelling = computed(() => route.params.spelling as string)

const voc = ref<Vocabulary | null>(null)
const interpretations = ref<Interpretation[]>([])
const notes = ref<Note[]>([])
const phrases = ref<Phrase[]>([])
const loading = ref(false)

async function fetchWordData() {
  loading.value = true
  try {
    voc.value = await getVocabulary(spelling.value)
    if (voc.value) {
      const [ints, nts, phs] = await Promise.all([
        listInterpretations(voc.value.id),
        listNotes(voc.value.id),
        listPhrases(voc.value.id),
      ])
      interpretations.value = ints
      notes.value = nts
      phrases.value = phs
    }
  } catch (e) {
    console.error('获取单词详情失败:', e)
  } finally {
    loading.value = false
  }
}

onMounted(fetchWordData)
watch(spelling, fetchWordData)
</script>

<script lang="ts">
import { computed } from 'vue'
</script>

<template>
  <div class="word-detail">
    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="!voc" class="empty">未找到单词</div>

    <div v-else>
      <div class="word-header">
        <h1 class="word-spelling">{{ voc.spelling }}</h1>
      </div>

      <!-- 释义 -->
      <section class="section">
        <h2 class="section-title">📖 释义</h2>
        <div v-if="interpretations.length === 0" class="empty-section">暂无自定义释义</div>
        <div v-else class="card-list">
          <div v-for="interp in interpretations" :key="interp.id" class="card">
            <div class="card-content">{{ interp.interpretation }}</div>
            <div class="card-tags">
              <span v-for="tag in interp.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 助记 -->
      <section class="section">
        <h2 class="section-title">💡 助记</h2>
        <div v-if="notes.length === 0" class="empty-section">暂无助记</div>
        <div v-else class="card-list">
          <div v-for="note in notes" :key="note.id" class="card">
            <div class="card-type">{{ note.note_type }}</div>
            <div class="card-content">{{ note.note }}</div>
          </div>
        </div>
      </section>

      <!-- 例句 -->
      <section class="section">
        <h2 class="section-title">📝 例句</h2>
        <div v-if="phrases.length === 0" class="empty-section">暂无例句</div>
        <div v-else class="card-list">
          <div v-for="phrase in phrases" :key="phrase.id" class="card">
            <div class="card-en">{{ phrase.phrase }}</div>
            <div class="card-content">{{ phrase.interpretation }}</div>
            <div class="card-origin">来源：{{ phrase.origin }}</div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.word-detail {
  max-width: 700px;
}

.word-header {
  margin-bottom: 32px;
}

.word-spelling {
  font-size: 36px;
  font-weight: 700;
  color: var(--accent);
}

.loading, .empty, .empty-section {
  text-align: center;
  padding: 24px;
  color: var(--text-secondary);
}

.section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 18px;
  margin-bottom: 16px;
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 16px;
}

.card-content {
  font-size: 15px;
  margin-bottom: 8px;
}

.card-en {
  font-size: 15px;
  font-style: italic;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.card-type {
  font-size: 12px;
  color: var(--accent);
  margin-bottom: 6px;
}

.card-origin {
  font-size: 12px;
  color: var(--text-secondary);
}

.card-tags {
  display: flex;
  gap: 6px;
}

.tag {
  font-size: 11px;
  background: var(--glass);
  color: var(--text-secondary);
  padding: 2px 8px;
  border-radius: 4px;
}
</style>

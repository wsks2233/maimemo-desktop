import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ReviewRecord, StudyTodayItem } from '../types'

const STORAGE_KEY = 'maimemo_review_records'

export const useReviewStore = defineStore('review', () => {
  const records = ref<ReviewRecord[]>(loadRecords())
  const currentItems = ref<StudyTodayItem[]>([])
  const currentIndex = ref(0)
  const phase = ref<'idle' | 'preview' | 'test' | 'reinforce' | 'summary'>('idle')
  const selfRatings = ref<Map<string, 'know' | 'vague' | 'forget'>>(new Map())
  const currentRound = ref(1)

  function loadRecords(): ReviewRecord[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  function saveRecords() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records.value))
  }

  const todayRecords = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return records.value.filter(r => r.date === today)
  })

  const todayStats = computed(() => {
    const today = todayRecords.value
    const uniqueWords = new Set(today.map(r => r.voc_id))
    const lastRatings = new Map<string, string>()
    today.forEach(r => lastRatings.set(r.voc_id, r.self_rating))
    const knowCount = [...lastRatings.values()].filter(v => v === 'know').length
    const vagueCount = [...lastRatings.values()].filter(v => v === 'vague').length
    const forgetCount = [...lastRatings.values()].filter(v => v === 'forget').length
    return {
      total: uniqueWords.size,
      know: knowCount,
      vague: vagueCount,
      forget: forgetCount,
      rate: uniqueWords.size > 0 ? Math.round((knowCount / uniqueWords.size) * 100) : 0,
    }
  })

  function startReview(items: StudyTodayItem[]) {
    currentItems.value = items
    currentIndex.value = 0
    selfRatings.value.clear()
    currentRound.value = 1
    phase.value = 'preview'
  }

  function rateWord(vocId: string, rating: 'know' | 'vague' | 'forget') {
    selfRatings.value.set(vocId, rating)
    const today = new Date().toISOString().split('T')[0]
    records.value.push({
      date: today,
      voc_id: vocId,
      spelling: currentItems.value[currentIndex.value]?.voc_spelling || '',
      self_rating: rating,
      review_round: currentRound.value,
      timestamp: Date.now(),
    })
    saveRecords()
  }

  function nextWord() {
    if (currentIndex.value < currentItems.value.length - 1) {
      currentIndex.value++
    }
  }

  function prevWord() {
    if (currentIndex.value > 0) {
      currentIndex.value--
    }
  }

  function goToReinforce() {
    const weakWords = currentItems.value.filter(item => {
      const rating = selfRatings.value.get(item.voc_id)
      return rating === 'vague' || rating === 'forget'
    })
    if (weakWords.length === 0) {
      phase.value = 'summary'
    } else {
      currentItems.value = weakWords
      currentIndex.value = 0
      selfRatings.value.clear()
      currentRound.value++
      phase.value = 'reinforce'
    }
  }

  function finishReview() {
    phase.value = 'summary'
  }

  function reset() {
    phase.value = 'idle'
    currentItems.value = []
    currentIndex.value = 0
    selfRatings.value.clear()
    currentRound.value = 1
  }

  return {
    records,
    currentItems,
    currentIndex,
    phase,
    selfRatings,
    currentRound,
    todayRecords,
    todayStats,
    startReview,
    rateWord,
    nextWord,
    prevWord,
    goToReinforce,
    finishReview,
    reset,
  }
})

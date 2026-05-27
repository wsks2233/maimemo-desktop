import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getStudyProgress, getTodayItems, queryStudyRecords } from '../api/study'
import type { StudyProgress, StudyTodayItem, StudyRecord } from '../types'

export const useStudyStore = defineStore('study', () => {
  const progress = ref<StudyProgress | null>(null)
  const todayItems = ref<StudyTodayItem[]>([])
  const records = ref<StudyRecord[]>([])
  const loading = ref(false)

  const unfinishedItems = computed(() =>
    todayItems.value.filter(item => !item.is_finished)
  )

  const finishedCount = computed(() =>
    todayItems.value.filter(item => item.is_finished).length
  )

  const newWordCount = computed(() =>
    todayItems.value.filter(item => item.is_new).length
  )

  async function fetchProgress() {
    try {
      progress.value = await getStudyProgress()
    } catch (e) {
      console.error('获取学习进度失败:', e)
    }
  }

  async function fetchTodayItems(params?: Parameters<typeof getTodayItems>[0]) {
    loading.value = true
    try {
      todayItems.value = await getTodayItems(params)
    } catch (e) {
      console.error('获取今日单词失败:', e)
    } finally {
      loading.value = false
    }
  }

  async function fetchRecords(params?: Parameters<typeof queryStudyRecords>[0]) {
    loading.value = true
    try {
      const result = await queryStudyRecords(params)
      records.value = result.records
    } catch (e) {
      console.error('获取学习记录失败:', e)
    } finally {
      loading.value = false
    }
  }

  return {
    progress,
    todayItems,
    records,
    loading,
    unfinishedItems,
    finishedCount,
    newWordCount,
    fetchProgress,
    fetchTodayItems,
    fetchRecords,
  }
})

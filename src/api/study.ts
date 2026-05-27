import client from './client'
import type { StudyProgress, StudyTodayItem, StudyRecord } from '../types'

// 获取今日学习进度
export async function getStudyProgress(): Promise<StudyProgress> {
  const { data } = await client.post('/study/get_study_progress')
  return data.progress
}

// 获取今日学习单词
export async function getTodayItems(params?: {
  is_finished?: boolean
  is_new?: boolean
  voc_ids?: string[]
  spellings?: string[]
  limit?: number
}): Promise<StudyTodayItem[]> {
  const { data } = await client.post('/study/get_today_items', params || {})
  return data.today_items
}

// 查询学习记录
export async function queryStudyRecords(params?: {
  next_study_date?: { start?: string; end?: string }
  voc_ids?: string[]
  spellings?: string[]
  as_count?: boolean
  limit?: number
}): Promise<{ records: StudyRecord[]; count: number }> {
  const { data } = await client.post('/study/query_study_records', params || {})
  return { records: data.records, count: data.count }
}

// 添加单词到学习计划
export async function addWords(words: Array<{ id: string }>, advance = false): Promise<number> {
  const { data } = await client.post('/study/add_words', { words, advance })
  return data.added_count
}

// 提前复习
export async function advanceStudy(voc_ids: string[]): Promise<number> {
  const { data } = await client.post('/study/advance_study', { voc_ids })
  return data.advanced_count
}

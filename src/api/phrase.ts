import client from './client'
import type { Phrase } from '../types'

// 获取单词例句
export async function listPhrases(voc_id: string): Promise<Phrase[]> {
  const { data } = await client.get('/phrases', { params: { voc_id } })
  return data.phrases
}

// 创建例句
export async function createPhrase(phrase: {
  voc_id: string
  phrase: string
  interpretation: string
  tags: string[]
  origin: string
}): Promise<Phrase> {
  const { data } = await client.post('/phrases', { phrase })
  return data.phrase
}

// 更新例句
export async function updatePhrase(id: string, phrase: {
  phrase?: string
  interpretation?: string
  tags?: string[]
  origin?: string
}): Promise<Phrase> {
  const { data } = await client.post(`/phrases/${id}`, { phrase })
  return data.phrase
}

// 删除例句
export async function deletePhrase(id: string): Promise<void> {
  await client.delete(`/phrases/${id}`)
}

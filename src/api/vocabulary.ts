import client from './client'
import type { Vocabulary } from '../types'

// 获取单词（按拼写）
export async function getVocabulary(spelling: string): Promise<Vocabulary> {
  const { data } = await client.get('/vocabulary', { params: { spelling } })
  return data.voc
}

// 批量查询单词（按拼写列表）
export async function queryVocabularyBySpellings(spellings: string[]): Promise<Vocabulary[]> {
  const { data } = await client.post('/vocabulary/query', { spellings })
  return data.voc
}

// 批量查询单词（按ID列表）
export async function queryVocabularyByIds(ids: string[]): Promise<Vocabulary[]> {
  const { data } = await client.post('/vocabulary/query', { ids })
  return data.voc
}

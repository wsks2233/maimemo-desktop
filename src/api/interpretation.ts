import client from './client'
import type { Interpretation } from '../types'

// 获取单词释义
export async function listInterpretations(voc_id: string): Promise<Interpretation[]> {
  const { data } = await client.get('/interpretations', { params: { voc_id } })
  return data.interpretations
}

// 创建释义
export async function createInterpretation(interpretation: {
  voc_id: string
  interpretation: string
  tags: string[]
  status: 'PUBLISHED' | 'UNPUBLISHED'
}): Promise<Interpretation> {
  const { data } = await client.post('/interpretations', { interpretation })
  return data.interpretation
}

// 更新释义
export async function updateInterpretation(id: string, interpretation: {
  interpretation?: string
  tags?: string[]
  status?: 'PUBLISHED' | 'UNPUBLISHED'
}): Promise<Interpretation> {
  const { data } = await client.post(`/interpretations/${id}`, { interpretation })
  return data.interpretation
}

// 删除释义
export async function deleteInterpretation(id: string): Promise<void> {
  await client.delete(`/interpretations/${id}`)
}

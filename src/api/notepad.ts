import client from './client'
import type { BriefNotepad, Notepad } from '../types'

// 查询云词本列表
export async function listNotepads(limit = 10, offset = 0, ids?: string[]): Promise<BriefNotepad[]> {
  const params: Record<string, unknown> = { limit, offset }
  if (ids) params.ids = ids
  const { data } = await client.get('/notepads', { params })
  return data.notepads
}

// 获取云词本详情
export async function getNotepad(id: string): Promise<Notepad> {
  const { data } = await client.get(`/notepads/${id}`)
  return data.notepad
}

// 创建云词本
export async function createNotepad(notepad: {
  status: 'PUBLISHED' | 'UNPUBLISHED'
  content: string
  title: string
  brief: string
  tags: string[]
}): Promise<Notepad> {
  const { data } = await client.post('/notepads', { notepad })
  return data.notepad
}

// 更新云词本
export async function updateNotepad(id: string, notepad: {
  status?: 'PUBLISHED' | 'UNPUBLISHED'
  content?: string
  title?: string
  brief?: string
  tags?: string[]
}): Promise<Notepad> {
  const { data } = await client.post(`/notepads/${id}`, { notepad })
  return data.notepad
}

// 删除云词本
export async function deleteNotepad(id: string): Promise<Notepad> {
  const { data } = await client.delete(`/notepads/${id}`)
  return data.notepad
}

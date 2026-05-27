import client from './client'
import type { Note } from '../types'

// 获取单词助记
export async function listNotes(voc_id: string): Promise<Note[]> {
  const { data } = await client.get('/notes', { params: { voc_id } })
  return data.notes
}

// 创建助记
export async function createNote(note: {
  voc_id: string
  note_type: string
  note: string
}): Promise<Note> {
  const { data } = await client.post('/notes', { note })
  return data.note
}

// 更新助记
export async function updateNote(id: string, note: {
  note_type?: string
  note?: string
}): Promise<Note> {
  const { data } = await client.post(`/notes/${id}`, { note })
  return data.note
}

// 删除助记
export async function deleteNote(id: string): Promise<void> {
  await client.delete(`/notes/${id}`)
}

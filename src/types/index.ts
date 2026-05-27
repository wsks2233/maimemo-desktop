// 单词
export interface Vocabulary {
  id: string
  spelling: string
}

// 释义
export interface Interpretation {
  id: string
  interpretation: string
  tags: string[]
  status: 'PUBLISHED' | 'UNPUBLISHED' | 'DELETED'
  created_time: string
  updated_time: string
}

// 助记
export interface Note {
  id: string
  note_type: string
  note: string
  status: 'PUBLISHED' | 'DELETED'
  created_time: string
  updated_time: string
}

// 例句
export interface Phrase {
  id: string
  phrase: string
  interpretation: string
  tags: string[]
  highlight: Array<{ start: number; end: number }>
  status: 'PUBLISHED' | 'DELETED'
  created_time: string
  updated_time: string
  origin: string
}

// 云词本
export interface Notepad {
  id: string
  type: 'FAVORITE' | 'NOTEPAD'
  creator: number
  status: 'PUBLISHED' | 'UNPUBLISHED' | 'DELETED'
  content: string
  title: string
  brief: string
  tags: string[]
  list: NotepadParsedItem[]
  created_time: string
  updated_time: string
}

export interface BriefNotepad {
  id: string
  type: 'FAVORITE' | 'NOTEPAD'
  creator: number
  status: 'PUBLISHED' | 'UNPUBLISHED' | 'DELETED'
  title: string
  brief: string
  tags: string[]
  created_time: string
  updated_time: string
}

export interface NotepadParsedItem {
  type: 'CHAPTER' | 'WORD'
  data: {
    chapter: string
    word?: string
  }
}

// 学习数据
export type StudyResponse = 'FAMILIAR' | 'VAGUE' | 'FORGET' | 'WELL_FAMILIAR' | 'CANCEL_WELL_FAMILIAR'

export interface StudyProgress {
  finished: number
  total: number
  study_time: number
}

export interface StudyTodayItem {
  voc_id: string
  voc_spelling: string
  order: number
  first_response?: StudyResponse
  is_new: boolean
  is_finished: boolean
}

export interface StudyRecord {
  voc_id: string
  voc_spelling: string
  add_date: string
  first_study_date?: string
  last_study_date?: string
  next_study_date?: string
  last_response?: StudyResponse
  study_count: number
  tags?: 'STICKING' | 'WELL_FAMILIAR'
}

// 本地回顾记录
export interface ReviewRecord {
  date: string
  voc_id: string
  spelling: string
  self_rating: 'know' | 'vague' | 'forget'
  review_round: number
  timestamp: number
}

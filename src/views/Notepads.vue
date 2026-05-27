<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { listNotepads, createNotepad, deleteNotepad } from '../api/notepad'
import type { BriefNotepad } from '../types'

const notepads = ref<BriefNotepad[]>([])
const loading = ref(false)
const showCreate = ref(false)

const newNotepad = ref({
  title: '',
  brief: '',
  content: '',
  tags: '',
})

onMounted(() => {
  fetchNotepads()
})

async function fetchNotepads() {
  loading.value = true
  try {
    notepads.value = await listNotepads(50, 0)
  } catch (e) {
    console.error('获取云词本失败:', e)
  } finally {
    loading.value = false
  }
}

async function handleCreate() {
  if (!newNotepad.value.title || !newNotepad.value.content) return
  try {
    await createNotepad({
      status: 'PUBLISHED',
      content: newNotepad.value.content,
      title: newNotepad.value.title,
      brief: newNotepad.value.brief,
      tags: newNotepad.value.tags.split(',').map(t => t.trim()).filter(Boolean),
    })
    showCreate.value = false
    newNotepad.value = { title: '', brief: '', content: '', tags: '' }
    await fetchNotepads()
  } catch (e) {
    console.error('创建云词本失败:', e)
  }
}

async function handleDelete(id: string) {
  if (!confirm('确定删除这个云词本？')) return
  try {
    await deleteNotepad(id)
    await fetchNotepads()
  } catch (e) {
    console.error('删除云词本失败:', e)
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('zh-CN')
}
</script>

<template>
  <div class="notepads">
    <div class="page-header">
      <h1 class="page-title">📚 云词本管理</h1>
      <button class="btn-primary" @click="showCreate = !showCreate">
        {{ showCreate ? '取消' : '+ 新建词本' }}
      </button>
    </div>

    <!-- 创建表单 -->
    <div v-if="showCreate" class="create-form">
      <div class="form-row">
        <input v-model="newNotepad.title" placeholder="词本标题" class="input" />
      </div>
      <div class="form-row">
        <input v-model="newNotepad.brief" placeholder="简介" class="input" />
      </div>
      <div class="form-row">
        <textarea
          v-model="newNotepad.content"
          placeholder="单词内容（每行一个单词，可用 # 章节名 分章节）"
          class="textarea"
          rows="8"
        ></textarea>
      </div>
      <div class="form-row">
        <input v-model="newNotepad.tags" placeholder="标签（逗号分隔）" class="input" />
      </div>
      <button class="btn-primary" @click="handleCreate">创建</button>
    </div>

    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="notepads.length === 0" class="empty">
      暂无云词本
    </div>

    <div v-else class="notepad-list">
      <div v-for="np in notepads" :key="np.id" class="notepad-card">
        <div class="notepad-header">
          <h3>{{ np.title }}</h3>
          <span class="notepad-type">{{ np.type === 'FAVORITE' ? '收藏' : '词本' }}</span>
        </div>
        <p class="notepad-brief">{{ np.brief }}</p>
        <div class="notepad-tags">
          <span v-for="tag in np.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>
        <div class="notepad-footer">
          <span class="notepad-date">{{ formatDate(np.updated_time) }}</span>
          <button class="btn-delete" @click="handleDelete(np.id)">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notepads {
  max-width: 900px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
}

.btn-primary {
  background: var(--accent);
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary:hover {
  background: var(--accent-hover);
}

.create-form {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-row {
  display: flex;
  gap: 12px;
}

.input, .textarea {
  flex: 1;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px 14px;
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
}

.input:focus, .textarea:focus {
  border-color: var(--accent);
}

.textarea {
  resize: vertical;
  font-family: inherit;
}

.loading, .empty {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
}

.notepad-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.notepad-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  transition: border-color 0.2s;
}

.notepad-card:hover {
  border-color: var(--accent);
}

.notepad-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.notepad-header h3 {
  font-size: 16px;
}

.notepad-type {
  font-size: 12px;
  color: var(--text-secondary);
  background: var(--glass);
  padding: 2px 8px;
  border-radius: 4px;
}

.notepad-brief {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.notepad-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.tag {
  font-size: 11px;
  background: var(--accent);
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
}

.notepad-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notepad-date {
  font-size: 12px;
  color: var(--text-secondary);
}

.btn-delete {
  background: none;
  border: 1px solid var(--danger);
  color: var(--danger);
  padding: 4px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
}

.btn-delete:hover {
  background: var(--danger);
  color: white;
}
</style>

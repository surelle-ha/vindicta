<script setup lang="ts">
import { X, ThumbsUp, CornerDownRight, Bot, ChevronDown, GitBranch } from 'lucide-vue-next'
import type { TicketStatus, TicketType, TicketPriority, Comment } from '~/types/vindicta'
import { renderMarkdown } from '~/utils/markdown'
import { ticketKey } from '~/utils/ticket'

const { selectedTicketId, closeTicket } = useTicketDetail()
const kanban = useKanbanStore()
const sprint = useSprintStore()
const projects = useProjectsStore()
const user = useUserStore()
const { notify } = useNotifications()

const authorName = computed(() => user.name || 'You')

const projectCode = computed(() => projects.activeProject?.code ?? '')

const ticket = computed(() => kanban.tickets.find(t => t.id === selectedTicketId.value) ?? null)
const descriptionHtml = computed(() => {
  return renderMarkdown(ticket.value?.description ?? '')
})

// Close on Escape
onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') closeTicket()
}

// Inline edits
const editingTitle = ref(false)
const titleDraft = ref('')

function startEditTitle() {
  if (!ticket.value) return
  titleDraft.value = ticket.value.title
  editingTitle.value = true
  nextTick(() => (document.getElementById('ticket-title-input') as HTMLInputElement | null)?.focus())
}

async function saveTitle() {
  if (!ticket.value || !titleDraft.value.trim()) { editingTitle.value = false; return }
  await kanban.updateTicket(ticket.value.id, { title: titleDraft.value.trim() })
  editingTitle.value = false
}

const editingDesc = ref(false)
const descDraft = ref('')

function startEditDesc() {
  if (!ticket.value) return
  descDraft.value = ticket.value.description
  editingDesc.value = true
  nextTick(() => (document.getElementById('ticket-desc-input') as HTMLTextAreaElement | null)?.focus())
}

async function saveDesc() {
  if (!ticket.value) return
  await kanban.updateTicket(ticket.value.id, { description: descDraft.value })
  editingDesc.value = false
}

async function setStatus(status: TicketStatus) {
  if (!ticket.value) return
  await kanban.moveTicket(ticket.value.id, status)
}

async function setPriority(priority: TicketPriority) {
  if (!ticket.value) return
  await kanban.updateTicket(ticket.value.id, { priority })
}

async function setType(type: TicketType) {
  if (!ticket.value) return
  await kanban.updateTicket(ticket.value.id, { type })
}

async function setSprint(sprintId: string | null) {
  if (!ticket.value) return
  const previousSprintId = ticket.value.sprintId
  if (previousSprintId && previousSprintId !== sprintId) {
    await sprint.removeTicket(ticket.value.id, previousSprintId)
  }
  if (sprintId && previousSprintId !== sprintId) {
    await sprint.assignTicket(ticket.value.id, sprintId)
  }
  await kanban.updateTicket(ticket.value.id, { sprintId })
}

async function likeTicket() {
  if (!ticket.value) return
  await kanban.updateTicket(ticket.value.id, { likes: (ticket.value.likes ?? 0) + 1 })
}

// Comments
const commentText = ref('')
const replyToId = ref<string | null>(null)
const replyToAuthor = ref<string | null>(null)

function startReply(c: Comment) {
  replyToId.value = c.id
  replyToAuthor.value = c.author
  nextTick(() => (document.getElementById('comment-input') as HTMLTextAreaElement | null)?.focus())
}

function cancelReply() {
  replyToId.value = null
  replyToAuthor.value = null
}

async function postComment() {
  if (!ticket.value || !commentText.value.trim()) return
  await kanban.addComment(ticket.value.id, commentText.value.trim(), authorName.value, false, replyToId.value)
  commentText.value = ''
  replyToId.value = null
  replyToAuthor.value = null
}

async function likeComment(commentId: string) {
  if (!ticket.value) return
  const updated = ticket.value.comments.map(c =>
    c.id === commentId ? { ...c, likes: (c.likes ?? 0) + 1 } : c,
  )
  await kanban.updateTicket(ticket.value.id, { comments: updated })
}

const topComments = computed(() =>
  (ticket.value?.comments ?? []).filter(c => !c.parentId),
)

function repliesFor(parentId: string): Comment[] {
  return (ticket.value?.comments ?? []).filter(c => c.parentId === parentId)
}

const statusOptions: { value: TicketStatus; label: string }[] = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'in_review', label: 'In Review' },
  { value: 'done', label: 'Done' },
  { value: 'cancelled', label: 'Cancelled' },
]

const statusBadge: Record<TicketStatus, string> = {
  backlog:     'bg-slate-500/20 text-slate-300',
  todo:        'bg-blue-500/20 text-blue-300',
  in_progress: 'bg-amber-500/20 text-amber-300',
  in_review:   'bg-violet-500/20 text-violet-300',
  done:        'bg-emerald-500/20 text-emerald-300',
  cancelled:   'bg-red-500/20 text-red-300',
}

const priorityBadge: Record<TicketPriority, string> = {
  critical: 'bg-red-500/20 text-red-300',
  high:     'bg-amber-500/20 text-amber-300',
  medium:   'bg-blue-500/20 text-blue-300',
  low:      'bg-white/10 text-white/40',
}

const typeBadge: Record<string, string> = {
  feature: 'bg-blue-500/15 text-blue-300',
  bug:     'bg-red-500/15 text-red-300',
  fix:     'bg-amber-500/15 text-amber-300',
  chore:   'bg-slate-500/15 text-slate-400',
  spike:   'bg-violet-500/15 text-violet-300',
}
</script>

<template>
  <Teleport to="body">
    <Transition name="panel">
      <div v-if="ticket" class="fixed inset-0 z-50 flex justify-end">
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/40 backdrop-blur-sm"
          @click="closeTicket"
        />

        <!-- Panel -->
        <div class="relative w-full max-w-2xl h-full bg-[var(--bg)] border-l border-[var(--border)] flex flex-col shadow-2xl overflow-hidden">
          <!-- Header -->
          <div class="flex items-center gap-3 px-5 py-4 border-b border-[var(--border)] shrink-0">
            <span class="text-xs font-mono font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
              {{ projectCode && ticket.number ? ticketKey(projectCode, ticket.number) : ticket.id.slice(0, 8) }}
            </span>

            <!-- Status selector -->
            <div class="relative group">
              <button
                class="flex items-center gap-1 text-xs px-2 py-1 rounded font-medium transition-colors"
                :class="statusBadge[ticket.status]"
              >
                {{ ticket.status.replace('_', ' ') }}
                <ChevronDown class="size-3 opacity-60" />
              </button>
              <div class="absolute top-full left-0 mt-1 w-40 glass rounded-lg shadow-xl z-10 py-1 hidden group-hover:block">
                <button
                  v-for="opt in statusOptions"
                  :key="opt.value"
                  class="w-full text-left px-3 py-1.5 text-xs text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  @click="setStatus(opt.value)"
                >
                  {{ opt.label }}
                </button>
              </div>
            </div>

            <div class="ml-auto flex items-center gap-2">
              <button
                class="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors"
                @click="likeTicket"
              >
                <ThumbsUp class="size-3.5" />
                <span>{{ ticket.likes ?? 0 }}</span>
              </button>
              <button
                class="p-1.5 rounded text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                @click="closeTicket"
              >
                <X class="size-4" />
              </button>
            </div>
          </div>

          <!-- Scrollable body -->
          <div class="flex-1 overflow-y-auto custom-scroll px-5 py-5 space-y-5">
            <!-- Title -->
            <div>
              <input
                v-if="editingTitle"
                id="ticket-title-input"
                v-model="titleDraft"
                class="w-full text-xl font-bold text-white bg-transparent border-b border-indigo-500/50 outline-none pb-1"
                @blur="saveTitle"
                @keydown.enter="saveTitle"
                @keydown.esc="editingTitle = false"
              />
              <h2
                v-else
                class="text-xl font-bold text-white cursor-text hover:text-indigo-200 transition-colors"
                @click="startEditTitle"
              >
                {{ ticket.title }}
              </h2>
            </div>

            <!-- Metadata chips -->
            <div class="flex flex-wrap gap-2">
              <!-- Type -->
              <div class="relative group">
                <button
                  class="text-[10px] px-2 py-1 rounded font-semibold uppercase cursor-pointer"
                  :class="typeBadge[ticket.type]"
                >
                  {{ ticket.type }}
                </button>
                <div class="absolute top-full left-0 mt-1 w-32 glass rounded-lg shadow-xl z-10 py-1 hidden group-hover:block">
                  <button
                    v-for="t in ['feature', 'bug', 'fix', 'chore', 'spike']"
                    :key="t"
                    class="w-full text-left px-3 py-1.5 text-xs text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                    @click="setType(t as TicketType)"
                  >
                    {{ t }}
                  </button>
                </div>
              </div>

              <!-- Priority -->
              <div class="relative group">
                <button
                  class="text-[10px] px-2 py-1 rounded font-medium cursor-pointer"
                  :class="priorityBadge[ticket.priority]"
                >
                  {{ ticket.priority }}
                </button>
                <div class="absolute top-full left-0 mt-1 w-32 glass rounded-lg shadow-xl z-10 py-1 hidden group-hover:block">
                  <button
                    v-for="p in ['critical', 'high', 'medium', 'low']"
                    :key="p"
                    class="w-full text-left px-3 py-1.5 text-xs text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                    @click="setPriority(p as TicketPriority)"
                  >
                    {{ p }}
                  </button>
                </div>
              </div>

              <!-- Sprint assignment -->
              <div class="relative group">
                <button class="text-[10px] px-2 py-1 rounded bg-white/10 text-white/50 hover:text-white/70 transition-colors">
                  {{ sprint.sprints.find(s => s.id === ticket?.sprintId)?.name ?? 'No Sprint' }}
                  <ChevronDown class="inline size-3 ml-0.5 opacity-60" />
                </button>
                <div class="absolute top-full left-0 mt-1 w-44 glass rounded-lg shadow-xl z-10 py-1 hidden group-hover:block">
                  <button
                    class="w-full text-left px-3 py-1.5 text-xs text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                    @click="setSprint(null)"
                  >
                    No Sprint
                  </button>
                  <button
                    v-for="s in sprint.sprints"
                    :key="s.id"
                    class="w-full text-left px-3 py-1.5 text-xs text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                    @click="setSprint(s.id)"
                  >
                    {{ s.name }}
                  </button>
                </div>
              </div>

              <!-- Labels -->
              <span
                v-for="label in ticket.labels"
                :key="label"
                class="text-[10px] px-2 py-1 rounded-full bg-white/[0.06] text-[var(--text-muted)]"
              >
                {{ label }}
              </span>
            </div>

            <!-- Description -->
            <div>
              <p class="text-xs font-semibold uppercase tracking-wider text-[var(--text-faint)] mb-2">Description</p>
              <textarea
                v-if="editingDesc"
                id="ticket-desc-input"
                v-model="descDraft"
                rows="5"
                class="w-full text-sm text-white/80 bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-indigo-500/50 resize-none"
                @blur="saveDesc"
                @keydown.esc="editingDesc = false"
              />
              <div
                v-else
                class="text-sm text-white/70 cursor-text min-h-[3rem] rounded-lg px-3 py-2 hover:bg-white/[0.03] transition-colors border border-transparent hover:border-white/10 markdown-preview"
                @click="startEditDesc"
              >
                <div v-if="ticket.description" v-html="descriptionHtml" />
                <span v-else class="text-white/30">Add a description...</span>
              </div>
            </div>

            <div v-if="ticket.gitControl?.enabled" class="rounded-lg border border-indigo-500/20 bg-indigo-500/5 px-3 py-2">
              <div class="flex items-center gap-2 mb-2">
                <GitBranch class="size-3.5 text-indigo-300" />
                <p class="text-xs font-semibold text-indigo-200">Git Control</p>
              </div>
              <div class="grid grid-cols-3 gap-2 text-[10px] text-white/45">
                <div>
                  <p class="uppercase tracking-wider text-white/25 mb-0.5">Branch</p>
                  <p class="font-mono text-white/70 truncate">{{ ticket.gitControl.branch || 'AI decides' }}</p>
                </div>
                <div>
                  <p class="uppercase tracking-wider text-white/25 mb-0.5">Commit</p>
                  <p class="text-white/70">{{ ticket.gitControl.autoCommit ? 'Auto' : 'Manual' }}</p>
                </div>
                <div>
                  <p class="uppercase tracking-wider text-white/25 mb-0.5">Push</p>
                  <p class="text-white/70">{{ ticket.gitControl.autoPush ? 'Auto' : 'Manual' }}</p>
                </div>
              </div>
            </div>

            <!-- Divider -->
            <div class="h-px bg-[var(--border)]" />

            <!-- Comments -->
            <div>
              <p class="text-xs font-semibold uppercase tracking-wider text-[var(--text-faint)] mb-3">
                Comments ({{ (ticket.comments ?? []).length }})
              </p>

              <div v-if="!topComments.length" class="text-sm text-white/30 mb-4">No comments yet.</div>

              <div class="space-y-4">
                <div v-for="comment in topComments" :key="comment.id">
                  <!-- Top-level comment -->
                  <div
                    class="rounded-lg px-3 py-2.5 text-sm"
                    :class="comment.isAI ? 'bg-violet-500/10 border border-violet-500/20' : 'bg-white/[0.04] border border-white/[0.06]'"
                  >
                    <div class="flex items-center gap-2 mb-1.5">
                      <Bot v-if="comment.isAI" class="size-3.5 text-violet-400" />
                      <span class="text-xs font-semibold" :class="comment.isAI ? 'text-violet-300' : 'text-white/70'">
                        {{ comment.author }}
                      </span>
                      <span class="text-[10px] text-white/30">{{ formatRelative(comment.createdAt) }}</span>
                    </div>
                    <p class="text-white/80 whitespace-pre-wrap">{{ comment.text }}</p>
                    <div class="flex items-center gap-3 mt-2">
                      <button
                        class="flex items-center gap-1 text-[10px] text-white/30 hover:text-white/60 transition-colors"
                        @click="likeComment(comment.id)"
                      >
                        <ThumbsUp class="size-3" />
                        {{ comment.likes ?? 0 }}
                      </button>
                      <button
                        class="text-[10px] text-white/30 hover:text-indigo-400 transition-colors"
                        @click="startReply(comment)"
                      >
                        Reply
                      </button>
                    </div>
                  </div>

                  <!-- Replies -->
                  <div v-if="repliesFor(comment.id).length" class="ml-6 mt-2 space-y-2">
                    <div
                      v-for="reply in repliesFor(comment.id)"
                      :key="reply.id"
                      class="rounded-lg px-3 py-2 text-sm border-l-2 border-indigo-500/30"
                      :class="reply.isAI ? 'bg-violet-500/10 border border-violet-500/20' : 'bg-white/[0.03] border border-white/[0.05]'"
                    >
                      <div class="flex items-center gap-2 mb-1">
                        <CornerDownRight class="size-3 text-white/20" />
                        <Bot v-if="reply.isAI" class="size-3 text-violet-400" />
                        <span class="text-xs font-semibold" :class="reply.isAI ? 'text-violet-300' : 'text-white/60'">
                          {{ reply.author }}
                        </span>
                        <span class="text-[10px] text-white/30">{{ formatRelative(reply.createdAt) }}</span>
                      </div>
                      <p class="text-white/70 whitespace-pre-wrap">{{ reply.text }}</p>
                      <button
                        class="flex items-center gap-1 text-[10px] text-white/30 hover:text-white/60 transition-colors mt-1.5"
                        @click="likeComment(reply.id)"
                      >
                        <ThumbsUp class="size-3" />
                        {{ reply.likes ?? 0 }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Comment input -->
              <div class="mt-4">
                <div v-if="replyToAuthor" class="flex items-center gap-2 mb-2 text-xs text-indigo-400">
                  <CornerDownRight class="size-3" />
                  Replying to {{ replyToAuthor }}
                  <button class="text-white/30 hover:text-white/60 ml-auto" @click="cancelReply">✕</button>
                </div>
                <textarea
                  id="comment-input"
                  v-model="commentText"
                  rows="3"
                  placeholder="Write a comment..."
                  class="w-full text-sm text-white/80 bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-indigo-500/50 resize-none placeholder-white/20"
                  @keydown.ctrl.enter="postComment"
                />
                <div class="flex justify-between items-center mt-2">
                  <span class="text-[10px] text-white/20">Ctrl+Enter to post</span>
                  <button
                    :disabled="!commentText.trim()"
                    class="px-3 py-1.5 text-xs rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    @click="postComment"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>

            <!-- Ticket metadata footer -->
            <div class="text-[10px] text-white/20 space-y-0.5 pt-2 border-t border-[var(--border)]">
              <p>Created {{ formatRelative(ticket.createdAt) }} by {{ ticket.createdBy }}</p>
              <p>Updated {{ formatRelative(ticket.updatedAt) }}</p>
              <p v-if="ticket.resolvedAt">Resolved {{ formatRelative(ticket.resolvedAt) }}</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.markdown-preview :deep(h1) { font-size: 1.125rem; font-weight: 700; color: white; margin-bottom: 0.5rem; }
.markdown-preview :deep(h2) { font-size: 1rem; font-weight: 600; color: white; margin-top: 0.75rem; margin-bottom: 0.375rem; }
.markdown-preview :deep(h3) { font-size: 0.875rem; font-weight: 600; color: rgba(255,255,255,0.85); margin-top: 0.5rem; margin-bottom: 0.25rem; }
.markdown-preview :deep(p) { margin-bottom: 0.5rem; }
.markdown-preview :deep(ul) { list-style-type: disc; margin-left: 1rem; margin-bottom: 0.5rem; }
.markdown-preview :deep(ol) { list-style-type: decimal; margin-left: 1rem; margin-bottom: 0.5rem; }
.markdown-preview :deep(li) { margin-bottom: 0.125rem; }
.markdown-preview :deep(code) { font-size: 0.75rem; font-family: monospace; background: rgba(255,255,255,0.1); padding: 0.125rem 0.375rem; border-radius: 0.25rem; color: #c4b5fd; }
.markdown-preview :deep(pre) { background: rgba(255,255,255,0.06); border-radius: 0.375rem; padding: 0.75rem; overflow-x: auto; margin-bottom: 0.5rem; }
.markdown-preview :deep(pre code) { background: transparent; padding: 0; }
.markdown-preview :deep(blockquote) { border-left: 2px solid rgba(99,102,241,0.4); padding-left: 0.75rem; color: rgba(255,255,255,0.45); font-style: italic; }
.panel-enter-active,
.panel-leave-active {
  transition: opacity 0.2s ease;
}
.panel-enter-active .relative,
.panel-leave-active .relative {
  transition: transform 0.25s ease;
}
.panel-enter-from {
  opacity: 0;
}
.panel-leave-to {
  opacity: 0;
}
.panel-enter-from .relative {
  transform: translateX(100%);
}
.panel-leave-to .relative {
  transform: translateX(100%);
}
</style>

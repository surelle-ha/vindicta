import { defineStore } from 'pinia'
import type { Ticket, TicketStatus, Comment } from '~/types/vindicta'
import { generateId } from '~/utils/id'
import { nowISO } from '~/utils/date'

export const useKanbanStore = defineStore('kanban', {
  state: () => ({
    tickets: [] as Ticket[],
    draggingId: null as string | null,
    projectPath: null as string | null,
  }),

  getters: {
    byStatus: (s) => {
      const map: Record<TicketStatus, Ticket[]> = {
        backlog: [],
        todo: [],
        in_progress: [],
        in_review: [],
        done: [],
        cancelled: [],
      }
      for (const t of s.tickets) {
        map[t.status].push(t)
      }
      return map
    },

    total: (s) => s.tickets.length,
    doneCount: (s) => s.tickets.filter((t) => t.status === 'done').length,
  },

  actions: {
    load(tickets: Ticket[], projectPath: string) {
      this.tickets = tickets
      this.projectPath = projectPath
    },

    async createTicket(partial: Partial<Ticket>, createdBy: string): Promise<Ticket> {
      const nextNumber = this.tickets.reduce((max, t) => Math.max(max, t.number ?? 0), 0) + 1
      const ticket: Ticket = {
        id: generateId(),
        number: nextNumber,
        type: partial.type ?? 'feature',
        status: partial.status ?? 'backlog',
        priority: partial.priority ?? 'medium',
        title: partial.title ?? 'Untitled',
        description: partial.description ?? '',
        gitControl: partial.gitControl ?? {
          enabled: false,
          branch: '',
          autoCommit: false,
          autoPush: false,
        },
        labels: partial.labels ?? [],
        roleIds: partial.roleIds ?? [],
        sprintId: partial.sprintId ?? null,
        comments: [],
        likes: 0,
        createdAt: nowISO(),
        updatedAt: nowISO(),
        resolvedAt: null,
        createdBy,
      }
      this.tickets.push(ticket)
      await this.persist()
      return ticket
    },

    async moveTicket(id: string, status: TicketStatus) {
      const ticket = this.tickets.find((t) => t.id === id)
      if (!ticket) return
      ticket.status = status
      ticket.updatedAt = nowISO()
      if (status === 'done' || status === 'cancelled') {
        ticket.resolvedAt = nowISO()
      }
      await this.persist()
    },

    async updateTicket(id: string, updates: Partial<Ticket>) {
      const ticket = this.tickets.find((t) => t.id === id)
      if (!ticket) return
      Object.assign(ticket, updates, { updatedAt: nowISO() })
      await this.persist()
    },

    async deleteTicket(id: string) {
      this.tickets = this.tickets.filter((t) => t.id !== id)
      await this.persist()
    },

    async addComment(ticketId: string, text: string, author: string, isAI = false, parentId: string | null = null) {
      const ticket = this.tickets.find(t => t.id === ticketId)
      if (!ticket) return
      const comment: Comment = {
        id: generateId(),
        text,
        author,
        isAI,
        parentId,
        likes: 0,
        createdAt: nowISO(),
      }
      if (!ticket.comments) ticket.comments = []
      ticket.comments.push(comment)
      ticket.updatedAt = nowISO()
      await this.persist()
    },

    async persist() {
      if (!this.projectPath) return
      const { useVindictaJson } = await import('~/composables/useVindictaJson')
      const { patchTickets } = useVindictaJson()
      await patchTickets(this.projectPath, this.tickets)
    },
  },
})

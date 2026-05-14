import { Marked } from 'marked'
import type { Tokens } from 'marked'

const SAFE_URL_SCHEMES = new Set(['http:', 'https:', 'mailto:'])

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function safeUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed || /[\u0000-\u001f\u007f\s]/.test(trimmed)) return ''
  if (trimmed.startsWith('#') || trimmed.startsWith('/') || trimmed.startsWith('./') || trimmed.startsWith('../')) {
    return trimmed
  }

  try {
    const parsed = new URL(trimmed)
    return SAFE_URL_SCHEMES.has(parsed.protocol) ? trimmed : ''
  }
  catch {
    return ''
  }
}

const markdown = new Marked({
  gfm: true,
  breaks: true,
  renderer: {
    html({ text }: Tokens.HTML | Tokens.Tag) {
      return escapeHtml(text)
    },
    link({ href, title, tokens }: Tokens.Link) {
      const safeHref = safeUrl(href)
      const label = this.parser.parseInline(tokens)
      if (!safeHref) return label
      const safeTitle = title ? ` title="${escapeHtml(title)}"` : ''
      return `<a href="${escapeHtml(safeHref)}"${safeTitle} rel="noreferrer">${label}</a>`
    },
    image({ href, title, text }: Tokens.Image) {
      const safeHref = safeUrl(href)
      if (!safeHref) return escapeHtml(text)
      const safeTitle = title ? ` title="${escapeHtml(title)}"` : ''
      return `<img src="${escapeHtml(safeHref)}" alt="${escapeHtml(text)}"${safeTitle}>`
    },
  },
})

export function renderMarkdown(value: string) {
  const md = value.trim()
  return md ? markdown.parse(md, { async: false }) : ''
}


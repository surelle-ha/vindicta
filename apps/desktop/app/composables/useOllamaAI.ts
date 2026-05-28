interface OllamaChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface OllamaChatOptions {
  url: string
  model: string
  messages: OllamaChatMessage[]
}

export async function runOllamaChat(opts: OllamaChatOptions): Promise<string> {
  const baseUrl = (opts.url || 'http://localhost:11434').replace(/\/$/, '')

  const response = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: opts.model || 'llama3.2',
      messages: opts.messages,
      temperature: 0.4,
    }),
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(detail || `Ollama returned HTTP ${response.status}. Is Ollama running at ${baseUrl}?`)
  }

  const data = await response.json()
  const text = data?.choices?.[0]?.message?.content
  if (typeof text !== 'string' || !text.trim()) {
    throw new Error('Ollama returned an empty response.')
  }

  return text
}

interface CodexExecResult {
  code: number | null
  stdout: string
  stderr: string
  tokenUsage: {
    inputTokens: number
    outputTokens: number
    totalTokens: number
  }
}

interface CodexExecOptions {
  prompt: string
  projectPath: string
  model?: string
  reasoningEffort?: 'low' | 'medium' | 'high' | 'xhigh'
  sandbox?: 'read-only' | 'workspace-write'
}

function isWindowsPath(path: string) {
  return path.includes('\\') || /^[A-Za-z]:/.test(path)
}

function estimateTokens(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return 0
  return Math.max(1, Math.ceil(trimmed.length / 4))
}

export async function runCodexExec(opts: CodexExecOptions): Promise<CodexExecResult> {
  const { Command } = await import('@tauri-apps/plugin-shell')
  const fs = useTauriFs()
  const isWin = isWindowsPath(opts.projectPath)
  const basePath = isWin ? opts.projectPath.replace(/\//g, '\\') : opts.projectPath
  const stamp = Date.now()
  const outputFile = `${basePath}${sep}.vindicta_codex_output_${stamp}.txt`
  const sandbox = opts.sandbox ?? 'read-only'

  try {
    const reasoningEffort = opts.reasoningEffort ?? 'medium'
    const effortArgs = ['-c', `model_reasoning_effort="${reasoningEffort}"`]
    const args = [
      'exec',
      ...effortArgs,
      '-C',
      basePath,
      '--skip-git-repo-check',
      '--sandbox',
      sandbox,
      '--color',
      'never',
      '-o',
      outputFile,
      opts.prompt,
    ]

    const output = await Command.create('codex-exec', args, { cwd: basePath }).execute()

    const finalMessage = await fs.readTextFile(outputFile).catch(() => '')
    const responseText = finalMessage || output.stdout || output.stderr
    const tokenUsage = {
      inputTokens: estimateTokens(opts.prompt),
      outputTokens: estimateTokens(responseText),
      totalTokens: estimateTokens(opts.prompt) + estimateTokens(responseText),
    }

    try {
      await useUserStore().recordTokenUsage({
        ...tokenUsage,
        tool: 'Codex',
        model: opts.model || (opts.reasoningEffort ? `Codex CLI default (${opts.reasoningEffort} effort)` : 'Codex CLI default'),
        prompt: opts.prompt,
      })
    }
    catch { /* token usage tracking should never block Codex work */ }

    return {
      code: output.code,
      stdout: finalMessage || output.stdout,
      stderr: output.stderr,
      tokenUsage,
    }
  }
  finally {
    fs.removeFile(outputFile).catch(() => {})
  }
}

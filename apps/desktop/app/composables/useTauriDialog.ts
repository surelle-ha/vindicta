export function useTauriDialog() {
  async function openDirectory(): Promise<string | null> {
    const { open } = await import('@tauri-apps/plugin-dialog')
    const selected = await open({
      directory: true,
      multiple: false,
      title: 'Select project folder',
    })
    return typeof selected === 'string' ? selected : null
  }

  async function openFile(filters?: { name: string; extensions: string[] }[]): Promise<string | null> {
    const { open } = await import('@tauri-apps/plugin-dialog')
    const selected = await open({
      multiple: false,
      filters,
    })
    return typeof selected === 'string' ? selected : null
  }

  async function saveFile(options?: { title?: string; defaultPath?: string; filters?: { name: string; extensions: string[] }[] }): Promise<string | null> {
    const { save } = await import('@tauri-apps/plugin-dialog')
    const selected = await save({
      title: options?.title,
      defaultPath: options?.defaultPath,
      filters: options?.filters,
    })
    return typeof selected === 'string' ? selected : null
  }

  return { openDirectory, openFile, saveFile }
}

interface FsEntry {
  name: string
  path: string
  isDir: boolean
  children?: FsEntry[]
}

export function useTauriFs() {
  async function readTextFile(path: string): Promise<string> {
    const { readTextFile } = await import('@tauri-apps/plugin-fs')
    return readTextFile(path)
  }

  async function writeTextFile(path: string, content: string): Promise<void> {
    const { writeTextFile } = await import('@tauri-apps/plugin-fs')
    return writeTextFile(path, content)
  }

  async function writeFile(path: string, content: Uint8Array): Promise<void> {
    const { writeFile } = await import('@tauri-apps/plugin-fs')
    return writeFile(path, content)
  }

  async function exists(path: string): Promise<boolean> {
    const { exists } = await import('@tauri-apps/plugin-fs')
    return exists(path)
  }

  async function readDir(dirPath: string): Promise<FsEntry[]> {
    const { readDir } = await import('@tauri-apps/plugin-fs')
    const raw = await readDir(dirPath)
    const sep = dirPath.includes('\\') ? '\\' : '/'
    return (raw as any[])
      .filter(e => e.name)
      .map(e => ({
        name: e.name as string,
        path: `${dirPath}${sep}${e.name}`,
        isDir: !!(e.isDirectory ?? false),
      }))
      .sort((a: FsEntry, b: FsEntry) => {
        if (a.isDir !== b.isDir) return a.isDir ? -1 : 1
        return a.name.localeCompare(b.name)
      })
  }

  async function removeFile(path: string): Promise<void> {
    const { remove } = await import('@tauri-apps/plugin-fs')
    return remove(path)
  }

  return { readTextFile, writeTextFile, writeFile, exists, readDir, removeFile }
}

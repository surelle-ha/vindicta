let _win: any = null

export function useTauriWindow() {
  async function getWin() {
    if (_win) return _win
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window')
      _win = getCurrentWindow()
    }
    catch { /* browser / dev mode without Tauri */ }
    return _win
  }

  return {
    close: () => getWin().then((w) => w?.close()),
    minimize: () => getWin().then((w) => w?.minimize()),
    toggleMaximize: () => getWin().then((w) => w?.toggleMaximize()),
  }
}

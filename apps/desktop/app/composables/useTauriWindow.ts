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

  async function forceClose() {
    const win = await getWin()
    if (win) await win.close()
  }

  async function hideWindow() {
    const win = await getWin()
    if (win) await win.hide()
  }

  return {
    forceClose,
    hideWindow,
    minimize: () => getWin().then((w) => w?.minimize()),
    toggleMaximize: () => getWin().then((w) => w?.toggleMaximize()),
  }
}

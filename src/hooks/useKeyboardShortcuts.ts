import { useEffect } from 'react'
import { useProjectStore } from '../stores/projectStore'

function isTypingTarget(e: KeyboardEvent): boolean {
  const t = e.target as HTMLElement | null
  if (!t) return false
  return (
    t instanceof HTMLInputElement ||
    t instanceof HTMLSelectElement ||
    t instanceof HTMLTextAreaElement ||
    t.isContentEditable
  )
}

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const store = useProjectStore.getState()
      const mod = e.metaKey || e.ctrlKey
      const key = e.key.toLowerCase()

      if (e.key === 'Escape') {
        if (store.showOrthographicView) {
          store.toggleOrthographicView()
          return
        }
        if (store.showShortcuts) {
          store.setShowShortcuts(false)
          return
        }
        if (!isTypingTarget(e)) store.selectPiece(null)
        return
      }

      if (isTypingTarget(e)) return

      if (mod && key === 's') {
        e.preventDefault()
        if (store.currentProject) store.markSaved()
        return
      }

      if (mod && key === 'z') {
        e.preventDefault()
        if (e.shiftKey) store.redo()
        else store.undo()
        return
      }

      if (mod) return

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (store.selectedPieceId) {
          e.preventDefault()
          store.deletePiece(store.selectedPieceId)
        }
        return
      }

      if (key === 'w') store.setTransformMode('translate')
      if (key === 'e') store.setTransformMode('rotate')
      if (key === 'r') store.setTransformMode('scale')
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])
}

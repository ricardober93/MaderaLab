import { useProjectStore } from '../stores/projectStore'

const SHORTCUTS: { keys: string; desc: string }[] = [
  { keys: 'W', desc: 'Modo mover' },
  { keys: 'E', desc: 'Modo rotar' },
  { keys: 'R', desc: 'Modo escalar' },
  { keys: 'Delete / ⌫', desc: 'Eliminar pieza seleccionada' },
  { keys: 'Ctrl+Z', desc: 'Deshacer (⌘Z en Mac)' },
  { keys: 'Ctrl+Shift+Z', desc: 'Rehacer (⌘Shift+Z en Mac)' },
  { keys: 'Ctrl+S', desc: 'Guardar (⌘S en Mac)' },
  { keys: 'Esc', desc: 'Deseleccionar / cerrar vista' },
]

export function ShortcutsModal() {
  const showShortcuts = useProjectStore((s) => s.showShortcuts)
  const setShowShortcuts = useProjectStore((s) => s.setShowShortcuts)

  if (!showShortcuts) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={() => setShowShortcuts(false)}
    >
      <div
        className="bg-white rounded-xl shadow-xl p-6 w-[380px] max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Atajos de teclado"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Atajos de teclado</h2>
          <button
            onClick={() => setShowShortcuts(false)}
            className="text-neutral-400 hover:text-neutral-700 text-xl leading-none"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        <ul className="flex flex-col gap-1.5">
          {SHORTCUTS.map(({ keys, desc }) => (
            <li key={keys} className="flex items-center justify-between text-sm py-1 border-b border-neutral-100 last:border-0">
              <span className="text-neutral-600">{desc}</span>
              <kbd className="px-2 py-0.5 text-xs font-mono bg-neutral-100 border border-neutral-300 rounded">
                {keys}
              </kbd>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

import { useProjectStore } from '../stores/projectStore'

const KIND_LABELS: Record<string, string> = {
  lateral: 'Laterales',
  entepano: 'Entrepaños',
  repisa: 'Repisas',
  fondo: 'Fondo',
  tapa: 'Tapa',
  base: 'Base',
  cajon_frente: 'Frentes de cajón',
  cajon_lateral: 'Laterales de cajón',
  cajon_fondo: 'Fondos de cajón',
  cajon_base: 'Bases de cajón',
  puerta: 'Puertas',
  pata: 'Patas',
}

export function PiecesList() {
  const project = useProjectStore((s) => s.currentProject)
  const selectedPieceId = useProjectStore((s) => s.selectedPieceId)
  const selectPiece = useProjectStore((s) => s.selectPiece)

  if (!project) return null

  const grouped = new Map<string, typeof project.pieces>()
  for (const p of project.pieces) {
    const group = grouped.get(p.kind) || []
    group.push(p)
    grouped.set(p.kind, group)
  }

  const orderedKinds = Object.keys(KIND_LABELS).filter((k) => grouped.has(k))

  return (
    <div className="flex flex-col gap-2 overflow-y-auto h-full">
      <h2 className="text-lg font-semibold border-b border-neutral-200 pb-2 px-4 pt-4">Piezas</h2>

      {orderedKinds.map((kind) => {
        const pieces = grouped.get(kind)!
        const label = KIND_LABELS[kind] || kind

        return (
          <div key={kind}>
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 mt-2">{label}</p>
            {pieces.map((p) => {
              const isSelected = p.id === selectedPieceId
              const cd = p.cutDimension || { largo: 0, ancho: 0, grosor: 0 }

              return (
                <button
                  key={p.id}
                  className={`w-full text-left px-4 py-1.5 text-sm hover:bg-neutral-100 transition-colors ${
                    isSelected ? 'bg-blue-50 text-blue-700' : 'text-neutral-700'
                  }`}
                  onClick={() => selectPiece(p.id)}
                >
                  <span className="font-medium">{p.nombre}</span>
                  <span className="text-xs text-neutral-400 ml-2">{cd.largo}×{cd.ancho}×{cd.grosor}</span>
                </button>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
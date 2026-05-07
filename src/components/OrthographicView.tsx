import { useProjectStore } from '../stores/projectStore'
import { computeFrontalView, computeLateralView, computeTopView } from '../lib/orthographic'
import type { OrthographicViewData } from '../lib/orthographic'

const KIND_COLORS: Record<string, string> = {
  lateral: '#93c5fd',
  entepano: '#86efac',
  repisa: '#86efac',
  fondo: '#fde68a',
  tapa: '#c4b5fd',
  base: '#c4b5fd',
  cajon_frente: '#fca5a5',
  cajon_lateral: '#fca5a5',
  cajon_fondo: '#fca5a5',
  cajon_base: '#fca5a5',
  puerta: '#fdba74',
  pata: '#d1d5db',
}

const SVG_W = 380
const SVG_H = 280
const PADDING = 45

function ViewSVG({ data, label }: { data: OrthographicViewData; label: string }) {
  const { rects, dims, boundsX, boundsY } = data
  if (boundsX === 0 || boundsY === 0) return null

  const dimMargin = 40
  const drawW = SVG_W - PADDING * 2 - dimMargin
  const drawH = SVG_H - PADDING * 2 - dimMargin
  const scale = Math.min(drawW / boundsX, drawH / boundsY)

  const offsetX = PADDING
  const offsetY = PADDING

  function tx(x: number) { return offsetX + x * scale }
  function ty(y: number) { return offsetY + (boundsY - y) * scale }

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-sm font-semibold text-neutral-700 mb-1">{label}</h3>
      <svg width={SVG_W} height={SVG_H} className="border border-neutral-300 bg-white rounded">
        {rects.map((r, i) => (
          <rect
            key={i}
            x={tx(r.x)}
            y={ty(r.y + r.h)}
            width={r.w * scale}
            height={r.h * scale}
            fill={KIND_COLORS[r.kind] || '#e5e7eb'}
            stroke="#374151"
            strokeWidth={0.8}
          />
        ))}
        {dims.map((d, i) => {
          const tickLen = 4
          if (d.horizontal) {
            const y = ty(d.y1)
            const x1 = tx(d.x1)
            const x2 = tx(d.x2)
            return (
              <g key={`d${i}`}>
                <line x1={x1} y1={y} x2={x2} y2={y} stroke="#dc2626" strokeWidth={0.6} />
                <line x1={x1} y1={y - tickLen} x2={x1} y2={y + tickLen} stroke="#dc2626" strokeWidth={0.6} />
                <line x1={x2} y1={y - tickLen} x2={x2} y2={y + tickLen} stroke="#dc2626" strokeWidth={0.6} />
                <text x={(x1 + x2) / 2} y={y - 4} textAnchor="middle" fontSize={8} fill="#dc2626" fontFamily="sans-serif">
                  {d.value} mm
                </text>
              </g>
            )
          } else {
            const x = tx(d.x1)
            const y1 = ty(d.y1)
            const y2 = ty(d.y2)
            return (
              <g key={`d${i}`}>
                <line x1={x} y1={y1} x2={x} y2={y2} stroke="#dc2626" strokeWidth={0.6} />
                <line x1={x - tickLen} y1={y1} x2={x + tickLen} y2={y1} stroke="#dc2626" strokeWidth={0.6} />
                <line x1={x - tickLen} y1={y2} x2={x + tickLen} y2={y2} stroke="#dc2626" strokeWidth={0.6} />
                <text
                  x={x + 6}
                  y={(y1 + y2) / 2 + 3}
                  textAnchor="start"
                  fontSize={8}
                  fill="#dc2626"
                  fontFamily="sans-serif"
                >
                  {d.value} mm
                </text>
              </g>
            )
          }
        })}
      </svg>
    </div>
  )
}

export function OrthographicView() {
  const project = useProjectStore((s) => s.currentProject)
  const toggleOrthographicView = useProjectStore((s) => s.toggleOrthographicView)

  if (!project) return null

  const views = [
    { label: 'Vista Frontal', data: computeFrontalView(project.pieces) },
    { label: 'Vista Lateral', data: computeLateralView(project.pieces) },
    { label: 'Vista Superior', data: computeTopView(project.pieces) },
  ]

  return (
    <div className="fixed inset-0 z-50 bg-white/95 flex flex-col">
      <div className="flex items-center justify-between px-6 py-3 border-b border-neutral-200 bg-white">
        <h2 className="text-lg font-bold text-neutral-800">Vistas 2D acotadas — {project.nombre}</h2>
        <button
          onClick={toggleOrthographicView}
          className="px-4 py-1.5 bg-neutral-800 text-white rounded text-sm hover:bg-neutral-700"
        >
          Cerrar
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center gap-6 p-6 overflow-auto">
        {views.map((v) => (
          <ViewSVG key={v.label} data={v.data} label={v.label} />
        ))}
      </div>
    </div>
  )
}
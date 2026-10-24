import { useEffect, useRef, useState } from 'react'
import { useProjectStore } from '../stores/projectStore'

const TOUR_KEY = 'maderalab_onboarding_done'

interface TourStep {
  target: string
  title: string
  text: string
  placement: 'right' | 'left' | 'bottom'
}

const STEPS: TourStep[] = [
  {
    target: 'config',
    title: '1 · Elige el tipo de mueble',
    text: 'Estantería, mesita, mesa, cocina o cajonera. Las piezas y herrajes se generan y regeneran automáticamente.',
    placement: 'right',
  },
  {
    target: 'config',
    title: '2 · Ajusta las dimensiones',
    text: 'Cambia ancho, alto y profundidad dentro del rango permitido. Cada cambio recalcula la lista de corte.',
    placement: 'right',
  },
  {
    target: 'props',
    title: '3 · Personaliza y ajusta',
    text: 'Selecciona una pieza en la escena para pintarla, cambiar su material o moverla, rotarla y escalarla.',
    placement: 'left',
  },
  {
    target: 'toolbar',
    title: '4 · Exporta para construir',
    text: 'Descarga el PDF con vistas 2D y lista de corte, el CSV para el aserradero o un JSON para respaldar el proyecto.',
    placement: 'bottom',
  },
]

interface CardPos {
  top: number
  left: number
  width: number
}

function computeCardPos(target: HTMLElement | null, placement: TourStep['placement']): CardPos {
  const cardW = 300
  if (!target) {
    return {
      top: Math.max(90, window.innerHeight * 0.25),
      left: Math.max(16, (window.innerWidth - cardW) / 2),
      width: cardW,
    }
  }
  const r = target.getBoundingClientRect()
  const margin = 12

  if (placement === 'right') {
    return { top: Math.max(70, r.top), left: r.right + margin, width: cardW }
  }
  if (placement === 'left') {
    return { top: Math.max(70, r.top), left: Math.max(16, r.left - cardW - margin), width: cardW }
  }
  const top = Math.min(window.innerHeight - 190, r.bottom + margin)
  return {
    top: Math.max(70, top),
    left: Math.max(16, Math.min(window.innerWidth - cardW - 16, r.left)),
    width: cardW,
  }
}

export function OnboardingTour() {
  const currentProject = useProjectStore((s) => s.currentProject)
  const [visible, setVisible] = useState(() => {
    try {
      return currentProject !== null && localStorage.getItem(TOUR_KEY) !== '1'
    } catch {
      return false
    }
  })
  const [step, setStep] = useState(0)
  const [pos, setPos] = useState<CardPos | null>(null)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const [hasTarget, setHasTarget] = useState(false)

  const wasVisible = useRef(false)
  useEffect(() => {
    if (visible) {
      wasVisible.current = true
      return
    }
    if (wasVisible.current) {
      try {
        localStorage.setItem(TOUR_KEY, '1')
      } catch {
        return
      }
    }
  }, [visible])

  const ready = visible
  const current = STEPS[step]

  useEffect(() => {
    if (!ready) return
    const measure = () => {
      const el = document.querySelector<HTMLElement>(`[data-tour="${current.target}"]`)
      setRect(el ? el.getBoundingClientRect() : null)
      setHasTarget(Boolean(el))
      setPos(computeCardPos(el, current.placement))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [ready, step, current.target, current.placement])

  useEffect(() => {
    if (!ready) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setVisible(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [ready])

  if (!visible || !pos) return null

  const isLast = step === STEPS.length - 1

  return (
    <div className="fixed inset-0 z-40 bg-black/40">
      {hasTarget && rect && (
        <div
          className="fixed z-40 rounded-lg ring-2 ring-blue-400 ring-offset-0 pointer-events-none transition-all duration-200"
          style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
        />
      )}
      <div
        className="fixed z-50 bg-white rounded-lg shadow-2xl p-5"
        style={{ top: pos.top, left: pos.left, width: pos.width }}
        role="dialog"
        aria-label="Guía de primer uso"
      >
        <h3 className="text-base font-semibold text-neutral-800 mb-2">{current.title}</h3>
        <p className="text-sm text-neutral-600 leading-relaxed">{current.text}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="flex gap-1">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full ${i === step ? 'bg-blue-600' : 'bg-neutral-300'}`}
              />
            ))}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setVisible(false)}
              className="px-3 py-1.5 text-sm text-neutral-500 hover:text-neutral-700"
            >
              Saltar
            </button>
            <button
              onClick={() => (isLast ? setVisible(false) : setStep(step + 1))}
              className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 font-medium"
            >
              {isLast ? 'Empezar a diseñar' : 'Siguiente'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

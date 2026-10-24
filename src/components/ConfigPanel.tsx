import { useState } from 'react'
import { useProjectStore } from '../stores/projectStore'
import { DIMENSION_LIMITS, GROSORES_ESTANDAR, type FurnitureType } from '../types'

const FURNITURE_LABELS: Record<FurnitureType, string> = {
  estanteria: 'Estantería',
  mesita: 'Mesita de noche',
  mesa: 'Mesa',
  cocina: 'Mueble de cocina',
  cajonera: 'Cajonera',
}

const inputBase =
  'w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2'
const inputOk = `${inputBase} border-neutral-300 focus:border-blue-400 focus:ring-blue-100`
const inputErr = `${inputBase} border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-100 text-red-900`

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v))
}

function formatNumber(v: number): string {
  return String(v)
}

export function ConfigPanel() {
  const project = useProjectStore((s) => s.currentProject)
  const updateConfig = useProjectStore((s) => s.updateConfig)

  if (!project) return <div className="p-4 text-neutral-400">Sin proyecto activo</div>

  const { config } = project

  return (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto h-full" data-tour="config">
      <h2 className="text-lg font-semibold border-b border-neutral-200 pb-2">Configuración</h2>

      <div>
        <label className="block text-sm font-medium text-neutral-600 mb-1">Tipo de mueble</label>
        <select
          className={inputOk}
          value={config.tipo}
          onChange={(e) => updateConfig({ tipo: e.target.value as FurnitureType })}
        >
          {Object.entries(FURNITURE_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      <DimensionField
        label="Ancho"
        value={config.ancho}
        min={DIMENSION_LIMITS.ancho.min}
        max={DIMENSION_LIMITS.ancho.max}
        onCommit={(v) => updateConfig({ ancho: v })}
      />

      <DimensionField
        label="Alto"
        value={config.alto}
        min={DIMENSION_LIMITS.alto.min}
        max={DIMENSION_LIMITS.alto.max}
        onCommit={(v) => updateConfig({ alto: v })}
      />

      <DimensionField
        label="Profundidad"
        value={config.profundidad}
        min={DIMENSION_LIMITS.profundidad.min}
        max={DIMENSION_LIMITS.profundidad.max}
        onCommit={(v) => updateConfig({ profundidad: v })}
      />

      <div>
        <label className="block text-sm font-medium text-neutral-600 mb-1">Grosor del tablero</label>
        <select
          className={inputOk}
          value={config.grosor}
          onChange={(e) => updateConfig({ grosor: Number(e.target.value) })}
        >
          {GROSORES_ESTANDAR.map((g) => (
            <option key={g} value={g}>{g} mm</option>
          ))}
        </select>
      </div>

      {config.tipo === 'estanteria' && (
        <>
          <CountField
            label="Entrepaños"
            value={config.entrepanos}
            min={0}
            max={10}
            onCommit={(v) => updateConfig({ entrepanos: v })}
          />
          <CountField
            label="Repisas"
            value={config.repisas}
            min={0}
            max={20}
            onCommit={(v) => updateConfig({ repisas: v })}
          />
        </>
      )}

      {(config.tipo === 'mesita' || config.tipo === 'cajonera' || config.tipo === 'cocina') && (
        <CountField
          label="Cajones"
          value={config.cajones}
          min={0}
          max={8}
          onCommit={(v) => updateConfig({ cajones: v })}
        />
      )}

      {config.tipo === 'cocina' && (
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-neutral-600">
            <input
              type="checkbox"
              checked={config.tienePuertas}
              onChange={(e) => updateConfig({ tienePuertas: e.target.checked })}
            />
            Puertas
          </label>
        </div>
      )}

      {(config.tipo === 'mesita' || config.tipo === 'cajonera') && (
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-neutral-600">
            <input
              type="checkbox"
              checked={config.usaPatas}
              onChange={(e) =>
                updateConfig({ usaPatas: e.target.checked, cantidadPatas: e.target.checked ? 4 : 0 })
              }
            />
            Usar patas
          </label>
        </div>
      )}
    </div>
  )
}

interface NumberFieldProps {
  label: string
  value: number
  min: number
  max: number
  onCommit: (v: number) => void
}

function useFieldText(value: number, focused: boolean): [string, (v: string) => void] {
  const [text, setText] = useState(formatNumber(value))
  const [prevValue, setPrevValue] = useState(value)
  if (!focused && value !== prevValue) {
    setPrevValue(value)
    setText(formatNumber(value))
  }
  return [text, setText]
}

function DimensionField({ label, value, min, max, onCommit }: NumberFieldProps) {
  const [focused, setFocused] = useState(false)
  const [text, setText] = useFieldText(value, focused)

  const num = Number(text)
  const empty = text === '' || !Number.isFinite(num)
  const invalid = empty || num < min || num > max
  const errorId = `err-${label}`

  const handleBlur = () => {
    setFocused(false)
    if (empty) {
      setText(formatNumber(value))
      return
    }
    if (num < min || num > max) {
      const clamped = clamp(num, min, max)
      setText(formatNumber(clamped))
      if (clamped !== value) onCommit(clamped)
      return
    }
    if (num !== value) onCommit(num)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-neutral-600 mb-1">
        {label} ({min}–{max} mm)
      </label>
      <input
        type="number"
        className={invalid && !empty ? inputErr : inputOk}
        value={text}
        min={min}
        max={max}
        step={10}
        aria-invalid={invalid && !empty}
        aria-describedby={invalid && !empty ? errorId : undefined}
        onChange={(e) => {
          setText(e.target.value)
          const n = Number(e.target.value)
          if (
            e.target.value !== '' &&
            Number.isFinite(n) &&
            n >= min &&
            n <= max &&
            n !== value
          ) {
            onCommit(n)
          }
        }}
        onFocus={() => setFocused(true)}
        onBlur={handleBlur}
      />
      {invalid && !empty && (
        <p id={errorId} className="mt-1 text-xs text-red-600">
          El valor debe estar entre {min} y {max} mm
        </p>
      )}
    </div>
  )
}

function CountField({ label, value, min, max, onCommit }: NumberFieldProps) {
  const [focused, setFocused] = useState(false)
  const [text, setText] = useFieldText(value, focused)

  const commitClamped = () => {
    let num = Number(text)
    if (text === '' || !Number.isFinite(num)) num = value
    num = Math.round(clamp(num, min, max))
    setText(formatNumber(num))
    if (num !== value) onCommit(num)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-neutral-600 mb-1">{label}</label>
      <input
        type="number"
        className={inputOk}
        value={text}
        min={min}
        max={max}
        step={1}
        onChange={(e) => {
          setText(e.target.value)
          const n = Number(e.target.value)
          if (
            e.target.value !== '' &&
            Number.isFinite(n) &&
            n >= min &&
            n <= max &&
            Math.round(n) !== value
          ) {
            onCommit(Math.round(n))
          }
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false)
          commitClamped()
        }}
      />
    </div>
  )
}

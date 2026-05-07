import { useProjectStore } from '../stores/projectStore'
import { DIMENSION_LIMITS, GROSORES_ESTANDAR, type FurnitureType } from '../types'

const FURNITURE_LABELS: Record<FurnitureType, string> = {
  estanteria: 'Estantería',
  mesita: 'Mesita de noche',
  mesa: 'Mesa',
  cocina: 'Mueble de cocina',
  cajonera: 'Cajonera',
}

export function ConfigPanel() {
  const project = useProjectStore((s) => s.currentProject)
  const updateConfig = useProjectStore((s) => s.updateConfig)

  if (!project) return <div className="p-4 text-neutral-400">Sin proyecto activo</div>

  const { config } = project

  return (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto h-full">
      <h2 className="text-lg font-semibold border-b border-neutral-200 pb-2">Configuración</h2>

      <div>
        <label className="block text-sm font-medium text-neutral-600 mb-1">Tipo de mueble</label>
        <select
          className="w-full border border-neutral-300 rounded px-2 py-1.5 text-sm"
          value={config.tipo}
          onChange={(e) => updateConfig({ tipo: e.target.value as FurnitureType })}
        >
          {Object.entries(FURNITURE_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-600 mb-1">
          Ancho ({DIMENSION_LIMITS.ancho.min}–{DIMENSION_LIMITS.ancho.max} mm)
        </label>
        <input
          type="number"
          className="w-full border border-neutral-300 rounded px-2 py-1.5 text-sm"
          value={config.ancho}
          min={DIMENSION_LIMITS.ancho.min}
          max={DIMENSION_LIMITS.ancho.max}
          onChange={(e) => updateConfig({ ancho: Number(e.target.value) })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-600 mb-1">
          Alto ({DIMENSION_LIMITS.alto.min}–{DIMENSION_LIMITS.alto.max} mm)
        </label>
        <input
          type="number"
          className="w-full border border-neutral-300 rounded px-2 py-1.5 text-sm"
          value={config.alto}
          min={DIMENSION_LIMITS.alto.min}
          max={DIMENSION_LIMITS.alto.max}
          onChange={(e) => updateConfig({ alto: Number(e.target.value) })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-600 mb-1">
          Profundidad ({DIMENSION_LIMITS.profundidad.min}–{DIMENSION_LIMITS.profundidad.max} mm)
        </label>
        <input
          type="number"
          className="w-full border border-neutral-300 rounded px-2 py-1.5 text-sm"
          value={config.profundidad}
          min={DIMENSION_LIMITS.profundidad.min}
          max={DIMENSION_LIMITS.profundidad.max}
          onChange={(e) => updateConfig({ profundidad: Number(e.target.value) })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-600 mb-1">Grosor del tablero</label>
        <select
          className="w-full border border-neutral-300 rounded px-2 py-1.5 text-sm"
          value={config.grosor}
          onChange={(e) => updateConfig({ grosor: Number(e.target.value) })}
        >
          {GROSORES_ESTANDAR.map((g) => (
            <option key={g} value={g}>{g} mm</option>
          ))}
        </select>
      </div>

      {(config.tipo === 'estanteria') && (
        <>
          <div>
            <label className="block text-sm font-medium text-neutral-600 mb-1">Entrepaños</label>
            <input
              type="number"
              className="w-full border border-neutral-300 rounded px-2 py-1.5 text-sm"
              value={config.entrepanos}
              min={0}
              max={10}
              onChange={(e) => updateConfig({ entrepanos: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-600 mb-1">Repisas</label>
            <input
              type="number"
              className="w-full border border-neutral-300 rounded px-2 py-1.5 text-sm"
              value={config.repisas}
              min={0}
              max={20}
              onChange={(e) => updateConfig({ repisas: Number(e.target.value) })}
            />
          </div>
        </>
      )}

      {(config.tipo === 'mesita' || config.tipo === 'cajonera' || config.tipo === 'cocina') && (
        <div>
          <label className="block text-sm font-medium text-neutral-600 mb-1">Cajones</label>
          <input
            type="number"
            className="w-full border border-neutral-300 rounded px-2 py-1.5 text-sm"
            value={config.cajones}
            min={0}
            max={8}
            onChange={(e) => updateConfig({ cajones: Number(e.target.value) })}
          />
        </div>
      )}

      {(config.tipo === 'cocina') && (
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
              onChange={(e) => updateConfig({ usaPatas: e.target.checked, cantidadPatas: e.target.checked ? 4 : 0 })}
            />
            Usar patas
          </label>
        </div>
      )}
    </div>
  )
}
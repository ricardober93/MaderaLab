import { useProjectStore } from '../stores/projectStore'
import { MATERIALES, PALETA_COLORES } from '../data/catalogs'
import type { Position, Rotation, Scale } from '../types'

export function PropertiesPanel() {
  const project = useProjectStore((s) => s.currentProject)
  const selectedPieceId = useProjectStore((s) => s.selectedPieceId)
  const updatePieceMaterial = useProjectStore((s) => s.updatePieceMaterial)
  const updatePieceColor = useProjectStore((s) => s.updatePieceColor)
  const updatePiecePosition = useProjectStore((s) => s.updatePiecePosition)
  const updatePieceRotation = useProjectStore((s) => s.updatePieceRotation)
  const updatePieceScale = useProjectStore((s) => s.updatePieceScale)
  const resetPieceTransform = useProjectStore((s) => s.resetPieceTransform)
  const updateAllMaterials = useProjectStore((s) => s.updateAllMaterials)
  const updateAllColors = useProjectStore((s) => s.updateAllColors)

  if (!project) return <div className="p-4 text-neutral-400">Sin proyecto</div>

  const selectedPiece = project.pieces.find((p) => p.id === selectedPieceId)

  if (!selectedPiece) {
    return (
      <div className="p-4">
        <h2 className="text-lg font-semibold border-b border-neutral-200 pb-2 mb-4">Propiedades</h2>
        <p className="text-sm text-neutral-400">Selecciona una pieza</p>

        <div className="mt-6">
          <h3 className="text-sm font-medium text-neutral-600 mb-2">Material para todas</h3>
          <select
            className="w-full border border-neutral-300 rounded px-2 py-1.5 text-sm"
            value=""
            onChange={(e) => {
              if (e.target.value) updateAllMaterials(e.target.value)
            }}
          >
            <option value="">— Cambiar todo —</option>
            {MATERIALES.map((m) => (
              <option key={m.id} value={m.id}>{m.nombre}</option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-medium text-neutral-600 mb-2">Color para todas</h3>
          <div className="grid grid-cols-6 gap-1.5">
            {PALETA_COLORES.map((c) => (
              <button
                key={c}
                className="w-6 h-6 rounded border border-neutral-300 cursor-pointer hover:scale-110 transition-transform"
                style={{ backgroundColor: c }}
                onClick={() => updateAllColors(c)}
              />
            ))}
          </div>
          <input
            type="color"
            className="w-full mt-2 h-8 cursor-pointer"
            onChange={(e) => updateAllColors(e.target.value)}
          />
        </div>
      </div>
    )
  }

  const cd = selectedPiece.cutDimension || { largo: 0, ancho: 0, grosor: 0 }

  const deg = (rad: number) => Math.round((rad * 180) / Math.PI * 10) / 10
  const rad = (degVal: number) => (degVal * Math.PI) / 180

  const updatePos = (axis: keyof Position, value: number) => {
    updatePiecePosition(selectedPiece.id, { ...selectedPiece.position, [axis]: value })
  }
  const updateRot = (axis: keyof Rotation, valueDeg: number) => {
    updatePieceRotation(selectedPiece.id, { ...selectedPiece.rotation, [axis]: rad(valueDeg) })
  }
  const updateScl = (axis: keyof Scale, value: number) => {
    updatePieceScale(selectedPiece.id, { ...selectedPiece.scale, [axis]: value })
  }

  return (
    <div className="p-4 flex flex-col gap-4 overflow-y-auto h-full">
      <h2 className="text-lg font-semibold border-b border-neutral-200 pb-2">Propiedades</h2>

      <div>
        <p className="text-sm font-medium text-neutral-600">Nombre</p>
        <p className="text-sm">{selectedPiece.nombre}</p>
      </div>

      <div>
        <p className="text-sm font-medium text-neutral-600">Dimensiones (plano)</p>
        <p className="text-sm">{cd.largo} x {cd.ancho} x {cd.grosor} mm</p>
      </div>

      <div>
        <p className="text-sm font-medium text-neutral-600 mb-1">Posicion (mm)</p>
        <div className="grid grid-cols-3 gap-1">
          <NumberInput label="X" value={Math.round(selectedPiece.position.x)} onChange={(v) => updatePos('x', v)} />
          <NumberInput label="Y" value={Math.round(selectedPiece.position.y)} onChange={(v) => updatePos('y', v)} />
          <NumberInput label="Z" value={Math.round(selectedPiece.position.z)} onChange={(v) => updatePos('z', v)} />
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-neutral-600 mb-1">Rotacion (grados)</p>
        <div className="grid grid-cols-3 gap-1">
          <NumberInput label="X" value={deg(selectedPiece.rotation.x)} onChange={(v) => updateRot('x', v)} step={5} />
          <NumberInput label="Y" value={deg(selectedPiece.rotation.y)} onChange={(v) => updateRot('y', v)} step={5} />
          <NumberInput label="Z" value={deg(selectedPiece.rotation.z)} onChange={(v) => updateRot('z', v)} step={5} />
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-neutral-600 mb-1">Escala</p>
        <div className="grid grid-cols-3 gap-1">
          <NumberInput label="X" value={Math.round(selectedPiece.scale.x * 100) / 100} onChange={(v) => updateScl('x', v)} step={0.1} />
          <NumberInput label="Y" value={Math.round(selectedPiece.scale.y * 100) / 100} onChange={(v) => updateScl('y', v)} step={0.1} />
          <NumberInput label="Z" value={Math.round(selectedPiece.scale.z * 100) / 100} onChange={(v) => updateScl('z', v)} step={0.1} />
        </div>
      </div>

      <button
        onClick={() => resetPieceTransform(selectedPiece.id)}
        className="px-3 py-1.5 border border-neutral-300 rounded text-sm hover:bg-neutral-50 text-neutral-600"
      >
        Resetear transformacion
      </button>

      <div className="border-t border-neutral-200 pt-4">
        <label className="block text-sm font-medium text-neutral-600 mb-1">Material</label>
        <select
          className="w-full border border-neutral-300 rounded px-2 py-1.5 text-sm"
          value={selectedPiece.materialId}
          onChange={(e) => updatePieceMaterial(selectedPiece.id, e.target.value)}
        >
          {MATERIALES.map((m) => (
            <option key={m.id} value={m.id}>{m.nombre}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-600 mb-1">Color</label>
        <div className="grid grid-cols-6 gap-1.5">
          {PALETA_COLORES.map((c) => (
            <button
              key={c}
              className="w-6 h-6 rounded border border-neutral-300 cursor-pointer hover:scale-110 transition-transform"
              style={{ backgroundColor: c, outline: c === selectedPiece.color ? '2px solid #3b82f6' : 'none' }}
              onClick={() => updatePieceColor(selectedPiece.id, c)}
            />
          ))}
        </div>
        <input
          type="color"
          className="w-full mt-2 h-8 cursor-pointer"
          value={selectedPiece.color || MATERIALES.find((m) => m.id === selectedPiece.materialId)?.colorDefault || '#cccccc'}
          onChange={(e) => updatePieceColor(selectedPiece.id, e.target.value)}
        />
      </div>
    </div>
  )
}

function NumberInput({ label, value, onChange, step = 1 }: { label: string; value: number; onChange: (v: number) => void; step?: number }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-neutral-400 mb-0.5 text-center">{label}</span>
      <input
        type="number"
        className="w-full border border-neutral-300 rounded px-1 py-1 text-sm text-center"
        value={value}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )
}
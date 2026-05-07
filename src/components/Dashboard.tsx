import { useProjectStore } from '../stores/projectStore'
import type { FurnitureType } from '../types'

const FURNITURE_LABELS: Record<FurnitureType, string> = {
  estanteria: 'Estantería',
  mesita: 'Mesita de noche',
  mesa: 'Mesa',
  cocina: 'Mueble de cocina',
  cajonera: 'Cajonera',
}

export function Dashboard() {
  const projects = useProjectStore((s) => s.projects)
  const createProject = useProjectStore((s) => s.createProject)
  const openProject = useProjectStore((s) => s.openProject)
  const deleteProject = useProjectStore((s) => s.deleteProject)

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-50 p-8">
      <h1 className="text-4xl font-bold text-neutral-800 mb-2">MaderaLab</h1>
      <p className="text-neutral-500 mb-8">Diseña muebles en 3D y genera planos de construcción</p>

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-neutral-700 mb-3">Crear nuevo proyecto</h2>
        <div className="flex flex-wrap gap-2 justify-center">
          {Object.entries(FURNITURE_LABELS).map(([tipo, label]) => (
            <button
              key={tipo}
              onClick={() => createProject(tipo as FurnitureType)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {projects.length > 0 && (
        <div className="w-full max-w-2xl">
          <h2 className="text-lg font-semibold text-neutral-700 mb-3">Proyectos guardados</h2>
          <div className="flex flex-col gap-2">
            {projects.map((p) => (
              <div key={p.id} className="flex items-center justify-between bg-white border border-neutral-200 rounded px-4 py-3">
                <div>
                  <p className="font-medium text-neutral-800">{p.nombre}</p>
                  <p className="text-xs text-neutral-400">
                    {FURNITURE_LABELS[p.config.tipo]} · {p.config.ancho}×{p.config.alto}×{p.config.profundidad} mm · {new Date(p.updatedAt).toLocaleDateString('es')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openProject(p.id)}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Abrir
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('¿Eliminar este proyecto?')) deleteProject(p.id)
                    }}
                    className="px-3 py-1 border border-red-300 text-red-600 rounded text-sm hover:bg-red-50"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
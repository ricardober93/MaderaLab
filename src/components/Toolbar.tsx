import { useEffect } from 'react'
import { useProjectStore } from '../stores/projectStore'
import { generateCutList } from '../lib/parametric'
import { exportProject, importProject, saveProject } from '../lib/storage'
import { MATERIALES } from '../data/catalogs'
import type { Project, TransformMode } from '../types'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const MODE_LABELS: Record<TransformMode, { label: string; key: string }> = {
  translate: { label: 'Mover', key: 'W' },
  rotate: { label: 'Rotar', key: 'E' },
  scale: { label: 'Escalar', key: 'R' },
}

export function Toolbar() {
  const project = useProjectStore((s) => s.currentProject)
  const explodedView = useProjectStore((s) => s.explodedView)
  const transformMode = useProjectStore((s) => s.transformMode)
  const toggleExplodedView = useProjectStore((s) => s.toggleExplodedView)
  const setTransformMode = useProjectStore((s) => s.setTransformMode)
  const createProject = useProjectStore((s) => s.createProject)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return
      if (e.key === 'w' || e.key === 'W') setTransformMode('translate')
      if (e.key === 'e' || e.key === 'E') setTransformMode('rotate')
      if (e.key === 'r' || e.key === 'R') setTransformMode('scale')
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [setTransformMode])

  const handleNew = () => {
    if (confirm('Crear nuevo proyecto?')) {
      createProject('estanteria')
    }
  }

  const handleExportJSON = () => {
    if (!project) return
    exportProject(project)
  }

  const handleImportJSON = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      try {
        const imported = await importProject(file)
        saveProject(imported)
        useProjectStore.getState().openProject(imported.id)
      } catch {
        alert('Error al importar: archivo invalido')
      }
    }
    input.click()
  }

  const handleExportPDF = () => {
    if (!project) return
    generatePDF(project)
  }

  const handleExportCSV = () => {
    if (!project) return
    generateCSV(project)
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-neutral-200">
      <button onClick={handleNew} className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
        Nuevo
      </button>
      <button onClick={handleExportJSON} className="px-3 py-1.5 border border-neutral-300 rounded text-sm hover:bg-neutral-50" disabled={!project}>
        Exportar JSON
      </button>
      <button onClick={handleImportJSON} className="px-3 py-1.5 border border-neutral-300 rounded text-sm hover:bg-neutral-50">
        Importar JSON
      </button>

      <div className="w-px h-6 bg-neutral-200" />

      {(Object.entries(MODE_LABELS) as [TransformMode, { label: string; key: string }][]).map(([mode, { label, key }]) => (
        <button
          key={mode}
          onClick={() => setTransformMode(mode)}
          className={`px-3 py-1.5 rounded text-sm ${
            transformMode === mode ? 'bg-blue-100 text-blue-700 font-medium' : 'border border-neutral-300 hover:bg-neutral-50'
          }`}
          disabled={!project}
          title={`${label} (${key})`}
        >
          {label} <span className="text-xs text-neutral-400">{key}</span>
        </button>
      ))}

      <div className="w-px h-6 bg-neutral-200" />

      <button
        onClick={toggleExplodedView}
        className={`px-3 py-1.5 rounded text-sm ${explodedView ? 'bg-blue-100 text-blue-700' : 'border border-neutral-300 hover:bg-neutral-50'}`}
        disabled={!project}
      >
        {explodedView ? 'Vista ensamblada' : 'Vista explotada'}
      </button>

      <div className="w-px h-6 bg-neutral-200" />

      <button onClick={handleExportPDF} className="px-3 py-1.5 border border-neutral-300 rounded text-sm hover:bg-neutral-50" disabled={!project}>
        Exportar PDF
      </button>
      <button onClick={handleExportCSV} className="px-3 py-1.5 border border-neutral-300 rounded text-sm hover:bg-neutral-50" disabled={!project}>
        Exportar CSV
      </button>

      {project && (
        <span className="ml-auto text-sm text-neutral-500">{project.nombre}</span>
      )}
    </div>
  )
}

function generatePDF(project: Project) {
  const doc = new jsPDF()
  const cutList = generateCutList(project.pieces)

  doc.setFontSize(20)
  doc.text(project.nombre, 14, 22)
  doc.setFontSize(10)
  doc.text(`Tipo: ${project.config.tipo} | ${project.config.ancho}x${project.config.alto}x${project.config.profundidad} mm`, 14, 30)
  doc.text(`Fecha: ${new Date(project.updatedAt).toLocaleDateString('es')}`, 14, 36)

  autoTable(doc, {
    startY: 44,
    head: [['Pieza', 'Cantidad', 'Largo (mm)', 'Ancho (mm)', 'Grosor (mm)', 'Material']],
    body: cutList.map((row) => [
      row.nombre,
      row.cantidad,
      row.largo,
      row.ancho,
      row.grosor,
      MATERIALES.find((m) => m.id === row.material)?.nombre || row.material,
    ]),
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
  })

  const lastTable = (doc as unknown as Record<string, unknown>).lastAutoTable as { finalY: number } | undefined
  const currentY = lastTable?.finalY || 100

  if (project.hardware.length > 0) {
    doc.setFontSize(14)
    doc.text('Herrajes', 14, currentY + 12)

    autoTable(doc, {
      startY: currentY + 18,
      head: [['Herraje', 'Especificacion', 'Cantidad']],
      body: project.hardware.map((h) => [h.nombre, h.especificacion, h.cantidad]),
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
    })
  }

  doc.save(`${project.nombre.replace(/\s+/g, '_')}.pdf`)
}

function generateCSV(project: Project) {
  const cutList = generateCutList(project.pieces)
  const header = 'Pieza,Cantidad,Largo (mm),Ancho (mm),Grosor (mm),Material'
  const rows = cutList.map((r) =>
    `${r.nombre},${r.cantidad},${r.largo},${r.ancho},${r.grosor},${MATERIALES.find((m) => m.id === r.material)?.nombre || r.material}`
  )
  const csv = [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${project.nombre.replace(/\s+/g, '_')}_corte.csv`
  a.click()
  URL.revokeObjectURL(url)
}
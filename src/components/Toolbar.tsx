import { useEffect } from 'react'
import { useProjectStore } from '../stores/projectStore'
import { generateCutList } from '../lib/parametric'
import { computeFrontalView, computeLateralView, computeTopView } from '../lib/orthographic'
import type { OrthographicViewData } from '../lib/orthographic'
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
  const transformMode = useProjectStore((s) => s.transformMode)
  const toggleOrthographicView = useProjectStore((s) => s.toggleOrthographicView)
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
        onClick={toggleOrthographicView}
        className="px-3 py-1.5 border border-neutral-300 rounded text-sm hover:bg-neutral-50"
        disabled={!project}
      >
        Vistas 2D
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

function drawViewPDF(
  doc: jsPDF,
  data: OrthographicViewData,
  label: string,
  ox: number,
  oy: number,
  drawW: number,
  drawH: number,
) {
  const { rects, dims, boundsX, boundsY } = data
  if (boundsX === 0 || boundsY === 0) return

  doc.setFontSize(9)
  doc.text(label, ox + drawW / 2, oy - 8, { align: 'center' })

  const scale = Math.min(drawW / (boundsX + 60), drawH / (boundsY + 60))
  const px = (mm: number) => ox + mm * scale + (drawW - boundsX * scale) / 2
  const py = (mm: number) => oy + drawH - 5 - mm * scale

  for (const r of rects) {
    const rx = px(r.x)
    const ry = py(r.y + r.h)
    const rw = r.w * scale
    const rh = r.h * scale
    doc.setDrawColor(55, 65, 81)
    doc.setLineWidth(0.3)
    doc.setFillColor(229, 231, 235)
    doc.rect(rx, ry, rw, rh, 'FD')
  }

  doc.setTextColor(220, 38, 38)
  doc.setFontSize(7)
  doc.setDrawColor(220, 38, 38)
  doc.setLineWidth(0.2)

  for (const d of dims) {
    if (d.horizontal) {
      const y1 = py(d.y1)
      const x1 = px(d.x1)
      const x2 = px(d.x2)
      doc.line(x1, y1, x2, y1)
      doc.line(x1, y1 - 1.5, x1, y1 + 1.5)
      doc.line(x2, y1 - 1.5, x2, y1 + 1.5)
      doc.text(`${d.value}`, (x1 + x2) / 2, y1 - 1.5, { align: 'center' })
    } else {
      const x1 = px(d.x1)
      const y1 = py(d.y1)
      const y2 = py(d.y2)
      doc.line(x1, y1, x1, y2)
      doc.line(x1 - 1.5, y1, x1 + 1.5, y1)
      doc.line(x1 - 1.5, y2, x1 + 1.5, y2)
      doc.text(`${d.value}`, x1 + 3, (y1 + y2) / 2 + 1)
    }
  }

  doc.setTextColor(0, 0, 0)
}

function generatePDF(project: Project) {
  const doc = new jsPDF()
  const cutList = generateCutList(project.pieces)

  doc.setFontSize(20)
  doc.text(project.nombre, 14, 22)
  doc.setFontSize(10)
  doc.text(`Tipo: ${project.config.tipo} | ${project.config.ancho}x${project.config.alto}x${project.config.profundidad} mm`, 14, 30)
  doc.text(`Fecha: ${new Date(project.updatedAt).toLocaleDateString('es')}`, 14, 36)

  const frontalData = computeFrontalView(project.pieces)
  const lateralData = computeLateralView(project.pieces)
  const topData = computeTopView(project.pieces)

  const viewW = 58
  const viewH = 60

  drawViewPDF(doc, frontalData, 'Vista Frontal', 14, 50, viewW, viewH)
  drawViewPDF(doc, lateralData, 'Vista Lateral', 76, 50, viewW, viewH)
  drawViewPDF(doc, topData, 'Vista Superior', 138, 50, viewW, viewH)

  doc.setFontSize(7)
  doc.setTextColor(150, 150, 150)
  doc.text('Medidas en mm', 14, 115)
  doc.setTextColor(0, 0, 0)

  autoTable(doc, {
    startY: 120,
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
  const currentY = lastTable?.finalY || 160

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
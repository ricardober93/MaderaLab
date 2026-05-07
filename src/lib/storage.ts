import type { Project, Piece, SpatialDimension, Rotation, Scale } from '../types'
import { toCutDimension } from '../types'

const STORAGE_KEY = 'maderalab_projects'

const DEFAULT_ROTATION: Rotation = { x: 0, y: 0, z: 0 }
const DEFAULT_SCALE: Scale = { x: 1, y: 1, z: 1 }

function migrateProject(project: Project): Project {
  let needsMigration = false

  const pieces = project.pieces.map((p): Piece => {
    let updated = { ...p }
    const dim = p.dimension as unknown as Record<string, unknown>

    if (dim && 'largo' in dim && !('sizeX' in dim)) {
      needsMigration = true
      const oldDim = dim as { largo: number; ancho: number; grosor: number }
      const dimension: SpatialDimension = {
        sizeX: oldDim.largo,
        sizeY: oldDim.ancho,
        sizeZ: oldDim.grosor,
      }
      updated.dimension = dimension
      updated.cutDimension = toCutDimension(dimension, updated.scale)
    }

    if (!updated.cutDimension) {
      needsMigration = true
      updated.cutDimension = toCutDimension(updated.dimension, updated.scale)
    }

    if (!updated.rotation) {
      needsMigration = true
      updated.rotation = { ...DEFAULT_ROTATION }
    }

    if (!updated.scale) {
      needsMigration = true
      updated.scale = { ...DEFAULT_SCALE }
      updated.cutDimension = toCutDimension(updated.dimension, updated.scale)
    }

    return updated
  })

  if (needsMigration) {
    return { ...project, pieces, updatedAt: Date.now() }
  }
  return project
}

export function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: Project[] = JSON.parse(raw)
    const migrated = parsed.map(migrateProject)
    const changed = migrated.some((m, i) => m.updatedAt !== parsed[i].updatedAt)
    if (changed) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated))
    }
    return migrated
  } catch {
    return []
  }
}

export function saveProject(project: Project): void {
  const projects = loadProjects()
  const idx = projects.findIndex((p) => p.id === project.id)
  if (idx >= 0) {
    projects[idx] = project
  } else {
    projects.push(project)
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
}

export function removeProject(id: string): void {
  const projects = loadProjects().filter((p) => p.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
}

export function exportProject(project: Project): void {
  const json = JSON.stringify(project, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${project.nombre.replace(/\s+/g, '_')}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function importProject(file: File): Promise<Project> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const raw: Project = JSON.parse(e.target?.result as string)
        if (!raw.id || !raw.config || !raw.pieces) {
          reject(new Error('Archivo JSON invalido'))
          return
        }
        resolve(migrateProject(raw))
      } catch {
        reject(new Error('Archivo JSON invalido'))
      }
    }
    reader.onerror = () => reject(new Error('Error al leer archivo'))
    reader.readAsText(file)
  })
}
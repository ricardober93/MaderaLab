import { create } from 'zustand'
import { v4 as uuid } from 'uuid'
import type { Project, FurnitureConfig, FurnitureType, Position, Rotation, Scale, TransformMode } from '../types'
import { DEFAULT_CONFIGS, toCutDimension } from '../types'
import { generateFurniture } from '../lib/parametric'
import { saveProject, loadProjects, removeProject } from '../lib/storage'

interface ProjectState {
  projects: Project[]
  currentProject: Project | null
  selectedPieceId: string | null
  explodedView: boolean
  transformMode: TransformMode

  loadAllProjects: () => void
  createProject: (tipo: FurnitureType) => void
  openProject: (id: string) => void
  updateConfig: (partial: Partial<FurnitureConfig>) => void
  updatePieceMaterial: (pieceId: string, materialId: string) => void
  updatePieceColor: (pieceId: string, color: string) => void
  updateAllMaterials: (materialId: string) => void
  updateAllColors: (color: string) => void
  updatePiecePosition: (pieceId: string, position: Position) => void
  updatePieceRotation: (pieceId: string, rotation: Rotation) => void
  updatePieceScale: (pieceId: string, scale: Scale) => void
  resetPieceTransform: (pieceId: string) => void
  selectPiece: (pieceId: string | null) => void
  setTransformMode: (mode: TransformMode) => void
  toggleExplodedView: () => void
  deleteProject: (id: string) => void
  renameProject: (nombre: string) => void
}

function updatePieceInProject(project: Project, pieceId: string, updater: (p: typeof project.pieces[0]) => typeof project.pieces[0]): Project {
  const pieces = project.pieces.map((p) => p.id === pieceId ? updater(p) : p)
  return { ...project, pieces, updatedAt: Date.now() }
}

function syncStore(set: ProjectState, updated: Project) {
  const s = set as unknown as { projects: Project[] }
  return {
    currentProject: updated,
    projects: s.projects.map((p) => (p.id === updated.id ? updated : p)),
  }
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  selectedPieceId: null,
  explodedView: false,
  transformMode: 'translate',

  loadAllProjects: () => {
    const projects = loadProjects()
    set({ projects })
  },

  createProject: (tipo) => {
    const config = { ...DEFAULT_CONFIGS[tipo], tipo }
    const { pieces, hardware } = generateFurniture(config)
    const project: Project = {
      id: uuid(),
      nombre: `Mi ${tipo}`,
      config,
      pieces,
      hardware,
      materialId: 'melamina_blanca',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    saveProject(project)
    set((s) => ({
      currentProject: project,
      projects: [...s.projects, project],
      selectedPieceId: null,
    }))
  },

  openProject: (id) => {
    const projects = loadProjects()
    const project = projects.find((p) => p.id === id)
    if (project) {
      set({ currentProject: project, selectedPieceId: null })
    }
  },

  updateConfig: (partial) => {
    const { currentProject } = get()
    if (!currentProject) return
    const newConfig = { ...currentProject.config, ...partial }
    const { pieces, hardware } = generateFurniture(newConfig)
    const updated: Project = { ...currentProject, config: newConfig, pieces, hardware, updatedAt: Date.now() }
    saveProject(updated)
    set((s) => syncStore(s, updated))
  },

  updatePieceMaterial: (pieceId, materialId) => {
    const { currentProject } = get()
    if (!currentProject) return
    const updated = updatePieceInProject(currentProject, pieceId, (p) => ({ ...p, materialId }))
    saveProject(updated)
    set((s) => syncStore(s, updated))
  },

  updatePieceColor: (pieceId, color) => {
    const { currentProject } = get()
    if (!currentProject) return
    const updated = updatePieceInProject(currentProject, pieceId, (p) => ({ ...p, color }))
    saveProject(updated)
    set((s) => syncStore(s, updated))
  },

  updateAllMaterials: (materialId) => {
    const { currentProject } = get()
    if (!currentProject) return
    const pieces = currentProject.pieces.map((p) => ({ ...p, materialId }))
    const updated = { ...currentProject, pieces, materialId, updatedAt: Date.now() }
    saveProject(updated)
    set((s) => syncStore(s, updated))
  },

  updateAllColors: (color) => {
    const { currentProject } = get()
    if (!currentProject) return
    const pieces = currentProject.pieces.map((p) => ({ ...p, color }))
    const updated = { ...currentProject, pieces, updatedAt: Date.now() }
    saveProject(updated)
    set((s) => syncStore(s, updated))
  },

  updatePiecePosition: (pieceId, position) => {
    const { currentProject } = get()
    if (!currentProject) return
    const updated = updatePieceInProject(currentProject, pieceId, (p) => ({ ...p, position }))
    saveProject(updated)
    set((s) => syncStore(s, updated))
  },

  updatePieceRotation: (pieceId, rotation) => {
    const { currentProject } = get()
    if (!currentProject) return
    const updated = updatePieceInProject(currentProject, pieceId, (p) => ({ ...p, rotation }))
    saveProject(updated)
    set((s) => syncStore(s, updated))
  },

  updatePieceScale: (pieceId, scale) => {
    const { currentProject } = get()
    if (!currentProject) return
    const updated = updatePieceInProject(currentProject, pieceId, (p) => ({
      ...p,
      scale,
      cutDimension: toCutDimension(p.dimension, scale),
    }))
    saveProject(updated)
    set((s) => syncStore(s, updated))
  },

  resetPieceTransform: (pieceId) => {
    const { currentProject } = get()
    if (!currentProject) return
    const updated = updatePieceInProject(currentProject, pieceId, (p) => ({
      ...p,
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      cutDimension: toCutDimension(p.dimension),
    }))
    saveProject(updated)
    set((s) => syncStore(s, updated))
  },

  selectPiece: (pieceId) => set({ selectedPieceId: pieceId }),

  setTransformMode: (mode) => set({ transformMode: mode }),

  toggleExplodedView: () => set((s) => ({ explodedView: !s.explodedView })),

  deleteProject: (id) => {
    removeProject(id)
    set((s) => ({
      projects: s.projects.filter((p) => p.id !== id),
      currentProject: s.currentProject?.id === id ? null : s.currentProject,
    }))
  },

  renameProject: (nombre) => {
    const { currentProject } = get()
    if (!currentProject) return
    const updated = { ...currentProject, nombre, updatedAt: Date.now() }
    saveProject(updated)
    set((s) => syncStore(s, updated))
  },
}))
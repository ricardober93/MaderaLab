import { create } from 'zustand'
import { v4 as uuid } from 'uuid'
import type { Project, FurnitureConfig, FurnitureType, Position, Rotation, Scale, TransformMode } from '../types'
import { DEFAULT_CONFIGS, toCutDimension } from '../types'
import { generateFurniture } from '../lib/parametric'
import { saveProject, loadProjects, removeProject } from '../lib/storage'

const HISTORY_LIMIT = 50

interface ProjectState {
  projects: Project[]
  currentProject: Project | null
  selectedPieceId: string | null
  explodedView: boolean
  showOrthographicView: boolean
  showShortcuts: boolean
  transformMode: TransformMode
  past: Project[]
  future: Project[]
  savedAt: number

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
  deletePiece: (pieceId: string) => void
  selectPiece: (pieceId: string | null) => void
  setTransformMode: (mode: TransformMode) => void
  toggleExplodedView: () => void
  toggleOrthographicView: () => void
  setShowShortcuts: (v: boolean) => void
  deleteProject: (id: string) => void
  renameProject: (nombre: string) => void
  undo: () => void
  redo: () => void
  markSaved: () => void
}

function updatePieceInProject(project: Project, pieceId: string, updater: (p: typeof project.pieces[0]) => typeof project.pieces[0]): Project {
  const pieces = project.pieces.map((p) => p.id === pieceId ? updater(p) : p)
  return { ...project, pieces, updatedAt: Date.now() }
}

function applyChange(
  set: ProjectState,
  prev: Project,
  next: Project,
  extra?: Partial<ProjectState>,
) {
  saveProject(next)
  const s = set as unknown as StateWithHistory
  return {
    currentProject: next,
    projects: s.projects.map((p) => (p.id === next.id ? next : p)),
    past: [...s.past, prev].slice(-HISTORY_LIMIT),
    future: [],
    ...extra,
  }
}

type StateWithHistory = {
  projects: Project[]
  past: Project[]
  future: Project[]
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  selectedPieceId: null,
  explodedView: false,
  showOrthographicView: false,
  transformMode: 'translate',
  past: [],
  future: [],
  savedAt: 0,
  showShortcuts: false,

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
      past: [],
      future: [],
    }))
  },

  openProject: (id) => {
    const projects = loadProjects()
    const project = projects.find((p) => p.id === id)
    if (project) {
      set({ currentProject: project, selectedPieceId: null, past: [], future: [] })
    }
  },

  updateConfig: (partial) => {
    const { currentProject } = get()
    if (!currentProject) return
    const newConfig = { ...currentProject.config, ...partial }
    const { pieces, hardware } = generateFurniture(newConfig)
    const updated: Project = { ...currentProject, config: newConfig, pieces, hardware, updatedAt: Date.now() }
    set((s) => applyChange(s, currentProject, updated))
  },

  updatePieceMaterial: (pieceId, materialId) => {
    const { currentProject } = get()
    if (!currentProject) return
    const updated = updatePieceInProject(currentProject, pieceId, (p) => ({ ...p, materialId }))
    set((s) => applyChange(s, currentProject, updated))
  },

  updatePieceColor: (pieceId, color) => {
    const { currentProject } = get()
    if (!currentProject) return
    const updated = updatePieceInProject(currentProject, pieceId, (p) => ({ ...p, color }))
    set((s) => applyChange(s, currentProject, updated))
  },

  updateAllMaterials: (materialId) => {
    const { currentProject } = get()
    if (!currentProject) return
    const pieces = currentProject.pieces.map((p) => ({ ...p, materialId }))
    const updated = { ...currentProject, pieces, materialId, updatedAt: Date.now() }
    set((s) => applyChange(s, currentProject, updated))
  },

  updateAllColors: (color) => {
    const { currentProject } = get()
    if (!currentProject) return
    const pieces = currentProject.pieces.map((p) => ({ ...p, color }))
    const updated = { ...currentProject, pieces, updatedAt: Date.now() }
    set((s) => applyChange(s, currentProject, updated))
  },

  updatePiecePosition: (pieceId, position) => {
    const { currentProject } = get()
    if (!currentProject) return
    const updated = updatePieceInProject(currentProject, pieceId, (p) => ({ ...p, position }))
    set((s) => applyChange(s, currentProject, updated))
  },

  updatePieceRotation: (pieceId, rotation) => {
    const { currentProject } = get()
    if (!currentProject) return
    const updated = updatePieceInProject(currentProject, pieceId, (p) => ({ ...p, rotation }))
    set((s) => applyChange(s, currentProject, updated))
  },

  updatePieceScale: (pieceId, scale) => {
    const { currentProject } = get()
    if (!currentProject) return
    const updated = updatePieceInProject(currentProject, pieceId, (p) => ({
      ...p,
      scale,
      cutDimension: toCutDimension(p.dimension, scale),
    }))
    set((s) => applyChange(s, currentProject, updated))
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
    set((s) => applyChange(s, currentProject, updated))
  },

  deletePiece: (pieceId) => {
    const { currentProject } = get()
    if (!currentProject) return
    const pieces = currentProject.pieces.filter((p) => p.id !== pieceId)
    if (pieces.length === currentProject.pieces.length) return
    const updated: Project = { ...currentProject, pieces, updatedAt: Date.now() }
    set((s) => applyChange(s, currentProject, updated, { selectedPieceId: null }))
  },

  selectPiece: (pieceId) => set({ selectedPieceId: pieceId }),

  setTransformMode: (mode) => set({ transformMode: mode }),

  toggleExplodedView: () => set((s) => ({ explodedView: !s.explodedView })),
  toggleOrthographicView: () => set((s) => ({ showOrthographicView: !s.showOrthographicView })),
  setShowShortcuts: (v) => set({ showShortcuts: v }),

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
    set((s) => applyChange(s, currentProject, updated))
  },

  undo: () => {
    const { past, currentProject } = get()
    if (past.length === 0 || !currentProject) return
    const prev = past[past.length - 1]
    saveProject(prev)
    set((s) => ({
      currentProject: prev,
      projects: s.projects.map((p) => (p.id === prev.id ? prev : p)),
      past: past.slice(0, -1),
      future: [currentProject, ...s.future].slice(0, HISTORY_LIMIT),
    }))
  },

  redo: () => {
    const { future, currentProject } = get()
    if (future.length === 0 || !currentProject) return
    const next = future[0]
    saveProject(next)
    set((s) => ({
      currentProject: next,
      projects: s.projects.map((p) => (p.id === next.id ? next : p)),
      past: [...s.past, currentProject].slice(-HISTORY_LIMIT),
      future: future.slice(1),
    }))
  },

  markSaved: () => set({ savedAt: Date.now() }),
}))
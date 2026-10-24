import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer } from '@react-three/drei'
import type { WebGLRenderer, Scene, PerspectiveCamera } from 'three'
import { useProjectStore } from '../stores/projectStore'
import { PieceMesh } from './PieceMesh'
import {
  computeRenderBounds,
  cameraPositionFor,
  captureCanvas,
  descargarRender,
  RENDER_PRESETS,
  RENDER_PRESET_LABELS,
  RENDER_FONDOS,
  RENDER_FONDO_LABELS,
  RENDER_FONDO_COLORS,
} from '../lib/renderScene'
import type { RenderPreset, RenderFondo, RenderBounds } from '../lib/renderScene'
import type { Project } from '../types'

const MULTIPLIERS = [1, 2, 3] as const

export function RenderModal({ project }: { project: Project }) {
  const setShowRender = useProjectStore((s) => s.setShowRender)
  const setLastRenderDataUrl = useProjectStore((s) => s.setLastRenderDataUrl)
  const [preset, setPreset] = useState<RenderPreset>('perspectiva')
  const [fondo, setFondo] = useState<RenderFondo>('blanco')
  const [multiplier, setMultiplier] = useState<(typeof MULTIPLIERS)[number]>(2)
  const [error, setError] = useState<string | null>(null)

  const glRef = useRef<{ gl: WebGLRenderer; scene: Scene; camera: PerspectiveCamera } | null>(null)
  const bounds = computeRenderBounds(project.pieces)
  const materialDefault = project.config.materialId ?? 'melamina_blanca'
  const materialPorPieza = useMemo(() => {
    const m = new Map<string, string>()
    for (const pieza of project.pieces) {
      m.set(pieza.id, pieza.materialCustom ? (pieza.materialId ?? materialDefault) : materialDefault)
    }
    return m
  }, [project.pieces, materialDefault])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowRender(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setShowRender])

  const exportar = () => {
    const refs = glRef.current
    if (!refs) {
      setError('El render aún no está listo — espera un instante e inténtalo de nuevo.')
      return
    }
    try {
      const dataUrl = captureCanvas(refs.gl, refs.scene, refs.camera, multiplier)
      descargarRender(dataUrl, project.nombre)
      setLastRenderDataUrl(dataUrl)
      setError(null)
    } catch {
      setError('No se pudo generar el PNG del render.')
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onMouseDown={(e) => e.target === e.currentTarget && setShowRender(false)}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-[min(760px,94vw)] max-h-[88vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-800">Render de presentación — {project.nombre}</h2>
          <button
            onClick={() => setShowRender(false)}
            className="px-3 py-1.5 text-sm border border-neutral-300 rounded text-neutral-500 hover:bg-neutral-100"
          >
            Cerrar
          </button>
        </div>

        <div style={{ height: 420 }} className="rounded border border-neutral-200 overflow-hidden bg-neutral-50">
          <Canvas
            shadows="soft"
            camera={{ fov: 40, near: 0.1, far: 100 }}
            gl={{ alpha: true, preserveDrawingBuffer: true, antialias: true }}
            onCreated={({ gl, scene, camera }) => {
              glRef.current = { gl, scene, camera: camera as PerspectiveCamera }
              gl.setClearColor(RENDER_FONDO_COLORS.blanco, 1)
            }}
          >
            <FondoController fondo={fondo} />
            <CamaraRig preset={preset} bounds={bounds} />

            <ambientLight intensity={0.15} />
            <hemisphereLight intensity={0.12} />
            <directionalLight
              castShadow
              shadow-mapSize={[2048, 2048]}
              shadow-bias={-0.0002}
              shadow-camera-left={-bounds.maxDim * 1.4}
              shadow-camera-right={bounds.maxDim * 1.4}
              shadow-camera-top={bounds.maxDim * 1.4}
              shadow-camera-bottom={-bounds.maxDim * 1.4}
              shadow-camera-near={0.1}
              shadow-camera-far={bounds.maxDim * 6}
              position={[bounds.maxDim * 1.6, bounds.maxDim * 1.8, bounds.maxDim * 1.2]}
              intensity={1.25}
              color="#fff2e2"
            />
            <directionalLight
              position={[-bounds.maxDim * 1.5, bounds.maxDim * 1.1, -bounds.maxDim * 0.4]}
              intensity={0.35}
              color="#dce8ff"
            />

            <Environment frames={1} resolution={256}>
              <Lightformer intensity={2.6} position={[0, bounds.maxDim * 3, 0]} rotation-x={Math.PI / 2} scale={[bounds.maxDim * 6, bounds.maxDim * 3, 1]} />
              <Lightformer intensity={1.9} position={[-bounds.maxDim * 2.5, bounds.maxDim, -bounds.maxDim]} rotation-y={Math.PI / 2} scale={[bounds.maxDim * 5, bounds.maxDim * 2.5, 1]} />
              <Lightformer intensity={1.2} position={[bounds.maxDim * 2.2, bounds.maxDim * 0.5, bounds.maxDim * 1.5]} rotation-y={-Math.PI / 2} scale={[bounds.maxDim * 4, bounds.maxDim * 2, 1]} />
              <Lightformer intensity={0.9} color="#ffe8c8" position={[0, bounds.maxDim * 0.4, bounds.maxDim * 3]} scale={[bounds.maxDim * 4, bounds.maxDim * 2, 1]} />
            </Environment>

            <group position={[-bounds.centerX, -bounds.centerY, -bounds.centerZ]}>
              {project.pieces.map((p) => (
                <PieceMesh key={p.id} piece={p} selected={false} offsetY={0} onClick={() => {}} bordes texturaId={materialPorPieza.get(p.id) ?? undefined} />
              ))}
            </group>

            <ContactShadows
              opacity={0.5}
              scale={bounds.maxDim * 1.25 + 0.5}
              blur={2.2}
              far={bounds.centerY * 2 + 0.1}
              resolution={512}
              position={[0, -bounds.centerY - 0.01, 0]}
              color="#1f1f1f"
            />
          </Canvas>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-4 text-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-500 text-xs w-16">Ángulo</span>
            {RENDER_PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setPreset(p)}
                className={`px-2.5 py-1 rounded text-xs border ${
                  preset === p
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-neutral-300 text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                {RENDER_PRESET_LABELS[p]}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-neutral-500 text-xs w-16">Fondo</span>
            {RENDER_FONDOS.map((f) => (
              <button
                key={f}
                onClick={() => setFondo(f)}
                className={`px-2.5 py-1 rounded text-xs border ${
                  fondo === f
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-neutral-300 text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                {RENDER_FONDO_LABELS[f]}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-neutral-500 text-xs w-16">Resolución</span>
            {MULTIPLIERS.map((m) => (
              <button
                key={m}
                onClick={() => setMultiplier(m)}
                className={`px-2.5 py-1 rounded text-xs border ${
                  multiplier === m
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-neutral-300 text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                {m}×
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-xs text-red-500 mt-3">{error}</p>}

        <div className="flex justify-end mt-5">
          <button
            onClick={exportar}
            className="px-4 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 font-medium"
          >
            Descargar PNG
          </button>
        </div>
      </div>
    </div>
  )
}

function FondoController({ fondo }: { fondo: RenderFondo }) {
  const gl = useThree((s) => s.gl)
  useEffect(() => {
    if (fondo === 'transparente') {
      gl.setClearColor('#000000', 0)
    } else {
      gl.setClearColor(RENDER_FONDO_COLORS[fondo], 1)
    }
  }, [gl, fondo])
  return null
}

function CamaraRig({ preset, bounds }: { preset: RenderPreset; bounds: RenderBounds }) {
  const camera = useThree((s) => s.camera) as PerspectiveCamera
  useEffect(() => {
    if (preset === 'superior') {
      camera.up.set(0, 0, -1)
    } else {
      camera.up.set(0, 1, 0)
    }
    camera.position.set(...cameraPositionFor(preset, bounds, camera.fov, camera.aspect))
    camera.lookAt(0, 0, 0)
  }, [camera, preset, bounds])
  return null
}

import { useRef, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, TransformControls } from '@react-three/drei'
import { Group } from 'three'
import { useProjectStore } from '../stores/projectStore'
import { PieceMesh } from './PieceMesh'
import { SCALE } from '../lib/constants'
import type { Position, Rotation, Scale } from '../types'

export function Viewport3D() {
  const project = useProjectStore((s) => s.currentProject)
  const selectedPieceId = useProjectStore((s) => s.selectedPieceId)
  const explodedView = useProjectStore((s) => s.explodedView)
  const transformMode = useProjectStore((s) => s.transformMode)
  const selectPiece = useProjectStore((s) => s.selectPiece)
  const updatePiecePosition = useProjectStore((s) => s.updatePiecePosition)
  const updatePieceRotation = useProjectStore((s) => s.updatePieceRotation)
  const updatePieceScale = useProjectStore((s) => s.updatePieceScale)

  const groupRef = useRef<Group>(null)

  const persistTransform = useCallback(() => {
    if (!project || !selectedPieceId || !groupRef.current) return

    const group = groupRef.current
    const piece = project.pieces.find((p) => p.id === selectedPieceId)
    if (!piece) return
    const sc = SCALE

    if (transformMode === 'translate') {
      const pos: Position = {
        x: group.position.x / sc - piece.dimension.sizeX / 2,
        y: group.position.y / sc - piece.dimension.sizeY / 2,
        z: group.position.z / sc - piece.dimension.sizeZ / 2,
      }
      updatePiecePosition(selectedPieceId, pos)
    } else if (transformMode === 'rotate') {
      const rot: Rotation = {
        x: group.rotation.x,
        y: group.rotation.y,
        z: group.rotation.z,
      }
      updatePieceRotation(selectedPieceId, rot)
    } else if (transformMode === 'scale') {
      const scl: Scale = {
        x: group.scale.x,
        y: group.scale.y,
        z: group.scale.z,
      }
      updatePieceScale(selectedPieceId, scl)
    }
  }, [project, selectedPieceId, transformMode, updatePiecePosition, updatePieceRotation, updatePieceScale])

  if (!project || project.pieces.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-neutral-100 text-neutral-400">
        <p>Crea o abre un proyecto para comenzar</p>
      </div>
    )
  }

  const { pieces } = project
  const s = SCALE

  const maxX = Math.max(...pieces.map((p) => p.position.x + p.dimension.sizeX), 0) * s
  const maxY = Math.max(...pieces.map((p) => p.position.y + p.dimension.sizeY), 0) * s
  const maxZ = Math.max(...pieces.map((p) => p.position.z + p.dimension.sizeZ), 0) * s

  const centerX = maxX / 2
  const centerY = maxY / 2
  const centerZ = maxZ / 2

  const explodeOffset = Math.max(maxX, maxY, maxZ) * 0.3
  const cameraDistance = Math.max(maxX, maxY, maxZ) * 2.5

  const selectedPiece = selectedPieceId ? pieces.find((p) => p.id === selectedPieceId) : null

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{
          position: [centerX + cameraDistance * 0.6, centerY + cameraDistance * 0.4, centerZ + cameraDistance * 0.8],
          near: 0.01,
          far: 100,
          fov: 50,
        }}
        onPointerMissed={() => selectPiece(null)}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[cameraDistance, cameraDistance, cameraDistance * 0.5]} intensity={0.8} />
        <directionalLight position={[-cameraDistance, cameraDistance, -cameraDistance * 0.5]} intensity={0.3} />

        <group position={[-centerX, -centerY, -centerZ]}>
          {pieces.map((p) => {
            const kindIndex = pieces.filter((pp) => pp.kind === p.kind && pieces.indexOf(pp) < pieces.indexOf(p)).length
            const offsetY = explodedView ? kindIndex * explodeOffset + (p.kind === 'pata' ? -explodeOffset : 0) : 0
            const isSelected = p.id === selectedPieceId

            if (isSelected && !explodedView) {
              return (
                <group
                  key={p.id}
                  ref={groupRef}
                  position={[
                    (p.position.x + p.dimension.sizeX / 2) * s,
                    (p.position.y + p.dimension.sizeY / 2) * s,
                    (p.position.z + p.dimension.sizeZ / 2) * s,
                  ]}
                  rotation={[p.rotation.x, p.rotation.y, p.rotation.z]}
                  scale={[p.scale.x, p.scale.y, p.scale.z]}
                >
                  <PieceMesh
                    piece={p}
                    selected={true}
                    offsetY={0}
                    onClick={() => selectPiece(p.id)}
                    useOwnTransform={false}
                  />
                </group>
              )
            }

            return (
              <PieceMesh
                key={p.id}
                piece={p}
                selected={isSelected}
                offsetY={offsetY}
                onClick={() => selectPiece(p.id)}
              />
            )
          })}
        </group>

        {selectedPiece && !explodedView && (
          <TransformControls
            object={groupRef as React.RefObject<import('three').Object3D>}
            mode={transformMode}
            onMouseUp={persistTransform}
          />
        )}

        <gridHelper
          args={[Math.max(maxX, maxZ) * 4, 20, '#cccccc', '#e5e5e5']}
          position={[0, -centerY - 0.02, 0]}
        />
        <OrbitControls makeDefault enableDamping dampingFactor={0.1} />
      </Canvas>
    </div>
  )
}
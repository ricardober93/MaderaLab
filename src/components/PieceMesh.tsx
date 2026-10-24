import { useEffect, useMemo } from 'react'
import { BoxGeometry, EdgesGeometry, Euler } from 'three'
import type { BufferAttribute } from 'three'
import type { Piece } from '../types'
import { MATERIALES } from '../data/catalogs'
import { SCALE } from '../lib/constants'
import { TILE_SIZE, texturaBaseMaterial } from '../lib/textures'

interface PieceMeshProps {
  piece: Piece
  selected: boolean
  offsetY: number
  onClick: () => void
  useOwnTransform?: boolean
  bordes?: boolean
  texturaId?: string
}

export function PieceMesh({ piece, selected, offsetY, onClick, useOwnTransform = true, bordes = false, texturaId }: PieceMeshProps) {
  const { dimension, position, rotation, scale, materialId, color } = piece
  const mat = MATERIALES.find((m) => m.id === materialId)
  const fillColor = color || mat?.colorDefault || '#cccccc'

  const s = SCALE

  const scaledX = dimension.sizeX * s
  const scaledY = dimension.sizeY * s
  const scaledZ = dimension.sizeZ * s

  const groupPosition: [number, number, number] = useOwnTransform
    ? [
        (position.x + dimension.sizeX / 2) * s,
        (position.y + dimension.sizeY / 2) * s + offsetY,
        (position.z + dimension.sizeZ / 2) * s,
      ]
    : [0, offsetY, 0]

  const groupRotation: Euler = useOwnTransform
    ? new Euler(rotation.x, rotation.y, rotation.z)
    : new Euler(0, 0, 0)

  const groupScale: [number, number, number] = useOwnTransform
    ? [scale.x, scale.y, scale.z]
    : [1, 1, 1]

  const edgesGeometry = useMemo(() => {
    const geo = new BoxGeometry(scaledX, scaledY, scaledZ)
    const edges = new EdgesGeometry(geo)
    geo.dispose()
    return edges
  }, [scaledX, scaledY, scaledZ])

  const clips = texturaId ? texturaBaseMaterial(texturaId) : null

  const clones = useMemo(() => {
    if (!clips) return null
    const map = clips.map.clone()
    const bump = clips.bump ? clips.bump.clone() : null
    const largo = Math.max(scaledX, scaledY, scaledZ)
    const rot = largo === scaledX ? 0 : Math.PI / 2
    for (const t of [map, bump]) {
      if (!t) continue
      t.center.set(0.5, 0.5)
      t.rotation = rot
    }
    return { map, bump }
  }, [clips, scaledX, scaledY, scaledZ])

  useEffect(() => {
    return () => {
      clones?.map.dispose()
      clones?.bump?.dispose()
    }
  }, [clones])

  const uvGeometry = useMemo(() => {
    if (!texturaId) return null
    const geo = new BoxGeometry(scaledX, scaledY, scaledZ)
    const dims: [number, number][] = [
      [scaledZ, scaledY],
      [scaledZ, scaledY],
      [scaledX, scaledZ],
      [scaledX, scaledZ],
      [scaledX, scaledY],
      [scaledX, scaledY],
    ]
    const uv = geo.attributes.uv as BufferAttribute
    for (let f = 0; f < 6; f++) {
      const [dx, dy] = dims[f]
      const rx = Math.max(1, Math.round(dx / TILE_SIZE))
      const ry = Math.max(1, Math.round(dy / TILE_SIZE))
      for (let v = 0; v < 4; v++) {
        const idx = f * 4 + v
        uv.setXY(idx, uv.getX(idx) * rx, uv.getY(idx) * ry)
      }
    }
    return geo
  }, [texturaId, scaledX, scaledY, scaledZ])

  useEffect(() => {
    return () => { uvGeometry?.dispose() }
  }, [uvGeometry])

  return (
    <group position={groupPosition} rotation={groupRotation} scale={groupScale}>
      <mesh castShadow receiveShadow onClick={(e) => { e.stopPropagation(); onClick() }}>
        {uvGeometry ? (
          <primitive object={uvGeometry} attach="geometry" />
        ) : (
          <boxGeometry args={[scaledX, scaledY, scaledZ]} />
        )}
        <meshPhysicalMaterial
          color={clones ? '#ffffff' : fillColor}
          map={clones?.map}
          bumpMap={clones?.bump ?? undefined}
          bumpScale={clones ? 0.002 : undefined}
          roughness={0.35}
          metalness={0.05}
          clearcoat={0.25}
          clearcoatRoughness={0.35}
          opacity={selected ? 0.85 : 1}
          transparent={selected}
        />
      </mesh>
      {(selected || bordes) && (
        <lineSegments geometry={edgesGeometry}>
          <lineBasicMaterial color={selected ? '#3b82f6' : '#6b6b6b'} linewidth={2} />
        </lineSegments>
      )}
    </group>
  )
}

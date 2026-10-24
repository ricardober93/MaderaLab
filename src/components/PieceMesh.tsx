import { useMemo } from 'react'
import { BoxGeometry, EdgesGeometry, Euler } from 'three'
import type { Piece } from '../types'
import { MATERIALES } from '../data/catalogs'
import { SCALE } from '../lib/constants'

interface PieceMeshProps {
  piece: Piece
  selected: boolean
  offsetY: number
  onClick: () => void
  useOwnTransform?: boolean
  bordes?: boolean
}

export function PieceMesh({ piece, selected, offsetY, onClick, useOwnTransform = true, bordes = false }: PieceMeshProps) {
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

  return (
    <group position={groupPosition} rotation={groupRotation} scale={groupScale}>
      <mesh castShadow receiveShadow onClick={(e) => { e.stopPropagation(); onClick() }}>
        <boxGeometry args={[scaledX, scaledY, scaledZ]} />
        <meshPhysicalMaterial
          color={fillColor}
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
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

const checkWebGL = () => {
  if (typeof window === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    )
  } catch {
    return false
  }
}

const Rocket = () => {
  const group = useRef<THREE.Group>(null)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (!group.current) return
    group.current.rotation.y = t * 0.25
    group.current.rotation.x = Math.sin(t * 0.2) * 0.12
    group.current.position.y = Math.sin(t * 0.6) * 0.12
  })

  const finPositions = useMemo(
    () => [
      [0.22, -0.55, 0],
      [-0.22, -0.55, 0],
      [0, -0.55, 0.22],
      [0, -0.55, -0.22],
    ],
    []
  )

  return (
    <group ref={group} position={[0, 0.1, 0]}>
      <mesh>
        <cylinderGeometry args={[0.22, 0.26, 1.3, 36]} />
        <meshStandardMaterial color="#cfd7ff" metalness={0.4} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.88, 0]}>
        <coneGeometry args={[0.23, 0.45, 36]} />
        <meshStandardMaterial color="#7ef9ff" metalness={0.5} roughness={0.2} />
      </mesh>
      <mesh position={[0, -0.9, 0]}>
        <cylinderGeometry args={[0.14, 0.26, 0.32, 28]} />
        <meshStandardMaterial
          color="#ffb86b"
          emissive="#ff8f3f"
          emissiveIntensity={0.9}
          roughness={0.3}
        />
      </mesh>
      {finPositions.map((pos) => (
        <mesh key={`${pos[0]}-${pos[2]}`} position={pos as [number, number, number]}>
          <boxGeometry args={[0.06, 0.22, 0.32]} />
          <meshStandardMaterial color="#b18cff" metalness={0.35} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0.12, 0.15, 0.18]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#0b1020" emissive="#7ef9ff" emissiveIntensity={0.4} />
      </mesh>
    </group>
  )
}

const HeroScene = () => {
  const [canRender, setCanRender] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    setCanRender(checkWebGL())
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = () => setReduceMotion(media.matches)
    handleChange()
    if (media.addEventListener) {
      media.addEventListener('change', handleChange)
      return () => media.removeEventListener('change', handleChange)
    }
    media.addListener(handleChange)
    return () => media.removeListener(handleChange)
  }, [])

  if (!canRender || reduceMotion) {
    return <div className="hero-fallback" aria-hidden="true" />
  }

  return (
    <div className="hero-canvas" aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [2.6, 0.5, 3.4], fov: 42 }}
        gl={{ antialias: true, powerPreference: 'high-performance', alpha: true }}
      >
        <color attach="background" args={['#05070f']} />
        <fog attach="fog" args={['#05070f', 6, 16]} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 3, 4]} intensity={1.1} color="#b18cff" />
        <pointLight position={[-3, -2, -2]} intensity={0.8} color="#7ef9ff" />
        <Rocket />
        <Stars radius={40} depth={35} count={900} factor={2.2} saturation={0} fade speed={0.35} />
      </Canvas>
    </div>
  )
}

export default HeroScene

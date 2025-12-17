"use client";

import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// Hook to track mouse position globally
function useMousePosition() {
  const [mousePos, setMousePos] = useState(new THREE.Vector2(0, 0));

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      setMousePos(new THREE.Vector2(x, y));
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return mousePos;
}

// Hook to track click position
function useClickPosition() {
  const [clickPos, setClickPos] = useState<THREE.Vector2 | null>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      setClickPos(new THREE.Vector2(x, y));
      setTimeout(() => setClickPos(null), 1000);
    };

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  return clickPos;
}

function WavePlane({ 
  mousePos, 
  clickPos,
  index 
}: { 
  mousePos: THREE.Vector2;
  clickPos: THREE.Vector2 | null;
  index: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const { viewport } = useThree();
  
  const colors = [
    { main: "#66d9ff", accent: "#00ccff" }, // Lighter cyan
    { main: "#66aaff", accent: "#4488ff" }, // Lighter blue
    { main: "#aa88ff", accent: "#9966ff" }, // Lighter purple
  ];
  const colorSet = colors[index % colors.length];

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.elapsedTime;
    const geometry = meshRef.current.geometry as THREE.PlaneGeometry;
    
    if (geometry.attributes.position) {
      const positions = geometry.attributes.position.array as Float32Array;
      const count = positions.length / 3;

      for (let i = 0; i < count; i++) {
        const x = positions[i * 3];
        const y = positions[i * 3 + 1];
        
        // Base wave
        let z = Math.sin(x * 0.5 + time * 0.5) * 0.3;
        z += Math.cos(y * 0.5 + time * 0.3) * 0.2;
        
        // Mouse influence - create ripple effect
        const mouseX = mousePos.x * viewport.width * 0.5;
        const mouseY = mousePos.y * viewport.height * 0.5;
        const distToMouse = Math.sqrt(
          Math.pow(x - mouseX, 2) + Math.pow(y - mouseY, 2)
        );
        
        if (distToMouse < 3) {
          const ripple = Math.sin(distToMouse * 2 - time * 3) * (1 - distToMouse / 3);
          z += ripple * 0.5;
        }

        // Click ripple effect
        if (clickPos) {
          const clickX = clickPos.x * viewport.width * 0.5;
          const clickY = clickPos.y * viewport.height * 0.5;
          const distToClick = Math.sqrt(
            Math.pow(x - clickX, 2) + Math.pow(y - clickY, 2)
          );
          
          if (distToClick < 4) {
            const clickRipple = Math.sin(distToClick * 3 - time * 5) * (1 - distToClick / 4);
            z += clickRipple * 0.8;
          }
        }

        // Update z position
        positions[i * 3 + 2] = z;
      }

      geometry.attributes.position.needsUpdate = true;
      geometry.computeVertexNormals();
    }

    // Color animation based on mouse
    if (materialRef.current) {
      const colorIntensity = 0.5 + Math.abs(mousePos.x) * 0.3;
      materialRef.current.color.lerp(
        new THREE.Color(colorSet.main).multiplyScalar(colorIntensity),
        0.1
      );
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, index * -1.5, 0]}>
      <planeGeometry args={[20, 20, 50, 50]} />
      <meshStandardMaterial
        ref={materialRef}
        color={colorSet.main}
        transparent
        opacity={0.4}
        metalness={0.6}
        roughness={0.4}
        side={THREE.DoubleSide}
        emissive={colorSet.main}
        emissiveIntensity={0.15}
      />
    </mesh>
  );
}

function FloatingParticles({ mousePos, clickPos }: { mousePos: THREE.Vector2; clickPos: THREE.Vector2 | null }) {
  const particlesRef = useRef<THREE.InstancedMesh>(null);
  const count = 50;

  useEffect(() => {
    if (!particlesRef.current) return;

    const matrix = new THREE.Matrix4();
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 20;
      const y = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 10;
      const scale = 0.05 + Math.random() * 0.1;
      
      matrix.setPosition(x, y, z);
      matrix.scale(scale, scale, scale);
      particlesRef.current.setMatrixAt(i, matrix);
    }
    particlesRef.current.instanceMatrix.needsUpdate = true;
  }, []);

  useFrame((state) => {
    if (!particlesRef.current) return;

    const matrix = new THREE.Matrix4();
    for (let i = 0; i < count; i++) {
      particlesRef.current.getMatrixAt(i, matrix);
      const position = new THREE.Vector3();
      const scale = new THREE.Vector3();
      matrix.decompose(position, new THREE.Quaternion(), scale);

      // Follow mouse
      const mouseX = mousePos.x * 5;
      const mouseY = mousePos.y * 5;
      const distToMouse = Math.sqrt(
        Math.pow(position.x - mouseX, 2) + Math.pow(position.y - mouseY, 2)
      );
      
      if (distToMouse < 2) {
        const pushStrength = (2 - distToMouse) / 2;
        const angle = Math.atan2(position.y - mouseY, position.x - mouseX);
        position.x += Math.cos(angle) * pushStrength * 0.05;
        position.y += Math.sin(angle) * pushStrength * 0.05;
      }

      // React to click
      if (clickPos) {
        const clickX = clickPos.x * 5;
        const clickY = clickPos.y * 5;
        const distToClick = Math.sqrt(
          Math.pow(position.x - clickX, 2) + Math.pow(position.y - clickY, 2)
        );
        if (distToClick < 3) {
          const popStrength = (3 - distToClick) / 3;
          const angle = Math.atan2(position.y - clickY, position.x - clickX);
          position.x += Math.cos(angle) * popStrength * 0.3;
          position.y += Math.sin(angle) * popStrength * 0.3;
          position.z += popStrength * 0.5;
        }
      }

      // Floating animation
      position.y += Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.01;
      position.x += Math.cos(state.clock.elapsedTime * 0.3 + i) * 0.01;
      position.z += Math.sin(state.clock.elapsedTime * 0.4 + i) * 0.005;

      matrix.compose(position, new THREE.Quaternion(), scale);
      particlesRef.current.setMatrixAt(i, matrix);
    }
    particlesRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={particlesRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshStandardMaterial
        color="#00d4ff"
        transparent
        opacity={0.6}
        metalness={0.9}
        roughness={0.1}
      />
    </instancedMesh>
  );
}

function WaveScene() {
  const mousePos = useMousePosition();
  const clickPos = useClickPosition();

  return (
    <>
      {[0, 1, 2].map((i) => (
        <WavePlane
          key={i}
          index={i}
          mousePos={mousePos}
          clickPos={clickPos}
        />
      ))}
      <FloatingParticles mousePos={mousePos} clickPos={clickPos} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} color="#66d9ff" />
      <pointLight position={[-10, 10, -10]} intensity={1.2} color="#aa88ff" />
      <pointLight position={[0, 10, 0]} intensity={1} color="#66aaff" />
    </>
  );
}

export default function InteractiveWaveBackground() {
  return (
    <div className="absolute inset-0 -z-10 pointer-events-none">
      <Canvas
        camera={{ position: [0, 5, 10], fov: 75 }}
        gl={{ alpha: true, antialias: true }}
      >
        <WaveScene />
      </Canvas>
    </div>
  );
}

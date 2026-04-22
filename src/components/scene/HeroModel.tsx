"use client";

import { Suspense, useEffect, useRef } from "react";
import { Float, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Model() {
  const gltf = useGLTF("/models/hero.glb");
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.z += delta * 0.35;
  });

  useEffect(() => {
    gltf.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh || !mesh.material) return;
      const materials = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];

      materials.forEach((mat) => {
        const material = mat as THREE.MeshStandardMaterial;
        if (!("color" in material)) return;

        // "Radio / monochrome" vibe with visible light highlights.
        material.color = material.color.clone().lerp(new THREE.Color("#bdbdbd"), 0.55);
        if ("metalness" in material) material.metalness = 0.28;
        if ("roughness" in material) material.roughness = 0.62;
        if ("envMapIntensity" in material) material.envMapIntensity = 0.15;
        material.needsUpdate = true;
      });

      // Overlay a subtle wireframe clone so edges remain visible.
      if (mesh.getObjectByName("__wireframe_overlay__")) return;
      const wireframe = new THREE.LineSegments(
        new THREE.WireframeGeometry(mesh.geometry),
        new THREE.LineBasicMaterial({
          color: "#d9d9d9",
          transparent: true,
          opacity: 0.24,
        })
      );
      wireframe.name = "__wireframe_overlay__";
      wireframe.position.copy(mesh.position);
      wireframe.rotation.copy(mesh.rotation);
      wireframe.scale.copy(mesh.scale);
      mesh.add(wireframe);
    });
  }, [gltf.scene]);

  return (
    <group ref={groupRef}>
      <primitive object={gltf.scene} scale={1.5} position={[0, -1.25, 0]} />
    </group>
  );
}

export default function HeroModel() {
  return (
    <Suspense fallback={null}>
      <Float speed={1.2} rotationIntensity={0} floatIntensity={0.5}>
        <Model />
      </Float>
    </Suspense>
  );
}


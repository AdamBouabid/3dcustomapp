"use client";
import React, { Suspense, useMemo, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, OrbitControls, useGLTF, ContactShadows, MeshReflectorMaterial } from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "gsap";

function CameraController({ focusMode, activeItem, itemsData }) {
  const { camera, controls } = useThree();

  useEffect(() => {
    if (!controls) return;

    let targetY = 1.0;
    let distance = 2.4;
    let lookAtY = 1.0;

    if (focusMode && activeItem) {
      const item = itemsData.find((i) => i.id === activeItem);
      const cat = (item?.category || "").toLowerCase();

      if (cat.includes("top") || cat.includes("shirt") || cat.includes("dress")) {
        targetY = 1.35; // Chest/Shoulders
        distance = 1.4;
        lookAtY = 1.35;
      } else if (cat.includes("bottom") || cat.includes("pant") || cat.includes("skirt")) {
        targetY = 0.6; // Waist/Legs
        distance = 1.6;
        lookAtY = 0.6;
      } else if (cat.includes("shoe") || cat.includes("foot") || cat.includes("heel")) {
        targetY = 0.05; // Feet
        distance = 1.2;
        lookAtY = -0.1;
      } else {
        targetY = 1.0;
        distance = 1.8;
        lookAtY = 1.0;
      }
    } else if (focusMode) {
      // Global focus
      targetY = 1.0;
      distance = 2.0;
      lookAtY = 1.0;
    }

    const newPos = new THREE.Vector3(0, targetY, distance);
    const newTarget = new THREE.Vector3(0, lookAtY, 0);

    gsap.to(camera.position, {
      x: newPos.x,
      y: newPos.y,
      z: newPos.z,
      duration: 1.2,
      ease: "power3.inOut",
    });

    gsap.to(controls.target, {
      x: newTarget.x,
      y: newTarget.y,
      z: newTarget.z,
      duration: 1.2,
      ease: "power3.inOut",
      onUpdate: () => controls.update(),
    });
  }, [focusMode, activeItem, camera, controls, itemsData]);

  return null;
}

function StudioRoom() {
  return (
    <group position={[0, -1, 0]}>
      {/* Floor with reflection */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={40}
          roughness={1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#151515"
          metalness={0.5}
        />
      </mesh>

      {/* Back Wall */}
      <mesh position={[0, 5, -5]} receiveShadow>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#0f0f15" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Left Wall */}
      <mesh position={[-10, 5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#0b0b10" roughness={0.9} />
      </mesh>

      {/* Right Wall */}
      <mesh position={[10, 5, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#0b0b10" roughness={0.9} />
      </mesh>

      {/* Decorative Neon Vertical Strip on Back Wall */}
      <mesh position={[-2, 5, -4.95]}>
        <boxGeometry args={[0.05, 10, 0.05]} />
        <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={2} />
      </mesh>
      <mesh position={[2, 5, -4.95]}>
        <boxGeometry args={[0.05, 10, 0.05]} />
        <meshStandardMaterial color="#6366f1" emissive="#6366f1" emissiveIntensity={2} />
      </mesh>

      {/* Accent glow lights */}
      <pointLight position={[5, 5, 5]} intensity={1.5} color="#8b5cf6" />
      <pointLight position={[-5, 5, 5]} intensity={1.5} color="#6366f1" />
      
      <ContactShadows
        opacity={0.4}
        scale={10}
        blur={2}
        far={4.5}
        resolution={256}
        color="#000000"
      />
    </group>
  );
}

function ModelScene({ url, color }) {
  const { scene } = useGLTF(url);
  const cloned = useMemo(() => scene.clone(true), [scene]);

  useMemo(() => {
    if (!color) return;
    cloned.traverse((child) => {
      if (!child.isMesh) return;
      if (child.material) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((mat) => {
          if (mat.color) {
            mat.color.set(color);
            mat.needsUpdate = true;
          }
        });
      }
    });
  }, [cloned, color]);

  return <primitive object={cloned} />;
}

export default function Scene({
  items = [],
  baseModelUrl = "/models/female_anatomy.glb",
  colors = {},
  autoRotate = false,
  environment = "city",
  focusMode = false,
  canvasRef,
  activeItem,
  initialCatalogItems = [],
  showBaseModel = true,
  enableFocusMode = true,
}) {
  const cameraPosition = [0, 1, 2.4];

  const renderItems = useMemo(() => {
    if (!showBaseModel) {
      return items;
    }

    const baseItem = { id: "base", url: baseModelUrl };
    return [baseItem, ...items];
  }, [baseModelUrl, items, showBaseModel]);

  return (
    <Canvas
      ref={canvasRef}
      style={{ background: "#050510" }}
      camera={{ position: cameraPosition, fov: 50 }}
      shadows
    >
      <CameraController 
        focusMode={enableFocusMode ? focusMode : false} 
        activeItem={activeItem} 
        itemsData={initialCatalogItems} 
      />
      <fog attach="fog" args={["#050510", 0, 15]} />
      <ambientLight intensity={0.4} />
      <spotLight
        position={[0, 10, 5]}
        intensity={2}
        angle={0.5}
        penumbra={1}
        castShadow
        shadow-bias={-0.0001}
      />
      <directionalLight position={[2, 3, 2]} intensity={1.5} color="#6366f1" />
      <directionalLight position={[-2, 3, 2]} intensity={1.5} color="#8b5cf6" />
      <Suspense fallback={null}>
        <Environment preset={environment} background={false} />
        <StudioRoom />
        <group position={[0, -0.9, 0]}>
          {renderItems.map(({ id, url }) => (
            <ModelScene key={id} url={url} color={colors[id]} />
          ))}
        </group>
      </Suspense>
      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom
        enableRotate
        maxPolarAngle={Math.PI / 2}
        minDistance={0.5}
        maxDistance={4.5}
        autoRotate={autoRotate}
        autoRotateSpeed={1.2}
      />
    </Canvas>
  );
}

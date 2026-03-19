"use client";
import React, { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, useGLTF, Grid } from "@react-three/drei";

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
}) {
  const cameraPosition = focusMode ? [0, 1, 2.0] : [0, 1, 2.4];

  const renderItems = useMemo(() => {
    const baseItem = { id: "base", url: baseModelUrl };
    return [baseItem, ...items];
  }, [baseModelUrl, items]);

  return (
    <Canvas
      ref={canvasRef}
      style={{ background: "#111" }}
      camera={{ position: cameraPosition, fov: 50 }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[2, 3, 1]} intensity={1.2} />
      <Grid args={[10, 10]} cellSize={0.5} cellColor="#6b7280" sectionSize={2} sectionColor="#1f2937" fadeDistance={30} fadeStrength={1} />
      <Suspense fallback={null}>
        <Environment preset={environment} background={false} />
        {renderItems.map(({ id, url }) => (
          <ModelScene key={id} url={url} color={colors[id]} />
        ))}
      </Suspense>
      <OrbitControls
        enablePan={false}
        enableZoom
        enableRotate
        autoRotate={autoRotate}
        autoRotateSpeed={1.2}
      />
    </Canvas>
  );
}

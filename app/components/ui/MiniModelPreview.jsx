"use client";
import React, { Suspense, useMemo, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Center, ContactShadows, Environment, useGLTF } from "@react-three/drei";

function ModelPreview({ url, color }) {
  const { scene } = useGLTF(url);
  const cloned = useMemo(() => scene.clone(true), [scene]);
  const previewRef = useRef();

  useEffect(() => {
    if (!color) return;
    cloned.traverse((child) => {
      if (!child.isMesh) return;
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach((mat) => {
        if (mat.color) {
          mat.color.set(color);
          mat.needsUpdate = true;
        }
      });
    });
  }, [cloned, color]);

  useFrame(({ clock }) => {
    if (!previewRef.current) return;
    previewRef.current.rotation.y = clock.elapsedTime * 0.35;
  });

  return <primitive ref={previewRef} object={cloned} />;
}

export default function MiniModelPreview({ url, color }) {
  return (
    <div className="mini-model-preview" style={{ width: "100%", height: "100%" }}>
      <Canvas
        style={{ width: "100%", height: "100%" }}
        dpr={[1, 1.3]}
        camera={{ position: [0, 0.8, 2.4], fov: 45 }}
      >
        <ambientLight intensity={0.85} />
        <directionalLight position={[3, 4, 2]} intensity={1.1} />
        <directionalLight position={[-3, 2, -2]} intensity={0.75} />
        <Suspense fallback={null}>
          <Environment preset="studio" />
          <Center top>
            <ModelPreview url={url} color={color} />
          </Center>
          <ContactShadows position={[0, -0.75, 0]} opacity={0.6} scale={1.6} blur={2.5} far={1.25} />
        </Suspense>
      </Canvas>
    </div>
  );
}

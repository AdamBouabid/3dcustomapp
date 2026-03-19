"use client";
import React, { Suspense, useMemo, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, useGLTF } from "@react-three/drei";
import * as THREE from "three";

function getPreviewFraming(category, type, label) {
  const key = `${category ?? ""} ${type ?? ""} ${label ?? ""}`.toLowerCase();
  const overallScale = 0.68; // scale down previews further

  if (/(shoe|boot|foot|sneaker|heel)/.test(key)) {
    return {
      camera: { position: [0, -0.12, 1.55], fov: 30 },
      fitScale: 1.16 * overallScale,
      yShift: -0.05,
      hoverScale: 1.03,
      restRotation: -0.1,
    };
  }

  if (/(hat|cap|head|beanie|hood)/.test(key)) {
    return {
      camera: { position: [0, 0.34, 1.34], fov: 28 },
      fitScale: 1.08 * overallScale,
      yShift: 0.12,
      hoverScale: 1.04,
      restRotation: 0.08,
    };
  }

  if (/(dress|one-piece|gown|skirt)/.test(key)) {
    return {
      camera: { position: [0, 0.06, 2.02], fov: 34 },
      fitScale: 1.3 * overallScale,
      yShift: 0.03,
      hoverScale: 1.05,
      restRotation: 0,
    };
  }

  if (/(top|shirt|jacket|hoodie|coat|sweater)/.test(key)) {
    return {
      camera: { position: [0, 0.12, 1.72], fov: 32 },
      fitScale: 1.22 * overallScale,
      yShift: 0.05,
      hoverScale: 1.045,
      restRotation: 0,
    };
  }

  return {
    camera: { position: [0, 0.08, 1.82], fov: 34 },
    fitScale: 1.18 * overallScale,
    yShift: 0.02,
    hoverScale: 1.04,
    restRotation: 0,
  };
}

function ModelPreview({ url, hovered, framing, onReady }) {
  const { scene } = useGLTF(url);
  const cloned = useMemo(() => {
    const previewScene = scene.clone(true);
    const box = new THREE.Box3().setFromObject(previewScene);

    if (box.isEmpty()) {
      return previewScene;
    }

    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const maxDimension = Math.max(size.x, size.y, size.z) || 1;
    const scale = framing.fitScale / maxDimension;

    previewScene.scale.setScalar(scale);
    previewScene.position.set(-center.x * scale, -center.y * scale, -center.z * scale);

    const scaledHeight = size.y * scale;
    previewScene.position.y += scaledHeight * framing.yShift;

    return previewScene;
  }, [framing.fitScale, framing.yShift, scene]);
  const previewRef = useRef();

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  useFrame((_, delta) => {
    if (!previewRef.current) return;

    const targetScale = hovered ? framing.hoverScale : 1;
    const nextScale = THREE.MathUtils.damp(previewRef.current.scale.x, targetScale, 6, delta);
    previewRef.current.scale.setScalar(nextScale);

    const targetRotation = hovered
      ? previewRef.current.rotation.y + delta * 0.7
      : framing.restRotation;

    previewRef.current.rotation.y = THREE.MathUtils.damp(
      previewRef.current.rotation.y,
      targetRotation,
      hovered ? 5 : 7,
      delta
    );
  });

  return (
    <group ref={previewRef}>
      <primitive object={cloned} />
    </group>
  );
}

export default function MiniModelPreview({ url, category, type, label, hovered = false, color = "#ffffff" }) {
  const framing = useMemo(() => getPreviewFraming(category, type, label), [category, type, label]);
  const [isReady, setIsReady] = React.useState(false);

  return (
    <div className="mini-model-preview" style={{ width: "100%", height: "100%", position: "relative" }}>
      {!isReady && (
        <div className="mini-model-preview__loader">
          <div className="mini-model-preview__spinner" />
        </div>
      )}
      <Canvas
        style={{ width: "100%", height: "100%" }}
        dpr={[1, 1.3]}
        camera={framing.camera}
      >
        <ambientLight intensity={0.45} color={color} />
        <directionalLight position={[2.2, 3, 2.6]} intensity={1.15} color={color} />
        <directionalLight position={[-2, 1.8, -1.8]} intensity={0.5} color={color} />
        <Suspense fallback={null}>
          <Environment preset="studio" />
          <ModelPreview url={url} hovered={hovered} framing={framing} onReady={() => setIsReady(true)} />
        </Suspense>
      </Canvas>
    </div>
  );
}

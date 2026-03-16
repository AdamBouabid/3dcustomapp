import React, { useRef, useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

export default function Garment({ url, bodyRef, manualY, manualS }) {
  const { scene } = useGLTF(url);
  const garmentRef = useRef();

  // Memoize the clone so it doesn't re-render unless the URL changes
  const cloned = useMemo(() => scene.clone(), [scene]);

  useEffect(() => {
    if (cloned && bodyRef.current && garmentRef.current) {
      const bodyBox = new THREE.Box3().setFromObject(bodyRef.current);
      const bodySize = new THREE.Vector3();
      bodyBox.getSize(bodySize);

      const garmentBox = new THREE.Box3().setFromObject(cloned);
      const garmentSize = new THREE.Vector3();
      garmentBox.getSize(garmentSize);

      // Scale
      const baseScale = (bodySize.x / garmentSize.x) * 1.08; 
      garmentRef.current.scale.setScalar(baseScale * manualS);

      // Align Center
      const centeredBox = new THREE.Box3().setFromObject(garmentRef.current);
      const currentCenter = new THREE.Vector3();
      centeredBox.getCenter(currentCenter);
      garmentRef.current.position.x = -currentCenter.x;
      garmentRef.current.position.z = -currentCenter.z;

      // Align Height
      const isSkirt = url.toLowerCase().includes('skirt');
      const basePosition = isSkirt ? -bodySize.y * 0.4 : bodySize.y * 0.1;
      garmentRef.current.position.y = basePosition + manualY;

      // Material Fix
      cloned.traverse((child) => {
        if (child.isMesh) {
          child.material.polygonOffset = true;
          child.material.polygonOffsetFactor = -1;
        }
      });
    }
  }, [cloned, bodyRef, url, manualY, manualS]);

  return (
    <group ref={garmentRef}>
      <primitive object={cloned} />
    </group>
  );
}
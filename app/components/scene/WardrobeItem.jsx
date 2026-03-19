"use client";
import React, { useRef, useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";

function applyToonShader(material, accent = "#7c88ff") {
  if (!material || material.userData?.__toonApplied) return material;
  material.userData = material.userData || {};
  material.userData.__toonApplied = true;

  try {
    // Try using built-in MeshToonMaterial for stability rather than custom shader patching.
    const toon = new THREE.MeshToonMaterial({
      color: material.color || new THREE.Color(accent),
      map: material.map,
      lightMap: material.lightMap,
      aoMap: material.aoMap,
      emissive: material.emissive,
      emissiveMap: material.emissiveMap,
      emissiveIntensity: material.emissiveIntensity,
      normalMap: material.normalMap,
      displacementMap: material.displacementMap,
      roughness: material.roughness ?? 0.5,
      metalness: material.metalness ?? 0,
      skinning: material.skinning,
      morphTargets: material.morphTargets,
      morphNormals: material.morphNormals,
      transparent: material.transparent,
      opacity: material.opacity,
      side: material.side,
    });

    // Preserve any userData and other props.
    toon.userData = { ...material.userData };
    return toon;
  } catch (error) {
    // Fallback: keep original material if toon conversion fails
    console.warn("applyToonShader failed, using original material", error);
    return material;
  }
}

function ItemInner({
  url,
  position = [0, 0, 0],
  scale = 1,
  applyMaterial,
  color,
  mirrorX = false,
  shaderMode = "toon",
  onModelReady,
}) {
  const { scene } = useGLTF(url);
  const modelScene = useMemo(() => cloneSkeleton(scene), [scene]);
  const groupRef = useRef();
  const animScale = useRef(0);

  // Apply material/color once on load, not every frame
  useEffect(() => {
    try {
      modelScene.traverse((child) => {
        if (!child.isMesh) return;

        if (applyMaterial) {
          applyMaterial(child);
        } else if (color) {
          const originalMaterials = Array.isArray(child.material) ? child.material : [child.material].filter(Boolean);
          const updated = originalMaterials.map((mat) => {
            const cloned = mat.clone ? mat.clone() : mat;
            cloned.color?.set(color);
            return cloned;
          });
          child.material = Array.isArray(child.material) ? updated : updated[0];
        }

        let materials = Array.isArray(child.material) ? child.material : [child.material].filter(Boolean);
        if (materials.length === 0) return;

        // Enhance with a subtle toon/rim shader look when enabled
        if (shaderMode === "toon") {
          materials = materials.map((mat) => {
            const accent = mat.color ? `#${mat.color.getHexString()}` : "#7c88ff";
            return applyToonShader(mat, accent);
          });

          child.material = Array.isArray(child.material) ? materials : materials[0];
        }

        // Negative scale mirroring flips winding; force double-sided to avoid disappearing mirrored meshes.
        if (mirrorX) {
          materials.forEach((mat) => {
            mat.side = THREE.DoubleSide;
            mat.needsUpdate = true;
          });
        }
      });
    } catch (error) {
      // If applying materials fails, keep the model present rather than crashing.
      console.warn("Failed to apply material settings", error);
    }
  }, [applyMaterial, color, modelScene, mirrorX, shaderMode]);

  // Update color when it changes without remounting
  useEffect(() => {
    if (!color) return;

    try {
      modelScene.traverse((child) => {
        if (!child.isMesh) return;

        const materials = Array.isArray(child.material) ? child.material : [child.material].filter(Boolean);
        materials.forEach((mat) => {
          mat.color?.set(color);
          if (mirrorX) {
            mat.side = THREE.DoubleSide;
            mat.needsUpdate = true;
          }
        });
      });
    } catch (error) {
      console.warn("Failed to update material colors", error);
    }
  }, [color, modelScene, mirrorX]);

  // Pop-in scale animation only – fitting is handled via idle-scheduled useEffect above
  useFrame(() => {
    if (!groupRef.current) return;
    const baseScale = typeof scale === "number" ? scale : 1;
    animScale.current += (baseScale - animScale.current) * 0.1;
    groupRef.current.scale.set(
      mirrorX ? -animScale.current : animScale.current,
      animScale.current,
      animScale.current
    );
  });

  useEffect(() => {
    if (!onModelReady) {
      return undefined;
    }

    onModelReady(modelScene);

    // Do not signal "model unloaded" here; unmounting can happen during
    // updates and would incorrectly hide the scene.
    return undefined;
  }, [modelScene, onModelReady]);

  return (
    <group ref={groupRef} position={position}>
      <primitive object={modelScene} />
    </group>
  );
}

export default function WardrobeItem({ url, ...props }) {
  if (!url) return null;
  return <ItemInner url={url} {...props} />;
}

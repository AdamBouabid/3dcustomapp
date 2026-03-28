"use client";
import React, { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "gsap";
import { DEFAULT_ROOM_CUSTOMIZATION } from "../ui/roomCustomizationConfig";

const ROOM_DIMENSIONS = {
  width: 10.8,
  depth: 9.4,
  height: 4.8,
  openingWidth: 7.8,
};

const SCENE_PROFILES = {
  "gallery-day": {
    cssBackground: "linear-gradient(180deg, #efe9df 0%, #ddd6ca 52%, #c7c0b7 100%)",
    env: "apartment",
    envIntensity: 0.86,
    fogColor: "#e8e0d4",
    ambientIntensity: 0.9,
    ambientColor: "#fff2e4",
    sunPosition: [5.4, 6.5, 3.4],
    sunIntensity: 1.75,
    sunColor: "#fff2d9",
    fillPosition: [-4.5, 3.8, -1.8],
    fillIntensity: 0.45,
    fillColor: "#d5e4f2",
    topSpotIntensity: 0.72,
    topSpotColor: "#f2d6b6",
    shadowOpacity: 0.34,
    windowMultiplier: 1.05,
    dustColor: "#f8e8d9",
    accentGlow: "#f0d0a4",
    vignette: "radial-gradient(ellipse at 50% 45%, transparent 48%, rgba(32, 24, 19, 0.12) 100%)",
  },
  "gallery-sunset": {
    cssBackground: "linear-gradient(180deg, #f3dfcc 0%, #d7c4b1 52%, #b99f89 100%)",
    env: "sunset",
    envIntensity: 0.92,
    fogColor: "#e5d0bd",
    ambientIntensity: 0.78,
    ambientColor: "#ffe7cf",
    sunPosition: [4.8, 5.8, 2.8],
    sunIntensity: 1.55,
    sunColor: "#ffd59f",
    fillPosition: [-4.2, 3.5, -2.2],
    fillIntensity: 0.38,
    fillColor: "#f0b89a",
    topSpotIntensity: 0.88,
    topSpotColor: "#f1b27e",
    shadowOpacity: 0.36,
    windowMultiplier: 1.15,
    dustColor: "#ffe2c4",
    accentGlow: "#efb274",
    vignette: "radial-gradient(ellipse at 50% 48%, transparent 44%, rgba(62, 35, 20, 0.16) 100%)",
  },
  "gallery-evening": {
    cssBackground: "linear-gradient(180deg, #13161d 0%, #0c1015 52%, #08090c 100%)",
    env: "night",
    envIntensity: 0.74,
    fogColor: "#131821",
    ambientIntensity: 0.34,
    ambientColor: "#b8c8da",
    sunPosition: [4.8, 5.2, 2.2],
    sunIntensity: 0.84,
    sunColor: "#b8d1ff",
    fillPosition: [-4.5, 3.8, -2.6],
    fillIntensity: 0.52,
    fillColor: "#95a9d6",
    topSpotIntensity: 1.12,
    topSpotColor: "#ffd7a5",
    shadowOpacity: 0.44,
    windowMultiplier: 0.72,
    dustColor: "#d6deea",
    accentGlow: "#ffd7a9",
    vignette: "radial-gradient(ellipse at 50% 46%, transparent 38%, rgba(0, 0, 0, 0.34) 100%)",
  },
};

function pseudoRandom(seed) {
  const value = Math.sin(seed) * 43758.5453123;
  return value - Math.floor(value);
}

function dampFactor(speed, delta) {
  return 1 - Math.exp(-speed * delta);
}

function getSceneProfile(preset) {
  return SCENE_PROFILES[preset] ?? SCENE_PROFILES["gallery-day"];
}

function CameraController({ focusMode, activeItem, itemsData }) {
  const { camera, controls } = useThree();

  useEffect(() => {
    if (!controls) return;

    let targetX = 0.22;
    let targetY = 1.15;
    let distance = 3.65;
    let lookAtY = 1.0;

    if (focusMode && activeItem) {
      const item = itemsData.find((entry) => entry.id === activeItem);
      const category = `${item?.category ?? ""} ${item?.type ?? ""}`.toLowerCase();

      if (/(top|shirt|dress|jacket|hoodie|coat|sweater)/.test(category)) {
        targetY = 1.42;
        distance = 2.08;
        lookAtY = 1.3;
      } else if (/(bottom|pant|trouser|jean|skirt)/.test(category)) {
        targetY = 0.78;
        distance = 2.32;
        lookAtY = 0.68;
      } else if (/(shoe|footwear|heel|boot|sneaker)/.test(category)) {
        targetY = 0.28;
        distance = 1.9;
        lookAtY = 0.02;
      }
    } else if (focusMode) {
      targetY = 1.08;
      distance = 2.68;
      lookAtY = 1.0;
    }

    const nextPosition = new THREE.Vector3(targetX, targetY, distance);
    const nextTarget = new THREE.Vector3(0, lookAtY, 0);

    gsap.to(camera.position, {
      x: nextPosition.x,
      y: nextPosition.y,
      z: nextPosition.z,
      duration: 1.15,
      ease: "power3.inOut",
    });

    gsap.to(controls.target, {
      x: nextTarget.x,
      y: nextTarget.y,
      z: nextTarget.z,
      duration: 1.15,
      ease: "power3.inOut",
      onUpdate: () => controls.update(),
    });
  }, [activeItem, camera, controls, focusMode, itemsData]);

  return null;
}

function AnimatedStandardMaterial({
  color,
  emissiveColor = "#000000",
  emissiveIntensity = 0,
  roughness = 0.72,
  metalness = 0.04,
  transparent = false,
  opacity = 1,
  side = THREE.FrontSide,
}) {
  const ref = useRef(null);
  const targetColor = useMemo(() => new THREE.Color(color), [color]);
  const targetEmissive = useMemo(() => new THREE.Color(emissiveColor), [emissiveColor]);

  useFrame((_, delta) => {
    if (!ref.current) {
      return;
    }

    ref.current.color.lerp(targetColor, dampFactor(6, delta));
    ref.current.emissive.lerp(targetEmissive, dampFactor(5, delta));
    ref.current.emissiveIntensity = THREE.MathUtils.damp(
      Number.isFinite(ref.current.emissiveIntensity) ? ref.current.emissiveIntensity : emissiveIntensity,
      emissiveIntensity,
      5,
      delta
    );
    ref.current.opacity = THREE.MathUtils.damp(
      Number.isFinite(ref.current.opacity) ? ref.current.opacity : opacity,
      opacity,
      5,
      delta
    );
  });

  return (
    <meshStandardMaterial
      ref={ref}
      color={color}
      emissive={emissiveColor}
      emissiveIntensity={emissiveIntensity}
      roughness={roughness}
      metalness={metalness}
      transparent={transparent}
      opacity={opacity}
      side={side}
    />
  );
}

function RoomSurface({
  position,
  rotation = [0, 0, 0],
  args,
  color,
  roughness,
  metalness,
  emissiveColor,
  emissiveIntensity,
  transparent,
  opacity,
}) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={args} />
      <AnimatedStandardMaterial
        color={color}
        roughness={roughness}
        metalness={metalness}
        emissiveColor={emissiveColor}
        emissiveIntensity={emissiveIntensity}
        transparent={transparent}
        opacity={opacity}
      />
    </mesh>
  );
}

function WindowFeature({ position, rotation, tintColor, glowStrength, frameColor }) {
  const beamRef = useRef(null);
  const beamRefSecondary = useRef(null);
  const tint = useMemo(() => new THREE.Color(tintColor), [tintColor]);

  useFrame((state, delta) => {
    const pulse = 0.12 + Math.sin(state.clock.elapsedTime * 0.9) * 0.02;

    if (beamRef.current) {
      beamRef.current.material.color.lerp(tint, dampFactor(4, delta));
      beamRef.current.material.opacity = THREE.MathUtils.damp(beamRef.current.material.opacity, pulse, 4, delta);
    }

    if (beamRefSecondary.current) {
      beamRefSecondary.current.material.color.lerp(tint, dampFactor(4, delta));
      beamRefSecondary.current.material.opacity = THREE.MathUtils.damp(beamRefSecondary.current.material.opacity, pulse * 0.6, 4, delta);
    }
  });

  return (
    <group position={position} rotation={rotation}>
      <RoomSurface args={[2.28, 3.04, 0.08]} position={[0, 0, 0.02]} color={frameColor} roughness={0.56} metalness={0.08} />
      <RoomSurface args={[1.98, 2.74, 0.05]} position={[0, 0, 0.07]} color="#11151a" roughness={0.2} metalness={0.16} />
      <mesh position={[0, 0, 0.11]} receiveShadow>
        <planeGeometry args={[1.78, 2.56]} />
        <AnimatedStandardMaterial
          color={tintColor}
          emissiveColor={tintColor}
          emissiveIntensity={glowStrength * 0.6}
          roughness={0.08}
          metalness={0.18}
          transparent
          opacity={0.56}
        />
      </mesh>
      <RoomSurface args={[0.08, 2.54, 0.08]} position={[0, 0, 0.14]} color={frameColor} roughness={0.42} metalness={0.08} />
      <RoomSurface args={[1.82, 0.08, 0.08]} position={[0, 0, 0.14]} color={frameColor} roughness={0.42} metalness={0.08} />
      <mesh ref={beamRef} position={[0, -0.46, 0.86]} rotation={[-Math.PI / 4, 0, 0]}>
        <planeGeometry args={[1.9, 3]} />
        <meshBasicMaterial color={tintColor} transparent depthWrite={false} opacity={0.12} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={beamRefSecondary} position={[0, -0.16, 0.68]} rotation={[-Math.PI / 4.8, 0, 0]}>
        <planeGeometry args={[1.28, 2.16]} />
        <meshBasicMaterial color={tintColor} transparent depthWrite={false} opacity={0.08} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function WallFrame({ position, frameColor, artColor, glowColor, rotation = [0, 0, 0], scale = 1, artTextureUrl }) {
  const ref = useRef(null);
  const artTexture = useMemo(() => {
    if (!artTextureUrl) {
      return null;
    }

    const loader = new THREE.TextureLoader();
    const texture = loader.load(artTextureUrl);
    // Three.js r0.183 naming uses ColorSpace constants; avoid direct sRGBEncoding symbol reference.
    if (typeof THREE.SRGBColorSpace !== "undefined") {
      texture.colorSpace = THREE.SRGBColorSpace;
    } else if (typeof THREE.LinearSRGBColorSpace !== "undefined") {
      texture.colorSpace = THREE.LinearSRGBColorSpace;
    } else if (typeof THREE["sRGBEncoding"] !== "undefined") {
      texture.encoding = THREE["sRGBEncoding"];
    }
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    return texture;
  }, [artTextureUrl]);

  useFrame((state, delta) => {
    if (!ref.current) {
      return;
    }

    ref.current.rotation.z = THREE.MathUtils.damp(ref.current.rotation.z, Math.sin(state.clock.elapsedTime * 0.4 + position[0]) * 0.012, 4, delta);
    ref.current.position.y = THREE.MathUtils.damp(ref.current.position.y, position[1] + Math.sin(state.clock.elapsedTime * 0.8 + position[2]) * 0.02, 4, delta);
  });

  return (
    <group ref={ref} position={position} rotation={rotation} scale={scale}>
      <RoomSurface args={[1.34, 1.68, 0.08]} position={[0, 0, 0]} color={frameColor} roughness={0.42} metalness={0.08} />
      <RoomSurface args={[1.12, 1.46, 0.04]} position={[0, 0, 0.05]} color="#f5eee3" roughness={0.8} metalness={0.02} />
      <mesh position={[0, 0, 0.08]}>
        <planeGeometry args={[0.94, 1.28]} />
        {artTexture ? (
          <meshStandardMaterial map={artTexture} roughness={0.72} metalness={0.03} />
        ) : (
          <AnimatedStandardMaterial color={artColor} emissiveColor={glowColor} emissiveIntensity={0.08} roughness={0.72} metalness={0.03} />
        )}
      </mesh>
      <RoomSurface args={[0.86, 0.06, 0.04]} position={[0, -0.24, 0.11]} color={glowColor} roughness={0.36} metalness={0.04} />
      <RoomSurface args={[0.56, 0.05, 0.04]} position={[0, 0.2, 0.11]} color="#ffffff" roughness={0.38} metalness={0.02} opacity={0.9} transparent />
    </group>
  );
}

function Bench({ position, woodColor, accentColor }) {
  return (
    <group position={position}>
      <RoomSurface args={[2.2, 0.18, 0.82]} position={[0, 0.18, 0]} color={woodColor} roughness={0.54} metalness={0.08} />
      <RoomSurface args={[2.0, 0.08, 0.68]} position={[0, 0.34, 0]} color={accentColor} roughness={0.78} metalness={0.02} />
      <RoomSurface args={[0.12, 0.42, 0.12]} position={[-0.88, -0.04, -0.24]} color={woodColor} roughness={0.48} metalness={0.08} />
      <RoomSurface args={[0.12, 0.42, 0.12]} position={[0.88, -0.04, -0.24]} color={woodColor} roughness={0.48} metalness={0.08} />
      <RoomSurface args={[0.12, 0.42, 0.12]} position={[-0.88, -0.04, 0.24]} color={woodColor} roughness={0.48} metalness={0.08} />
      <RoomSurface args={[0.12, 0.42, 0.12]} position={[0.88, -0.04, 0.24]} color={woodColor} roughness={0.48} metalness={0.08} />
    </group>
  );
}

function Planter({ position, potColor, leafColor }) {
  const foliageRef = useRef(null);

  useFrame((state, delta) => {
    if (!foliageRef.current) {
      return;
    }

    foliageRef.current.rotation.z = THREE.MathUtils.damp(foliageRef.current.rotation.z, Math.sin(state.clock.elapsedTime * 0.6 + position[0]) * 0.06, 3, delta);
  });

  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.26, 0.3, 0.42, 18]} />
        <AnimatedStandardMaterial color={potColor} roughness={0.56} metalness={0.1} />
      </mesh>
      <group ref={foliageRef} position={[0, 0.72, 0]}>
        <mesh castShadow position={[0, 0.16, 0]}>
          <sphereGeometry args={[0.34, 18, 18]} />
          <AnimatedStandardMaterial color={leafColor} roughness={0.82} metalness={0.02} />
        </mesh>
        <mesh castShadow position={[0.2, -0.02, 0.1]}>
          <sphereGeometry args={[0.22, 14, 14]} />
          <AnimatedStandardMaterial color={leafColor} roughness={0.82} metalness={0.02} />
        </mesh>
        <mesh castShadow position={[-0.2, 0.02, -0.08]}>
          <sphereGeometry args={[0.22, 14, 14]} />
          <AnimatedStandardMaterial color={leafColor} roughness={0.82} metalness={0.02} />
        </mesh>
      </group>
    </group>
  );
}

function ConsoleTable({ position, woodColor, accentColor }) {
  return (
    <group position={position}>
      <RoomSurface args={[1.9, 0.12, 0.44]} position={[0, 0.42, 0]} color={woodColor} roughness={0.48} metalness={0.08} />
      <RoomSurface args={[1.7, 0.08, 0.2]} position={[0, 0.08, -0.12]} color={accentColor} roughness={0.72} metalness={0.04} />
      <RoomSurface args={[0.12, 0.72, 0.12]} position={[-0.72, 0.02, 0]} color={woodColor} roughness={0.48} metalness={0.08} />
      <RoomSurface args={[0.12, 0.72, 0.12]} position={[0.72, 0.02, 0]} color={woodColor} roughness={0.48} metalness={0.08} />
    </group>
  );
}

function Sconce({ position, lightColor, intensity = 1 }) {
  return (
    <group position={position}>
      <RoomSurface args={[0.18, 0.36, 0.08]} position={[0, 0, 0]} color="#70665d" roughness={0.38} metalness={0.16} />
      <mesh position={[0, 0.06, 0.08]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <AnimatedStandardMaterial color="#fff4dc" emissiveColor={lightColor} emissiveIntensity={intensity} roughness={0.18} metalness={0.06} />
      </mesh>
      <pointLight position={[0, 0.04, 0.2]} intensity={intensity * 0.42} distance={3.4} color={lightColor} />
    </group>
  );
}

function DustParticles({ count = 64, color = "#f8e8d9" }) {
  const ref = useRef(null);

  const positions = useMemo(() => {
    const values = new Float32Array(count * 3);

    for (let index = 0; index < count; index += 1) {
      const seed = index * 1.17;
      values[index * 3] = (pseudoRandom(seed + 0.2) - 0.5) * 7.4;
      values[index * 3 + 1] = pseudoRandom(seed + 0.4) * 3.6 + 0.2;
      values[index * 3 + 2] = (pseudoRandom(seed + 0.6) - 0.5) * 5.2;
    }

    return values;
  }, [count]);

  useFrame((state) => {
    if (!ref.current) {
      return;
    }

    ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.08) * 0.04;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.02} transparent opacity={0.24} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function ModelScene({ url, color }) {
  const { scene } = useGLTF(url);
  const cloned = useMemo(() => scene.clone(true), [scene]);

  useMemo(() => {
    cloned.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [cloned]);

  useMemo(() => {
    if (!color) {
      return;
    }

    cloned.traverse((child) => {
      if (!child.isMesh || !child.material) {
        return;
      }

      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        if (material.color) {
          material.color.set(color);
          material.needsUpdate = true;
        }
      });
    });
  }, [cloned, color]);

  return <primitive object={cloned} />;
}

function RoomDecor({ preset, trimColor, accentWallColor, floorColor, sceneProfile, roomCustomization }) {
  const artImage = roomCustomization?.artImage;
  const artSet = preset === "sunlit-loft"
    ? ["#d9c5a3", "#c6d9d1", "#f1dbc0"]
    : preset === "townhouse-nook"
      ? ["#c7b29b", "#9aa6b9", "#d7c3ad"]
      : ["#d8c49d", "#b7c8d9", "#c1cfb2"];

  return (
    <group>
      <WallFrame position={[-2.35, 1.64, -4.34]} frameColor={trimColor} artColor={artSet[0]} glowColor={sceneProfile.accentGlow} artTextureUrl={artImage} />
      <WallFrame position={[0, 1.78, -4.34]} frameColor={trimColor} artColor={artSet[1]} glowColor="#fff1de" scale={1.1} artTextureUrl={artImage} />
      <WallFrame position={[2.35, 1.6, -4.34]} frameColor={trimColor} artColor={artSet[2]} glowColor={sceneProfile.accentGlow} artTextureUrl={artImage} />
      <Sconce position={[-3.92, 1.84, -4.28]} lightColor={sceneProfile.accentGlow} intensity={sceneProfile.topSpotIntensity * 0.55} />
      <Sconce position={[3.92, 1.84, -4.28]} lightColor={sceneProfile.accentGlow} intensity={sceneProfile.topSpotIntensity * 0.55} />
      {preset !== "sunlit-loft" && <Bench position={[0, -0.98, -3.18]} woodColor={floorColor} accentColor={accentWallColor} />}
      {preset === "gallery-hall" ? (
        <ConsoleTable position={[0, -0.98, 3.05]} woodColor={trimColor} accentColor={accentWallColor} />
      ) : (
        <Planter position={[0, -0.98, 3.16]} potColor={trimColor} leafColor={accentWallColor} />
      )}
      <Planter position={[-4.18, -0.98, -2.84]} potColor={trimColor} leafColor={accentWallColor} />
      <Planter position={[4.18, -0.98, -2.84]} potColor={trimColor} leafColor={accentWallColor} />
      {preset === "townhouse-nook" && <ConsoleTable position={[0, -0.98, -3.66]} woodColor={trimColor} accentColor={accentWallColor} />}
    </group>
  );
}

function InteriorShell({ roomCustomization, sceneProfile }) {
  const wallColor = roomCustomization.wallColor;
  const accentWallColor = roomCustomization.accentWallColor;
  const trimColor = roomCustomization.trimColor;
  const floorColor = roomCustomization.floorColor;
  const ceilingColor = roomCustomization.ceilingColor || "#fbf5ed";
  const windowColor = roomCustomization.windowColor;
  const windowGlow = (roomCustomization.windowGlow ?? 0.92) * sceneProfile.windowMultiplier;

  const wallHeightCenter = 1.31;
  const floorY = -1.03;
  const ceilingY = 3.71;
  const wallZ = ROOM_DIMENSIONS.depth / 2;
  const wallX = ROOM_DIMENSIONS.width / 2;
  const frontColumnWidth = (ROOM_DIMENSIONS.width - ROOM_DIMENSIONS.openingWidth) / 2;

  return (
    <group>
      <RoomSurface args={[ROOM_DIMENSIONS.width, 0.12, ROOM_DIMENSIONS.depth]} position={[0, floorY, 0]} color={floorColor} roughness={0.78} metalness={0.06} />
      <RoomSurface args={[ROOM_DIMENSIONS.width, 0.12, ROOM_DIMENSIONS.depth]} position={[0, ceilingY, 0]} color={ceilingColor} roughness={0.86} metalness={0.02} />
      <RoomSurface args={[ROOM_DIMENSIONS.width, ROOM_DIMENSIONS.height, 0.14]} position={[0, wallHeightCenter, -wallZ]} color={accentWallColor} roughness={0.82} metalness={0.02} />
      <RoomSurface args={[0.14, ROOM_DIMENSIONS.height, ROOM_DIMENSIONS.depth]} position={[-wallX, wallHeightCenter, 0]} color={wallColor} roughness={0.82} metalness={0.02} />
      <RoomSurface args={[0.14, ROOM_DIMENSIONS.height, ROOM_DIMENSIONS.depth]} position={[wallX, wallHeightCenter, 0]} color={wallColor} roughness={0.82} metalness={0.02} />
      <RoomSurface args={[frontColumnWidth, ROOM_DIMENSIONS.height, 0.14]} position={[-(ROOM_DIMENSIONS.openingWidth / 2 + frontColumnWidth / 2), wallHeightCenter, wallZ]} color={accentWallColor} roughness={0.82} metalness={0.02} />
      <RoomSurface args={[frontColumnWidth, ROOM_DIMENSIONS.height, 0.14]} position={[(ROOM_DIMENSIONS.openingWidth / 2 + frontColumnWidth / 2), wallHeightCenter, wallZ]} color={accentWallColor} roughness={0.82} metalness={0.02} />
      <RoomSurface args={[ROOM_DIMENSIONS.openingWidth, 0.58, 0.14]} position={[0, 3.36, wallZ]} color={accentWallColor} roughness={0.82} metalness={0.02} />

      <RoomSurface args={[ROOM_DIMENSIONS.width - 0.2, 0.16, 0.08]} position={[0, -0.94, -wallZ + 0.02]} color={trimColor} roughness={0.58} metalness={0.08} />
      <RoomSurface args={[0.08, 0.16, ROOM_DIMENSIONS.depth - 0.16]} position={[-wallX + 0.02, -0.94, 0]} color={trimColor} roughness={0.58} metalness={0.08} />
      <RoomSurface args={[0.08, 0.16, ROOM_DIMENSIONS.depth - 0.16]} position={[wallX - 0.02, -0.94, 0]} color={trimColor} roughness={0.58} metalness={0.08} />
      <RoomSurface args={[ROOM_DIMENSIONS.width - 0.2, 0.14, 0.08]} position={[0, 3.61, -wallZ + 0.02]} color={trimColor} roughness={0.52} metalness={0.08} />

      <WindowFeature position={[-wallX + 0.12, 1.56, -1.28]} rotation={[0, Math.PI / 2, 0]} tintColor={windowColor} glowStrength={windowGlow} frameColor={trimColor} />
      <WindowFeature position={[wallX - 0.12, 1.56, 1.28]} rotation={[0, -Math.PI / 2, 0]} tintColor={windowColor} glowStrength={windowGlow} frameColor={trimColor} />

      <RoomDecor
        preset={roomCustomization.preset}
        trimColor={trimColor}
        accentWallColor={accentWallColor}
        floorColor={floorColor}
        sceneProfile={sceneProfile}
        roomCustomization={roomCustomization}
      />
    </group>
  );
}

export default function Scene({
  items = [],
  baseModelUrl = "/models/female_anatomy.glb",
  colors = {},
  autoRotate = false,
  focusMode = false,
  canvasRef,
  activeItem,
  initialCatalogItems = [],
  showBaseModel = true,
  enableFocusMode = true,
  scenePreset = "gallery-day",
  roomCustomization = DEFAULT_ROOM_CUSTOMIZATION,
}) {
  const sceneProfile = getSceneProfile(scenePreset);
  const cameraPosition = [0.22, 1.15, 3.65];

  const renderItems = useMemo(() => {
    if (!showBaseModel) return items;
    return [{ id: "base", url: baseModelUrl }, ...items];
  }, [baseModelUrl, items, showBaseModel]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: sceneProfile.cssBackground,
      }}
    >
      <Canvas
        ref={canvasRef}
        gl={{
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: scenePreset === "gallery-evening" ? 0.92 : 1.0,
        }}
        style={{ display: "block", width: "100%", height: "100%", background: "transparent" }}
        camera={{ position: cameraPosition, fov: 45 }}
        shadows
      >
        <color attach="background" args={[scenePreset === "gallery-evening" ? "#0c1015" : "#e9e1d6"]} />

        <CameraController
          focusMode={enableFocusMode ? focusMode : false}
          activeItem={activeItem}
          itemsData={initialCatalogItems}
        />

        <fog attach="fog" args={[sceneProfile.fogColor, 6, 22]} />

        <ambientLight intensity={sceneProfile.ambientIntensity} color={sceneProfile.ambientColor} />
        <directionalLight
          position={sceneProfile.sunPosition}
          intensity={sceneProfile.sunIntensity}
          color={sceneProfile.sunColor}
          castShadow
          shadow-bias={-0.0002}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={0.5}
          shadow-camera-far={20}
          shadow-camera-left={-6}
          shadow-camera-right={6}
          shadow-camera-top={6}
          shadow-camera-bottom={-4}
        />
        <directionalLight position={sceneProfile.fillPosition} intensity={sceneProfile.fillIntensity} color={sceneProfile.fillColor} />
        <spotLight
          position={[0, 4.2, -2.8]}
          intensity={sceneProfile.topSpotIntensity}
          angle={0.52}
          penumbra={1}
          color={sceneProfile.topSpotColor}
          castShadow
          shadow-bias={-0.0001}
        />
        <pointLight position={[-4.1, 2.05, -1.2]} intensity={roomCustomization.windowGlow * 0.34} color={roomCustomization.windowColor} distance={7.4} />
        <pointLight position={[4.1, 2.05, 1.2]} intensity={roomCustomization.windowGlow * 0.34} color={roomCustomization.windowColor} distance={7.4} />

        <Suspense fallback={null}>
          <Environment preset={sceneProfile.env} background={false} environmentIntensity={sceneProfile.envIntensity} />
          <InteriorShell roomCustomization={roomCustomization} sceneProfile={sceneProfile} />
          <ContactShadows
            position={[0, -0.99, 0]}
            opacity={sceneProfile.shadowOpacity}
            scale={6.4}
            blur={2.2}
            far={4.8}
            resolution={256}
            color="#000000"
          />
          <DustParticles count={scenePreset === "gallery-evening" ? 72 : 54} color={sceneProfile.dustColor} />

          <group position={[0, -0.92, 0]}>
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
          maxPolarAngle={Math.PI / 1.82}
          minPolarAngle={Math.PI / 3.5}
          minDistance={1.7}
          maxDistance={5.4}
          autoRotate={autoRotate}
          autoRotateSpeed={0.8}
        />
      </Canvas>

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: sceneProfile.vignette,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 12% 34%, ${roomCustomization.windowColor}22, transparent 28%), radial-gradient(circle at 88% 36%, ${roomCustomization.windowColor}1e, transparent 28%)`,
          pointerEvents: "none",
          zIndex: 1,
          mixBlendMode: scenePreset === "gallery-evening" ? "screen" : "soft-light",
        }}
      />
    </div>
  );
}
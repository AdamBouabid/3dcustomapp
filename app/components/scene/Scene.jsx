"use client";
import React, { Suspense, useMemo, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, OrbitControls, useGLTF, ContactShadows } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
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

function CycloramaWall({ color = "#111116" }) {
  const { geo, mat } = useMemo(() => {
    const r = 3;          // bend radius
    const halfW = 10;     // half the width (X)
    const floorFront = 8; // how far forward the floor extends
    const wallTop = 14;   // total height of the back wall
    const arcSegs = 28;   // smoothness of the curve

    // 2-D profile in [Z, Y] — floor runs from floorFront → 0,
    // then a quarter-circle arc transitions to the vertical wall.
    const profile = [];
    profile.push([floorFront, 0]); // front edge of floor
    profile.push([0, 0]);          // arc start (floor level)

    // Quarter-circle: center at (Z=0, Y=r)
    // angle sweeps from -PI/2 (pointing down) to -PI (pointing left)
    for (let i = 0; i <= arcSegs; i++) {
      const angle = -Math.PI / 2 - (Math.PI / 2) * (i / arcSegs);
      profile.push([r * Math.cos(angle), r + r * Math.sin(angle)]);
    }
    profile.push([-r, wallTop]); // top of wall

    const N = profile.length;

    // Per-arc-segment cumulative lengths for UV mapping
    let totalLen = 0;
    const lens = [0];
    for (let i = 1; i < N; i++) {
      const dz = profile[i][0] - profile[i - 1][0];
      const dy = profile[i][1] - profile[i - 1][1];
      totalLen += Math.sqrt(dz * dz + dy * dy);
      lens.push(totalLen);
    }

    const positions = [], normsArr = [], uvsArr = [], idxArr = [];

    for (let i = 0; i < N; i++) {
      const [pz, py] = profile[i];

      // Tangent (central difference where possible)
      let dz, dy;
      if (i === 0)       { [dz, dy] = [profile[1][0] - profile[0][0],       profile[1][1] - profile[0][1]]; }
      else if (i === N-1){ [dz, dy] = [profile[N-1][0] - profile[N-2][0],   profile[N-1][1] - profile[N-2][1]]; }
      else               { [dz, dy] = [profile[i+1][0] - profile[i-1][0],   profile[i+1][1] - profile[i-1][1]]; }

      const len = Math.sqrt(dz * dz + dy * dy) || 1;
      // CW rotation of tangent (dz,dy) gives inward-facing normal
      const nY =  -dz / len; // floor → +Y, wall → 0
      const nZ =   dy / len; // floor → 0,  wall → +Z (toward viewer)

      const u = lens[i] / totalLen;

      // Two vertices per profile point (left & right)
      positions.push(-halfW, py, pz,  halfW, py, pz);
      normsArr .push(0, nY, nZ,        0, nY, nZ);
      uvsArr   .push(0, u,             1, u);
    }

    // Quads: winding order a,b,c + b,d,c gives normals pointing inward
    for (let i = 0; i < N - 1; i++) {
      const a = i * 2, b = a + 1, c = a + 2, d = a + 3;
      idxArr.push(a, b, c,  b, d, c);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("normal",   new THREE.Float32BufferAttribute(normsArr,  3));
    geometry.setAttribute("uv",       new THREE.Float32BufferAttribute(uvsArr,    2));
    geometry.setIndex(idxArr);

    const material = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 1.0,
      metalness: 0.0,
    });

    return { geo: geometry, mat: material };
  }, [color]);

  return <mesh geometry={geo} material={mat} receiveShadow position={[0, -1, 0]} />;
}

// Circular shadow-catcher disc — renders ONLY the shadow, no fill colour
function ShadowCatcher({ radius = 2.5 }) {
  return (
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.99, 0]}>
      <circleGeometry args={[radius, 64]} />
      <shadowMaterial transparent opacity={0.45} />
    </mesh>
  );
}

// Subtle animated dust-mote particles
function DustParticles({ count = 90 }) {
  const ref = useRef();

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = [];
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 8;
      pos[i * 3 + 1] = Math.random() * 6;
      pos[i * 3 + 2] = -1 + (Math.random() - 0.5) * 4;
      vel.push(
        (Math.random() - 0.5) * 0.003,
        Math.random() * 0.0025 + 0.0005,
        (Math.random() - 0.5) * 0.001
      );
    }
    return { positions: pos, velocities: vel };
  }, [count]);

  useFrame(() => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      pos[i * 3]     += velocities[i * 3];
      pos[i * 3 + 1] += velocities[i * 3 + 1];
      pos[i * 3 + 2] += velocities[i * 3 + 2];
      if (pos[i * 3 + 1] > 6.5)  pos[i * 3 + 1] = 0;
      if (pos[i * 3]     >  4.2)  pos[i * 3]     = -4.2;
      if (pos[i * 3]     < -4.2)  pos[i * 3]     =  4.2;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.014} color="#c4b5ff" transparent opacity={0.45} sizeAttenuation depthWrite={false} />
    </points>
  );
}


function ModelScene({ url, color }) {
  const { scene } = useGLTF(url);
  const cloned = useMemo(() => scene.clone(true), [scene]);

  // Enable shadow casting/receiving on every mesh in the loaded model
  useMemo(() => {
    cloned.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [cloned]);

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
  scenePreset = "night-studio",
}) {
  const cameraPosition = [0, 1, 2.4];
  const isDaylight = scenePreset === "daylight";

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
        // Daylight: CSS sky gradient visible through transparent canvas
        // Night: solid dark colour (canvas opaque background covers it anyway)
        background: isDaylight
          ? "linear-gradient(180deg, #87CEEB 0%, #C5E8F5 55%, #E0F7FA 100%)"
          : "#07070f",
      }}
    >
      <Canvas
        ref={canvasRef}
        gl={{ alpha: true }}
        style={{ display: "block", width: "100%", height: "100%", background: "transparent" }}
        camera={{ position: cameraPosition, fov: 50 }}
        shadows
      >
        {/* Night preset: fill the scene with a solid dark colour */}
        {!isDaylight && <color attach="background" args={["#07070f"]} />}

        <CameraController
          focusMode={enableFocusMode ? focusMode : false}
          activeItem={activeItem}
          itemsData={initialCatalogItems}
        />

        <fog attach="fog" args={isDaylight ? ["#C5E8F5", 8, 22] : ["#07070f", 6, 18]} />

        {isDaylight ? (
          /* ── Daylight Studio lighting ── */
          <>
            {/* Broad ambient simulates bounced sky light */}
            <ambientLight intensity={0.9} />

            {/* 45° sun — warm white, soft shadow map */}
            <directionalLight
              position={[5, 8, 5]}
              intensity={4.2}
              color="#FFF5E0"
              castShadow
              shadow-bias={-0.0008}
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              shadow-camera-near={0.5}
              shadow-camera-far={25}
              shadow-camera-left={-4}
              shadow-camera-right={4}
              shadow-camera-top={7}
              shadow-camera-bottom={-3}
            />
            {/* Sky fill — cool blue from the opposite side */}
            <directionalLight position={[-3, 5, 2]} intensity={1.6} color="#87CEEB" />
            {/* Soft top fill to kill harsh shadow gaps */}
            <pointLight position={[0, 6, 3]} intensity={1.0} color="#FFFDE7" />
          </>
        ) : (
          /* ── Night Studio lighting ── */
          <>
            <ambientLight intensity={0.35} />
            <spotLight
              position={[0, 10, 4]}
              intensity={2.2}
              angle={0.45}
              penumbra={1}
              castShadow
              shadow-bias={-0.0001}
            />
            <directionalLight position={[3, 4, 3]}  intensity={1.2} color="#7c8fff" />
            <directionalLight position={[-3, 4, 3]} intensity={1.2} color="#9b77ff" />
            <directionalLight position={[0, 3, -6]} intensity={2.8} color="#9333ea" />
            <pointLight        position={[0, 2, -4]} intensity={1.4} color="#a855f7" distance={8} />
          </>
        )}

        <Suspense fallback={null}>
          {/* Sunny HDRI for daylight, city HDRI for night */}
          <Environment preset={isDaylight ? "park" : environment} background={false} />

          {/* Cyclorama: off-white for daylight, near-black for night */}
          <CycloramaWall color={isDaylight ? "#f0efe9" : "#111116"} />

          {isDaylight ? (
            /* Circular shadow-catcher keeps ground connection without a big floor mesh */
            <ShadowCatcher />
          ) : (
            <>
              <ContactShadows
                position={[0, -1, 0]}
                opacity={0.45}
                scale={10}
                blur={2.2}
                far={4.5}
                resolution={256}
                color="#000000"
              />
              <DustParticles count={90} />
            </>
          )}

          <group position={[0, -0.9, 0]}>
            {renderItems.map(({ id, url }) => (
              <ModelScene key={id} url={url} color={colors[id]} />
            ))}
          </group>
        </Suspense>

        {/* Bloom — low threshold makes bright white garments glow softly */}
        {isDaylight && (
          <EffectComposer>
            <Bloom
              luminanceThreshold={0.65}
              luminanceSmoothing={0.9}
              intensity={0.35}
              mipmapBlur
            />
          </EffectComposer>
        )}

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

      {/* CSS Vignette — night mode only */}
      {!isDaylight && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at 50% 48%, transparent 32%, rgba(0,0,0,0.55) 72%, rgba(0,0,0,0.85) 100%)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
      )}
    </div>
  );
}

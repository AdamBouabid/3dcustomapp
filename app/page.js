"use client";
import React, { useState, useRef } from 'react';
import * as THREE from 'three';
import OverlayLoader from './components/customizer/OverlayLoader';
import ControlPanel from './components/customizer/ControlPanel';
import Scene from './components/customizer/Scene';

export default function Customizer() {
  const [wardrobe, setWardrobe] = useState({ shirt: null, skirt: null });
  const [yOffset, setYOffset] = useState(0);
  const [scaleOffset, setScaleOffset] = useState(1);

  const orbitRef = useRef();
  const canvasRef = useRef();
  const bodyRef = useRef();

  const equip = (url, type) =>
    setWardrobe((prev) => ({ ...prev, [type]: url }));

  const takeSnapshot = () => {
    const link = document.createElement("a");
    link.download = "atelier-design.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  const customReset = () => {
    if (orbitRef.current) {
      orbitRef.current.reset();
      // Set zoom distance to 0.05
      const direction = new THREE.Vector3().subVectors(orbitRef.current.object.position, orbitRef.current.target).normalize();
      orbitRef.current.object.position.copy(direction).multiplyScalar(0.05).add(orbitRef.current.target);
      orbitRef.current.update();
    }
  };

  return (
    <main className="h-screen w-full bg-[#050505] relative overflow-hidden">
      <OverlayLoader />

      <ControlPanel wardrobe={wardrobe} equip={equip} takeSnapshot={takeSnapshot} yOffset={yOffset} setYOffset={setYOffset} scaleOffset={scaleOffset} setScaleOffset={setScaleOffset} />

      <Scene orbitRef={orbitRef} canvasRef={canvasRef} bodyRef={bodyRef} wardrobe={wardrobe} yOffset={yOffset} scaleOffset={scaleOffset} />

      {/* RESET CAMERA */}
      <button
        onClick={customReset}
        className="absolute bottom-10 right-10 w-16 h-16 bg-white/[0.05] backdrop-blur-3xl border border-white/10 rounded-2xl flex items-center justify-center text-3xl hover:bg-white hover:text-black transition-all"
      >
        👤
      </button>
    </main>
  );
}
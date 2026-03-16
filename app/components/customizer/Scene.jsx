import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage } from '@react-three/drei';
import BaseBody from '../models/BaseBody';
import Garment from '../models/Garment';

function Scene({ orbitRef, canvasRef, bodyRef, wardrobe, yOffset, scaleOffset }) {
  return (
    <Canvas ref={canvasRef} shadows gl={{ preserveDrawingBuffer: true }} camera={{ fov: 45 }}>
      <Suspense fallback={null}>
        <Stage intensity={0.5} environment="city">
          <group ref={bodyRef}>
            <BaseBody url="/female_anatomy.glb" />
          </group>
          {wardrobe.shirt && <Garment url={wardrobe.shirt} bodyRef={bodyRef} manualY={yOffset} manualS={scaleOffset} />}
          {wardrobe.skirt && <Garment url={wardrobe.skirt} bodyRef={bodyRef} manualY={yOffset} manualS={scaleOffset} />}
        </Stage>
      </Suspense>
      <OrbitControls ref={orbitRef} makeDefault enableDamping minPolarAngle={0} maxPolarAngle={Math.PI / 1.75} />
    </Canvas>
  );
}

export default Scene;
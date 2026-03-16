import { useProgress } from '@react-three/drei';

function OverlayLoader() {
  const { progress, active } = useProgress();
  if (!active) return null;
  return (
    <div className="absolute inset-0 z-[100] bg-[#050505] flex flex-col items-center justify-center">
      <div className="w-48 bg-white/10 h-[2px] rounded-full overflow-hidden">
        <div className="bg-white h-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
      <p className="text-white/30 text-[10px] uppercase tracking-[0.3em] mt-8 font-medium">
        Loading Atelier {Math.round(progress)}%
      </p>
    </div>
  );
}

export default OverlayLoader;
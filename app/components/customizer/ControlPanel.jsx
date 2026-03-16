"use client";
import React from 'react';

export default function ControlPanel({ 
  equip, 
  takeSnapshot, 
  yOffset, 
  setYOffset, 
  scaleOffset, 
  setScaleOffset 
}) {
  return (
    <div className="absolute top-10 right-10 z-20 flex flex-col gap-6 w-80">
      <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
        
        {/* HEADER */}
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-white text-[10px] font-black uppercase tracking-[0.25em] opacity-30">
            Selection
          </h2>
          <button 
            onClick={takeSnapshot} 
            className="text-white/40 hover:text-white transition-colors text-[10px] uppercase font-bold"
          >
            Save Design
          </button>
        </header>
        
        {/* WARDROBE SELECTION */}
        <div className="space-y-3 mb-8">
          <button 
            onClick={() => equip('/shirt.glb', 'shirt')}
            className="w-full py-4 px-6 bg-white/[0.03] hover:bg-white text-white hover:text-black rounded-2xl border border-white/5 transition-all text-[10px] font-bold uppercase tracking-widest"
          >
            Equip Shirt
          </button>

          <button 
            onClick={() => equip('/skirt_denim.glb', 'skirt')}
            className="w-full py-4 px-6 bg-white/[0.03] hover:bg-white text-white hover:text-black rounded-2xl border border-white/5 transition-all text-[10px] font-bold uppercase tracking-widest"
          >
            Denim Skirt
          </button>

          <button 
            onClick={() => equip('/skirt_knit.glb', 'skirt')}
            className="w-full py-4 px-6 bg-white/[0.03] hover:bg-white text-white hover:text-black rounded-2xl border border-white/5 transition-all text-[10px] font-bold uppercase tracking-widest"
          >
            Knit Skirt
          </button>
        </div>

        {/* FINE TUNING CONTROLS */}
        <div className="space-y-6 pt-6 border-t border-white/10">
          
          {/* VERTICAL POSITION */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <p className="text-[9px] text-white/30 uppercase tracking-widest">Vertical Alignment</p>
              <span className="text-[9px] text-white/50 font-mono">{yOffset.toFixed(3)}</span>
            </div>
            <input 
              type="range" 
              min="-0.2" 
              max="0.2" 
              step="0.005" 
              value={yOffset} 
              onChange={e => setYOffset(parseFloat(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
            />
            <div className="flex justify-between mt-2 px-1 text-[7px] text-white/20 uppercase font-bold">
              <span>Down</span>
              <span>Up</span>
            </div>
          </div>

          {/* WIDTH SCALE */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <p className="text-[9px] text-white/30 uppercase tracking-widest">Width / Fit</p>
              <span className="text-[9px] text-white/50 font-mono">{scaleOffset.toFixed(2)}x</span>
            </div>
            <input 
              type="range" 
              min="0.5" 
              max="1.5" 
              step="0.01" 
              value={scaleOffset} 
              onChange={e => setScaleOffset(parseFloat(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
            />
            <div className="flex justify-between mt-2 px-1 text-[7px] text-white/20 uppercase font-bold">
              <span>Slim</span>
              <span>Oversized</span>
            </div>
          </div>

          {/* RESET */}
          <button 
            onClick={() => { setYOffset(0); setScaleOffset(1); }}
            className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/5 transition-all text-[10px] font-bold uppercase tracking-widest mt-4"
          >
            Reset
          </button>

        </div>
      </div>
    </div>
  );
}
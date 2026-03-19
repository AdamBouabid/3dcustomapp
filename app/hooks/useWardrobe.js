"use client";
import { useState, useRef, useCallback } from "react";

export function useWardrobe() {
  const [wardrobe, setWardrobe] = useState({});
  const [activeItem, setActiveItem] = useState(null);
  const [colors, setColors] = useState({
    shirt: "#a5b4fc",
    skirt: "#f9a8d4",
    dress: "#fcd34d",
    heels: "#5eead4",
  });
  const orbitRef = useRef();

  const equip = useCallback((id, url) => {
    setWardrobe((prev) => ({ ...prev, [id]: url }));
  }, []);

  const unequip = useCallback((id) => {
    setWardrobe((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const setColor = useCallback((id, hex) => {
    setColors((prev) => ({ ...prev, [id]: hex }));
  }, []);

  return {
    wardrobe,
    setWardrobe,
    activeItem,
    setActiveItem,
    colors,
    setColors,
    setColor,
    orbitRef,
    equip,
    unequip,
  };
}

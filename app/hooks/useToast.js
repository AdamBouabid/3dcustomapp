import { useState, useEffect } from "react";

const TOAST_DURATION_MS = 2200;

export function useToast() {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setToast(null);
    }, TOAST_DURATION_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [toast]);

  const showToast = (message, tone = "neutral") => {
    setToast({ message, tone });
  };

  const hideToast = () => {
    setToast(null);
  };

  return { toast, showToast, hideToast };
}

export function toColorFamily(hex) {
  if (typeof hex !== "string" || !/^#[0-9a-f]{6}$/i.test(hex)) {
    return "neutral";
  }

  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const l = (max + min) / 510;

  if (delta < 18 || l < 0.12 || l > 0.88) {
    return "neutral";
  }

  let h = 0;
  if (max === r) {
    h = ((g - b) / delta) % 6;
  } else if (max === g) {
    h = (b - r) / delta + 2;
  } else {
    h = (r - g) / delta + 4;
  }

  h *= 60;
  if (h < 0) {
    h += 360;
  }

  if ((h >= 0 && h <= 55) || (h >= 300 && h <= 360)) {
    return "warm";
  }
  if (h >= 150 && h <= 285) {
    return "cool";
  }
  return "neutral";
}

function normalizeHex(hex) {
  if (typeof hex !== "string") {
    return "#7c88ff";
  }

  const value = hex.trim();
  if (/^#[0-9a-f]{6}$/i.test(value)) {
    return value;
  }

  if (/^[0-9a-f]{6}$/i.test(value)) {
    return `#${value}`;
  }

  return "#7c88ff";
}

function mixHex(baseHex, mixHexValue, amount) {
  const base = normalizeHex(baseHex);
  const mix = normalizeHex(mixHexValue);
  const baseInt = parseInt(base.slice(1), 16);
  const mixInt = parseInt(mix.slice(1), 16);

  const br = (baseInt >> 16) & 255;
  const bg = (baseInt >> 8) & 255;
  const bb = baseInt & 255;

  const mr = (mixInt >> 16) & 255;
  const mg = (mixInt >> 8) & 255;
  const mb = mixInt & 255;

  const blend = (componentBase, componentMix) => {
    return Math.round(componentBase + (componentMix - componentBase) * amount);
  };

  const r = blend(br, mr).toString(16).padStart(2, "0");
  const g = blend(bg, mg).toString(16).padStart(2, "0");
  const b = blend(bb, mb).toString(16).padStart(2, "0");

  return `#${r}${g}${b}`;
}

function lightenHex(hex, amount) {
  return mixHex(hex, "#ffffff", amount);
}

function darkenHex(hex, amount) {
  return mixHex(hex, "#000000", amount);
}

export function buildCardPalette(accent) {
  const base = normalizeHex(accent);
  return [
    lightenHex(base, 0.45),
    lightenHex(base, 0.2),
    base,
    darkenHex(base, 0.15),
  ];
}

function invertHex(hex) {
  const base = normalizeHex(hex);
  const value = parseInt(base.slice(1), 16);
  const r = 255 - ((value >> 16) & 255);
  const g = 255 - ((value >> 8) & 255);
  const b = 255 - (value & 255);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export function buildPreviewGradient(accent) {
  const base = normalizeHex(accent);
  const light = lightenHex(base, 0.5);
  const dark = darkenHex(base, 0.35);
  return `radial-gradient(circle at 20% 20%, ${light}55, transparent 55%), linear-gradient(135deg, ${light} 0%, ${dark} 100%)`;
}

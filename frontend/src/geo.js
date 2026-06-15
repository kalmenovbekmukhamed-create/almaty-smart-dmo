import L from "leaflet";

/** Visual center for label placement (~centroid surrogate). */
export function getFeatureCenter(feature) {
  if (!feature?.geometry) return null;
  const layer = L.geoJSON(feature);
  const b = layer.getBounds();
  if (!b.isValid()) return null;
  return b.getCenter();
}

/** Deterministic pseudo-random offset in degrees for ambient dots (hash from string). */
export function hashString(s) {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return h;
}

export function ambientOffsets(seed, count, scale = 0.012) {
  const offsets = [];
  let x = seed;
  for (let i = 0; i < count; i += 1) {
    x = Math.imul(x, 48271) ^ 65536;
    const u1 = (((x >>> 0) % 10000) / 10000) * 2 - 1;
    x ^= 0xdeadbeef + i * 997;
    const u2 = (((x >>> 0) % 10000) / 10000) * 2 - 1;
    offsets.push([u1 * scale, u2 * scale * 0.85]);
  }
  return offsets;
}

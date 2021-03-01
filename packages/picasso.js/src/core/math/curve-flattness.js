/**
 * Measure the flatnass of a cubic bezier curve
 * @ignore
 * @param {Point} s - Start point
 * @param {Point} cp1 - First control point
 * @param {Point} cp2 - Second control point
 * @param {Point} e - End point
 */
export default function flatness(s, cp1, cp2, e) {
  const ux = Math.abs(s.x + cp2.x - (cp1.x + cp1.x));
  const uy = Math.abs(s.y + cp2.y - (cp1.y + cp1.y));
  const vx = Math.abs(cp1.x + e.x - (cp2.x + cp2.x));
  const vy = Math.abs(cp1.y + e.y - (cp2.y + cp2.y));

  return ux + uy + vx + vy;
}

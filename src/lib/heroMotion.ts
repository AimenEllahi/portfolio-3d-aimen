/** Scroll distance used by both the name stencil and the 3D camera. */
export function heroPinDistanceVhForWidth(width: number): number {
  if (width < 480) return 65;
  if (width < 768) return 70;
  return 75;
}

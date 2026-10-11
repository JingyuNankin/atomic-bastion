/** 1 世界单位对应的 CSS 像素。窗口变大变小都不改这个比例。 */
export const PX_PER_UNIT = 16;

export function px(units: number): number {
  return units * PX_PER_UNIT;
}

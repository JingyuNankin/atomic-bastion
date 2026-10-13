const STAR =
  '60,38 64.7,52.2 79.6,52.2 67.4,61 72.1,75.2 60,66.4 47.9,75.2 52.6,61 40.4,52.2 55.3,52.2';

export function sealMarkup(
  className = 'seal',
  options?: { id?: string; legend?: string; inked?: boolean },
): string {
  const arcId = options?.id ?? 'seal-arc';
  const legend = options?.legend ?? 'ОТР-3 · 绝密 · 铁脉 · BUNKER-72 ·';
  const wash = options?.inked
    ? '<circle cx="60" cy="60" r="51" fill="currentColor" fill-opacity="0.22"/>'
    : '';

  return `
    <svg class="${className}" viewBox="0 0 120 120" aria-hidden="true">
      ${wash}
      <circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" stroke-width="3.2"/>
      <circle cx="60" cy="60" r="48" fill="none" stroke="currentColor" stroke-width="1.15"/>
      <circle cx="60" cy="60" r="33" fill="none" stroke="currentColor" stroke-width="1.15"/>
      <defs>
        <path id="${arcId}" d="M60 17.5 a42.5 42.5 0 1 1 0 85 a42.5 42.5 0 1 1 0 -85"/>
      </defs>
      <text fill="currentColor" font-size="8.5" letter-spacing="1.4">
        <textPath href="#${arcId}">${legend}</textPath>
      </text>
      <polygon points="${STAR}" fill="currentColor"/>
    </svg>
  `;
}

export function starMarkup(className = 'star'): string {
  return `
    <svg class="${className}" viewBox="40 36 40 42" aria-hidden="true">
      <polygon points="${STAR}" fill="currentColor"/>
    </svg>
  `;
}

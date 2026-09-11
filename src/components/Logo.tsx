interface LogoProps {
  size?: number;
  title?: string;
}

/**
 * "Setu" means bridge. The mark is a bridge span carrying a study path from
 * one bank to the other — drawn inline so it renders offline and inherits the
 * surrounding colour.
 */
export function Logo({ size = 36, title }: LogoProps) {
  return (
    <svg
      className="logo-mark"
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <rect width="48" height="48" rx="12" fill="var(--logo-bg, #16255c)" />
      <path
        d="M8 31c5.5-11 10.8-16.5 16-16.5S34.5 20 40 31"
        fill="none"
        stroke="var(--logo-arc, #37c2b8)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path d="M8 31h32" fill="none" stroke="var(--logo-deck, #f6f8fc)" strokeWidth="3.2" strokeLinecap="round" />
      <path
        d="M16 31v-5.2M24 31v-8.4M32 31v-5.2"
        fill="none"
        stroke="var(--logo-arc, #37c2b8)"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.85"
      />
      <circle cx="24" cy="14" r="3.4" fill="var(--logo-star, #f5a623)" />
    </svg>
  );
}

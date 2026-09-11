import type { ReactNode } from 'react';

/* ------------------------------------------------------------------ */
/* Progress bar                                                        */
/* ------------------------------------------------------------------ */

interface ProgressBarProps {
  value: number;
  label: string;
  /** Shown to the right of the bar, e.g. "60%". */
  valueText?: string;
  tone?: 'primary' | 'accent' | 'positive';
}

export function ProgressBar({ value, label, valueText, tone = 'primary' }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="progress">
      <div className="progress__labels">
        <span className="progress__label">{label}</span>
        <span className="progress__value">{valueText ?? `${clamped}%`}</span>
      </div>
      <div
        className={`progress__track progress__track--${tone}`}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div className="progress__fill" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Readiness ring                                                      */
/* ------------------------------------------------------------------ */

interface ReadinessRingProps {
  score: number;
  label: string;
  caption?: string;
}

/**
 * The ring animates its stroke, but the animation is defined in CSS and
 * disabled entirely under `prefers-reduced-motion`. The number in the middle
 * is always present, so the meaning never depends on the animation running.
 */
export function ReadinessRing({ score, label, caption }: ReadinessRingProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="ring">
      <svg className="ring__svg" viewBox="0 0 120 120" role="img" aria-label={`${label}: ${clamped}%`}>
        <circle className="ring__track" cx="60" cy="60" r={radius} strokeWidth="12" fill="none" />
        <circle
          className="ring__value"
          cx="60"
          cy="60"
          r={radius}
          strokeWidth="12"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="ring__center">
        <span className="ring__number">{clamped}%</span>
        <span className="ring__label">{label}</span>
      </div>
      {caption ? <p className="ring__caption">{caption}</p> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Badges and pills                                                    */
/* ------------------------------------------------------------------ */

export type BadgeTone = 'neutral' | 'positive' | 'warning' | 'critical' | 'info';

interface BadgeProps {
  tone?: BadgeTone;
  icon?: ReactNode;
  children: ReactNode;
}

/**
 * Every badge pairs its colour with an icon and a word, so status is never
 * communicated by colour alone.
 */
export function Badge({ tone = 'neutral', icon, children }: BadgeProps) {
  return (
    <span className={`badge badge--${tone}`}>
      {icon ? (
        <span className="badge__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Empty state                                                         */
/* ------------------------------------------------------------------ */

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, body, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <span className="empty-state__icon" aria-hidden="true">
        {icon}
      </span>
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__body">{body}</p>
      {action ? <div className="empty-state__action">{action}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Stat tile                                                           */
/* ------------------------------------------------------------------ */

interface StatTileProps {
  icon: ReactNode;
  label: string;
  value: string;
  hint?: string;
  /** `text` sets a name or sentence at reading size rather than metric size. */
  variant?: 'metric' | 'text';
}

export function StatTile({ icon, label, value, hint, variant = 'metric' }: StatTileProps) {
  return (
    <div className={`stat-tile stat-tile--${variant}`}>
      <span className="stat-tile__icon" aria-hidden="true">
        {icon}
      </span>
      <div className="stat-tile__content">
        <span className="stat-tile__label">{label}</span>
        <span className="stat-tile__value">{value}</span>
        {hint ? <span className="stat-tile__hint">{hint}</span> : null}
      </div>
    </div>
  );
}

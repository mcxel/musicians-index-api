import type { ReactNode } from 'react';

export function HomepageSection({
  id,
  title,
  subtitle,
  children,
}: Readonly<{ id?: string; title: string; subtitle?: string; children: ReactNode }>) {
  return (
    <section
      id={id}
      style={{
        borderRadius: 14,
        border: '1px solid rgba(255,255,255,0.14)',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
        padding: 16,
        scrollMarginTop: 96,
        scrollSnapAlign: 'start',
      }}
    >
      <div style={{ marginBottom: 10 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>{title}</h2>
        {subtitle ? <p style={{ margin: '6px 0 0', color: 'rgba(238,241,255,0.78)' }}>{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function HomeBelt({
  id,
  title,
  subtitle,
  children,
}: Readonly<{ id?: string; title: string; subtitle?: string; children: ReactNode }>) {
  return (
    <section
      id={id}
      style={{
        borderRadius: 16,
        border: '1px solid rgba(90,238,255,0.42)',
        background:
          'linear-gradient(110deg, rgba(10,29,38,0.9) 0%, rgba(46,13,71,0.88) 48%, rgba(11,36,56,0.9) 100%)',
        boxShadow: '0 0 0 1px rgba(255,64,184,0.16) inset, 0 20px 48px rgba(0,0,0,0.38)',
        padding: 14,
        scrollMarginTop: 96,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'end',
          gap: 10,
          marginBottom: 10,
          borderBottom: '1px solid rgba(104,229,255,0.25)',
          paddingBottom: 8,
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 30, lineHeight: 1, letterSpacing: '0.03em', color: '#ffd34a' }}>{title}</h2>
          {subtitle ? <p style={{ margin: '5px 0 0', color: 'rgba(227,249,255,0.86)', fontSize: 13 }}>{subtitle}</p> : null}
        </div>
        <div
          style={{
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.13em',
            color: '#57f1ff',
            border: '1px solid rgba(87,241,255,0.34)',
            borderRadius: 999,
            padding: '4px 10px',
          }}
        >
          Belt View
        </div>
      </div>
      {children}
    </section>
  );
}

export function BeltGrid({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
        gridAutoFlow: 'row dense',
        gap: 10,
      }}
    >
      {children}
    </div>
  );
}

export function BeltCard({
  span,
  title,
  children,
}: Readonly<{ span: number; title?: string; children: ReactNode }>) {
  const clampedSpan = Math.min(12, Math.max(3, span));
  return (
    <article
      style={{
        gridColumn: `span ${clampedSpan} / span ${clampedSpan}`,
        minWidth: 0,
        borderRadius: 12,
        border: '1px solid rgba(255,108,203,0.34)',
        background:
          'linear-gradient(160deg, rgba(5,24,38,0.82) 0%, rgba(19,8,47,0.85) 42%, rgba(8,43,56,0.82) 100%)',
        padding: 10,
        boxShadow: '0 0 0 1px rgba(75,244,255,0.2) inset',
      }}
    >
      {title ? (
        <div
          style={{
            marginBottom: 8,
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.11em',
            color: '#ffbe38',
            fontWeight: 800,
          }}
        >
          {title}
        </div>
      ) : null}
      {children}
    </article>
  );
}

export function LinkRail({
  links,
}: Readonly<{ links: ReadonlyArray<{ href: string; label: string; caption?: string }> }>) {
  return (
    <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          style={{
            textDecoration: 'none',
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.16)',
            padding: '12px 14px',
            color: '#f6f8ff',
            background: 'rgba(255,255,255,0.03)',
          }}
        >
          <div style={{ fontWeight: 700 }}>{link.label}</div>
          {link.caption ? <div style={{ marginTop: 4, opacity: 0.8, fontSize: 12 }}>{link.caption}</div> : null}
        </a>
      ))}
    </div>
  );
}

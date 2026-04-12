"use client";

interface HomepageSectionJumpNavProps {
  sections: ReadonlyArray<{ id: string; label: string }>;
}

export default function HomepageSectionJumpNav({ sections }: Readonly<HomepageSectionJumpNavProps>) {
  function jumpToSection(id: string) {
    if (typeof window === 'undefined') return;
    const node = document.getElementById(id);
    if (!node) return;
    node.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <aside
      aria-label="Jump to Page 1 section"
      style={{
        position: 'sticky',
        top: 76,
        zIndex: 20,
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: 10,
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 6,
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
          borderRadius: 999,
          border: '1px solid rgba(255,255,255,0.2)',
          background: 'rgba(6,10,24,0.74)',
          padding: '6px 8px',
          backdropFilter: 'blur(8px)',
        }}
      >
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => jumpToSection(section.id)}
            style={{
              borderRadius: 999,
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.05)',
              color: '#f3f6ff',
              fontSize: 10,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding: '4px 10px',
              cursor: 'pointer',
            }}
          >
            {section.label}
          </button>
        ))}
      </div>
    </aside>
  );
}

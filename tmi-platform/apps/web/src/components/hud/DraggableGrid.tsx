'use client'

import React from 'react'
import type { HudModule } from '@tmi/hud-core'

type Props = {
  modules: HudModule[]
  onSelect?: (id: string) => void
  selectedId?: string | null
}

export function DraggableGrid({ modules, onSelect, selectedId }: Props) {
  const [order, setOrder] = React.useState<string[]>(() => modules.map(m => m.id))

  // keep order in sync when module list changes (new/removed modules)
  React.useEffect(() => {
    setOrder(prev => {
      const nextIds = modules.map(m => m.id)
      const kept = prev.filter(id => nextIds.includes(id))
      const added = nextIds.filter(id => !kept.includes(id))
      return [...kept, ...added]
    })
  }, [modules])

  const byId = React.useMemo(() => {
    const map = new Map<string, HudModule>()
    for (const m of modules) map.set(m.id, m)
    return map
  }, [modules])

  const [dragId, setDragId] = React.useState<string | null>(null)

  function move(fromId: string, toId: string) {
    if (fromId === toId) return
    setOrder(prev => {
      const a = prev.slice()
      const from = a.indexOf(fromId)
      const to = a.indexOf(toId)
      if (from < 0 || to < 0) return prev
      a.splice(from, 1)
      a.splice(to, 0, fromId)
      return a
    })
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {order.map((id) => {
        const mod = byId.get(id)
        if (!mod) return null
        const active = selectedId === id

        return (
          <div
            key={id}
            draggable
            onDragStart={() => setDragId(id)}
            onDragEnd={() => setDragId(null)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragId) move(dragId, id)
            }}
            className={[
              'rounded-2xl border bg-black/20 p-4 shadow-sm',
              'cursor-move select-none',
              active ? 'border-lime-400/70' : 'border-white/10',
            ].join(' ')}
            onClick={() => onSelect?.(id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelect?.(id)
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={mod.title ? `Select ${mod.title}` : `Select ${id}`}
            aria-pressed={active}
            title="Drag to reorder"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-semibold text-white/90">{mod.title}</div>
              <div className="text-xs text-white/50">{mod.version ?? ''}</div>
            </div>

            {mod.description ? (
              <div className="mt-1 text-xs text-white/60">{mod.description}</div>
            ) : null}

            <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-3">
              {mod.render({})}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default DraggableGrid

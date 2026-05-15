"use client";

import { useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Home1MagazineCoverComposition from '@/components/home/Home1MagazineCoverComposition';
import ChartBelt from '@/components/home/belts/ChartBelt';
import CypherBelt from '@/components/home/belts/CypherBelt';
import CrownBelt from '@/components/home/belts/CrownBelt';
import HeroBelt from '@/components/home/belts/HeroBelt';
import InterviewBelt from '@/components/home/belts/InterviewBelt';
import LiveShowsBelt from '@/components/home/belts/LiveShowsBelt';
import NewsBelt from '@/components/home/belts/NewsBelt';
import ReleasesBelt from '@/components/home/belts/ReleasesBelt';
import SponsorBelt from '@/components/home/belts/SponsorBelt';
import StoreBelt from '@/components/home/belts/StoreBelt';
import HomepageBelt from './HomepageBelt';
import type { HomeBeltComponentMap, HomeBeltDefinition, HomeSurfaceId } from './types';
import { clearSlotLayout, loadSlotLayout, saveSlotLayout } from '@/lib/homepage/engines/slotPersistence.engine';

const BELT_COMPONENTS: HomeBeltComponentMap = {
  MAGAZINE_COVER_BELT: Home1MagazineCoverComposition,
  HERO_BELT: HeroBelt,
  CROWN_BELT: CrownBelt,
  NEWS_BELT: NewsBelt,
  INTERVIEW_BELT: InterviewBelt,
  CHART_BELT: ChartBelt,
  SPONSOR_BELT: SponsorBelt,
  RELEASES_BELT: ReleasesBelt,
  LIVE_SHOWS_BELT: LiveShowsBelt,
  STORE_BELT: StoreBelt,
  CYPHER_BELT: CypherBelt,
};

function orderBelts(belts: HomeBeltDefinition[], layoutOrder: string[]): HomeBeltDefinition[] {
  const indexMap = new Map(layoutOrder.map((id, idx) => [id, idx]));
  return [...belts].sort((a, b) => {
    const aIdx = indexMap.get(a.id) ?? Number.MAX_SAFE_INTEGER;
    const bIdx = indexMap.get(b.id) ?? Number.MAX_SAFE_INTEGER;
    return aIdx - bIdx;
  });
}

function SortableBelt({ belt, editable }: Readonly<{ belt: HomeBeltDefinition; editable: boolean }>) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: belt.id });
  const BeltComponent = BELT_COMPONENTS[belt.componentKey];

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.45 : 1,
        position: 'relative',
      }}
    >
      {editable ? (
        <button
          type="button"
          title={`Drag ${belt.id}`}
          aria-label={`Drag ${belt.id}`}
          {...attributes}
          {...listeners}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 3,
            borderRadius: 7,
            border: '1px solid rgba(100,230,255,0.55)',
            background: 'rgba(2,22,35,0.8)',
            color: '#7dd3fc',
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '4px 8px',
            cursor: 'grab',
          }}
        >
          Drag
        </button>
      ) : null}
      <HomepageBelt
        title={belt.title}
        subtitle={belt.subtitle}
        badge={belt.badge}
        accent={belt.accent}
        chrome={belt.chrome}
      >
        {BeltComponent ? <BeltComponent /> : <div style={{ color: 'rgba(255,255,255,0.64)' }}>{belt.id} unavailable</div>}
      </HomepageBelt>
    </div>
  );
}

export default function HomeDraggableBelts({
  surfaceId,
  belts,
  layoutOrder,
}: Readonly<{ surfaceId: HomeSurfaceId; belts: HomeBeltDefinition[]; layoutOrder: string[] }>) {
  const [editable, setEditable] = useState(false);
  const [localOrder, setLocalOrder] = useState<string[]>(layoutOrder);

  useEffect(() => {
    const saved = loadSlotLayout(surfaceId);
    if (saved && saved.length > 0) {
      setLocalOrder(saved);
      return;
    }
    setLocalOrder(layoutOrder);
  }, [layoutOrder, surfaceId]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const orderedBelts = useMemo(() => orderBelts(belts, localOrder), [belts, localOrder]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setLocalOrder((prev) => {
      const oldIdx = prev.indexOf(String(active.id));
      const newIdx = prev.indexOf(String(over.id));
      if (oldIdx < 0 || newIdx < 0) return prev;
      const next = arrayMove(prev, oldIdx, newIdx);
      saveSlotLayout(surfaceId, next);
      return next;
    });
  }

  function resetOrder() {
    setLocalOrder(layoutOrder);
    clearSlotLayout(surfaceId);
  }

  return (
    <section style={{ display: 'grid', gap: surfaceId === 1 ? 0 : 12 }}>
      {surfaceId !== 1 ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 10,
            alignItems: 'center',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 10,
            padding: '8px 10px',
            background: 'rgba(8,12,22,0.55)',
          }}
        >
          <div style={{ fontSize: 11, color: '#bfdbfe', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 800 }}>
            Surface {surfaceId} canvas {editable ? 'edit mode' : 'preview mode'}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => setEditable((value) => !value)}
              style={{
                border: '1px solid rgba(56,189,248,0.45)',
                background: editable ? 'rgba(56,189,248,0.18)' : 'rgba(2,6,23,0.78)',
                color: editable ? '#7dd3fc' : '#cbd5e1',
                borderRadius: 999,
                padding: '6px 10px',
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.09em',
              }}
            >
              {editable ? 'Finish' : 'Customize'}
            </button>
            {editable ? (
              <button
                type="button"
                onClick={resetOrder}
                style={{
                  border: '1px solid rgba(250,204,21,0.4)',
                  background: 'rgba(120,53,15,0.42)',
                  color: '#fde68a',
                  borderRadius: 999,
                  padding: '6px 10px',
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.09em',
                }}
              >
                Reset
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={orderedBelts.map((belt) => belt.id)} strategy={verticalListSortingStrategy}>
          <div
            style={
              surfaceId === 1
                ? {
                    display: 'grid',
                    gap: 18,
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  }
                : { display: 'grid', gap: 18 }
            }
          >
            {orderedBelts.map((belt) => {
              const fullWidth =
                surfaceId === 1 &&
                (belt.id === 'magazine-cover-belt' || belt.id === 'sponsor-belt-home-1');

              return (
                <div key={belt.id} style={fullWidth ? { gridColumn: '1 / -1' } : undefined}>
                  <SortableBelt belt={belt} editable={editable} />
                </div>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </section>
  );
}
'use client';

import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useGlobalMediaStore } from '@/stores/globalMediaStore';
import type { MediaItem } from '@/lib/media/media';

function SortableItem({ item }: { item: MediaItem }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        display: 'flex',
        alignItems: 'center',
        padding: '8px',
        background: 'rgba(255,255,255,0.05)',
        marginBottom: '4px',
        borderRadius: '4px',
        cursor: 'grab',
        touchAction: 'none',
      }}
      {...attributes}
      {...listeners}
    >
      {item.thumbnailUrl ? (
        <img
          src={item.thumbnailUrl}
          alt={item.title}
          width={32}
          height={32}
          style={{ borderRadius: '2px', marginRight: '12px', flexShrink: 0 }}
        />
      ) : (
        <div style={{ width: 32, height: 32, marginRight: '12px', flexShrink: 0, background: 'rgba(0,255,255,0.1)', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '14px' }}>♪</span>
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</p>
        {'artist' in item && item.artist && (
          <p style={{ margin: 0, fontSize: '11px', color: '#999' }}>{String(item.artist)}</p>
        )}
      </div>
    </div>
  );
}

export function MediaQueue() {
  const queue = useGlobalMediaStore((s) => s.queue);
  const setQueue = useGlobalMediaStore((s) => s.setQueue);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = queue.findIndex((item) => item.id === active.id);
      const newIndex = queue.findIndex((item) => item.id === over.id);
      setQueue(arrayMove(queue, oldIndex, newIndex));
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        right: 0,
        bottom: '80px',
        top: 0,
        width: '300px',
        background: 'rgba(10, 6, 20, 0.92)',
        backdropFilter: 'blur(15px)',
        color: 'white',
        padding: '16px',
        zIndex: 999,
        borderLeft: '1px solid rgba(0,255,255,0.12)',
        overflowY: 'auto',
        fontFamily: 'sans-serif',
      }}
    >
      <h4 style={{ marginTop: 0, marginBottom: '16px', fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
        Up Next
        <span style={{ marginLeft: '8px', fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>({queue.length})</span>
      </h4>
      {queue.length > 0 ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={queue.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            {queue.map((item) => (
              <SortableItem key={item.id} item={item} />
            ))}
          </SortableContext>
        </DndContext>
      ) : (
        <p style={{ color: '#888', fontSize: '13px', textAlign: 'center', marginTop: '40px' }}>
          No songs queued yet.
        </p>
      )}
    </div>
  );
}

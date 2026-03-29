'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  deleteAnnotation,
  getAnnotations,
  saveAnnotation,
  updateAnnotation,
  type Annotation,
} from '@/lib/annotations';

interface AnnotationMarkerProps {
  annotation: Annotation;
  /** 0–1 position along the chart width */
  xFraction: number;
  onEdit: (annotation: Annotation) => void;
  onDelete: (id: string) => void;
}

function AnnotationMarker({ annotation, xFraction, onEdit, onDelete }: AnnotationMarkerProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        position: 'absolute',
        left: `${xFraction * 100}%`,
        top: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      {/* Vertical line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          width: 2,
          background: '#6366f1',
          opacity: 0.7,
        }}
      />

      {/* Dot + tooltip trigger */}
      <div
        style={{
          position: 'absolute',
          top: 8,
          left: -7,
          width: 14,
          height: 14,
          borderRadius: '50%',
          background: '#6366f1',
          border: '2px solid #ffffff',
          boxShadow: '0 2px 6px rgba(99,102,241,0.4)',
          cursor: 'pointer',
          pointerEvents: 'all',
          zIndex: 11,
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {hovered && (
          <div
            style={{
              position: 'absolute',
              top: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#1e293b',
              color: '#f8fafc',
              borderRadius: 10,
              padding: '8px 12px',
              fontSize: 12,
              whiteSpace: 'nowrap',
              boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
              zIndex: 20,
              minWidth: 160,
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{annotation.date}</div>
            <div style={{ color: '#cbd5e1', marginBottom: 8 }}>{annotation.text}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={() => onEdit(annotation)}
                style={{
                  background: '#6366f1',
                  border: 'none',
                  borderRadius: 6,
                  color: '#fff',
                  padding: '3px 8px',
                  fontSize: 11,
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => onDelete(annotation.id)}
                style={{
                  background: '#ef4444',
                  border: 'none',
                  borderRadius: 6,
                  color: '#fff',
                  padding: '3px 8px',
                  fontSize: 11,
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface AnnotationModalProps {
  initial?: Annotation;
  defaultDate?: string;
  onSave: (text: string, date: string) => void;
  onClose: () => void;
}

function AnnotationModal({ initial, defaultDate = '', onSave, onClose }: AnnotationModalProps) {
  const [text, setText] = useState(initial?.text ?? '');
  const [date, setDate] = useState(initial?.date ?? defaultDate);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15,23,42,0.5)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 70,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 20,
          padding: '24px',
          width: 'min(400px, 100%)',
          boxShadow: '0 24px 60px rgba(15,23,42,0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ margin: '0 0 18px', fontSize: 20 }}>
          {initial ? 'Edit annotation' : 'Add annotation'}
        </h2>

        <label style={{ display: 'grid', gap: 6, marginBottom: 14 }}>
          <span style={{ fontSize: 13, fontWeight: 700 }}>Date</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ borderRadius: 10, border: '1px solid #cbd5e1', padding: '10px 12px', fontSize: 14 }}
          />
        </label>

        <label style={{ display: 'grid', gap: 6, marginBottom: 20 }}>
          <span style={{ fontSize: 13, fontWeight: 700 }}>Note</span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="Describe this event…"
            style={{
              borderRadius: 10,
              border: '1px solid #cbd5e1',
              padding: '10px 12px',
              fontSize: 14,
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
          />
        </label>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: 10,
              background: '#f8fafc',
              padding: '10px 16px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => { if (text.trim() && date) onSave(text.trim(), date); }}
            style={{
              border: 'none',
              borderRadius: 10,
              background: '#6366f1',
              color: '#ffffff',
              padding: '10px 16px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

interface AnnotatedChartProps {
  chartId: string;
  /** The x-axis labels (used to position markers) */
  labels: string[];
  children: React.ReactNode;
}

/**
 * Wraps a chart with annotation support.
 * Click anywhere on the chart area to add an annotation.
 */
export default function AnnotatedChart({ chartId, labels, children }: AnnotatedChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [modal, setModal] = useState<{ editing?: Annotation; clickX?: number } | null>(null);

  const refresh = useCallback(() => setAnnotations(getAnnotations(chartId)), [chartId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleChartClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xFraction = (e.clientX - rect.left) / rect.width;
    setModal({ clickX: xFraction });
  };

  const handleSave = (text: string, date: string) => {
    if (modal?.editing) {
      updateAnnotation(modal.editing.id, { text, date });
    } else {
      saveAnnotation({ chartId, date, text });
    }
    refresh();
    setModal(null);
  };

  const handleDelete = (id: string) => {
    deleteAnnotation(id);
    refresh();
  };

  // Map annotation date to x-fraction based on label index
  const getXFraction = (annotation: Annotation): number => {
    const idx = labels.findIndex((l) => l.includes(annotation.date) || annotation.date.includes(l));
    if (idx === -1) return 0.5;
    return idx / Math.max(labels.length - 1, 1);
  };

  // Derive a default date from click position
  const getDefaultDate = (xFraction?: number): string => {
    if (xFraction === undefined || labels.length === 0) return '';
    const idx = Math.round(xFraction * (labels.length - 1));
    return labels[idx] ?? '';
  };

  return (
    <>
      <div style={{ position: 'relative' }}>
        {/* Clickable overlay */}
        <div
          ref={containerRef}
          style={{ position: 'absolute', inset: 0, zIndex: 5, cursor: 'crosshair' }}
          onClick={handleChartClick}
          title="Click to add annotation"
          aria-label="Click to add annotation"
        />

        {/* Annotation markers */}
        {annotations.map((annotation) => (
          <AnnotationMarker
            key={annotation.id}
            annotation={annotation}
            xFraction={getXFraction(annotation)}
            onEdit={(a) => setModal({ editing: a })}
            onDelete={handleDelete}
          />
        ))}

        {children}
      </div>

      {modal && (
        <AnnotationModal
          initial={modal.editing}
          defaultDate={getDefaultDate(modal.clickX)}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}

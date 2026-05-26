import { useState, useCallback } from 'react';
import SkillNode from './SkillNode';
import SkillEdge from './SkillEdge';

/**
 * SkillTreeCanvas — Renders a pannable, zoomable skill tree.
 *
 * Lays out an SVG layer for edges (SkillEdge) and absolutely positioned
 * SkillNode divs on top. Includes bottom-right zoom/pan controls.
 *
 * @param {object}   props
 * @param {Array<{ id: string, label: string, status: string, progress?: number, x: number, y: number, icon?: React.ReactNode }>} props.nodes
 * @param {Array<{ from: string, to: string, unlocked: boolean }>} props.edges – `from`/`to` are node IDs
 * @param {(id: string) => void} [props.onNodeClick]
 * @param {string}   [props.className]
 */
export default function SkillTreeCanvas({
  nodes = [],
  edges = [],
  onNodeClick,
  className = '',
}) {
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  const ZOOM_STEP = 0.15;
  const MIN_SCALE = 0.4;
  const MAX_SCALE = 2;

  const zoomIn = useCallback(() => {
    setScale((s) => Math.min(MAX_SCALE, s + ZOOM_STEP));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((s) => Math.max(MIN_SCALE, s - ZOOM_STEP));
  }, []);

  const resetView = useCallback(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, []);

  /* ── Build a coordinate lookup for edge resolution ── */
  const nodeMap = {};
  nodes.forEach((n) => {
    // Center of the 80×80 node
    nodeMap[n.id] = { x: n.x + 40, y: n.y + 40 };
  });

  return (
    <div
      className={`relative bg-bg w-full h-[500px] overflow-auto rounded-md border border-border ${className}`}
    >
      {/* Transformable inner wrapper */}
      <div
        style={{
          transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
          transformOrigin: '0 0',
          transition: 'transform 300ms ease',
        }}
        className="absolute inset-0"
      >
        {/* ── SVG Edge layer ── */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <marker
              id="arrow-locked-canvas"
              markerWidth="8"
              markerHeight="6"
              refX="8"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#2a2a2a" />
            </marker>
            <marker
              id="arrow-unlocked-canvas"
              markerWidth="8"
              markerHeight="6"
              refX="8"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#3ecf8e" />
            </marker>
          </defs>

          {edges.map((edge, i) => {
            const fromCoords = nodeMap[edge.from];
            const toCoords = nodeMap[edge.to];
            if (!fromCoords || !toCoords) return null;

            return (
              <SkillEdge
                key={`${edge.from}-${edge.to}-${i}`}
                from={fromCoords}
                to={toCoords}
                unlocked={edge.unlocked}
              />
            );
          })}
        </svg>

        {/* ── Node layer ── */}
        {nodes.map((node) => (
          <div
            key={node.id}
            className="absolute"
            style={{ left: node.x, top: node.y }}
          >
            <SkillNode
              label={node.label}
              status={node.status}
              progress={node.progress}
              icon={node.icon}
              onClick={() => onNodeClick?.(node.id)}
            />
          </div>
        ))}
      </div>

      {/* ── Pan / Zoom controls ── */}
      <div className="absolute bottom-3 right-3 flex flex-col gap-1 z-10">
        <button
          type="button"
          onClick={zoomIn}
          aria-label="Zoom in"
          className="w-8 h-8 rounded-md flex items-center justify-center bg-surface-elevated/60 text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-focus-ring"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>

        <button
          type="button"
          onClick={zoomOut}
          aria-label="Zoom out"
          className="w-8 h-8 rounded-md flex items-center justify-center bg-surface-elevated/60 text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-focus-ring"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
          </svg>
        </button>

        <button
          type="button"
          onClick={resetView}
          aria-label="Reset view"
          className="w-8 h-8 rounded-md flex items-center justify-center bg-surface-elevated/60 text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-focus-ring"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h6M4 4v6M20 20h-6m6 0v-6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

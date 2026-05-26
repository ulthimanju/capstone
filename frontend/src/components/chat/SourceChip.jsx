import { useState } from 'react';

/**
 * SourceChip — A small pill linking to a RAG source document.
 *
 * Shows a document icon and truncated name. On hover a tooltip
 * appears above the chip with the preview text.
 *
 * @param {object} props
 * @param {string} props.name     – Source document name
 * @param {string} [props.preview] – Short preview / excerpt text
 * @param {string} [props.className]
 */
export default function SourceChip({ name, preview, className = '' }) {
  const [hovered, setHovered] = useState(false);

  return (
    <span
      className={`relative inline-flex items-center gap-1.5 border border-border rounded-full px-2.5 py-1 text-xs text-text-muted hover:border-brand hover:text-brand cursor-pointer transition-colors duration-150 ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Document icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-3 h-3 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7 21h10a2 2 0 002-2V9l-5-5H7a2 2 0 00-2 2v13a2 2 0 002 2z"
        />
        <polyline
          strokeLinecap="round"
          strokeLinejoin="round"
          points="14 2 14 8 20 8"
        />
      </svg>

      {/* Name */}
      <span className="truncate max-w-[120px]">{name}</span>

      {/* Tooltip */}
      {hovered && preview && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-surface-sidebar border border-border rounded-md p-3 shadow-tooltip text-xs text-text-primary max-w-xs whitespace-normal z-50 pointer-events-none animate-fade-in">
          {preview}
        </div>
      )}
    </span>
  );
}

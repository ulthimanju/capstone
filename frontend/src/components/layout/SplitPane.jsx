import { useState, useCallback } from 'react';

/**
 * SplitPane — Two-panel layout with a draggable divider.
 * Divider is 1px #2a2a2a. Panels inherit page background.
 */
export default function SplitPane({
  left,
  right,
  defaultLeftWidth = 50,
  minLeftWidth = 20,
  maxLeftWidth = 80,
  direction = 'horizontal',
}) {
  const [leftWidth, setLeftWidth] = useState(defaultLeftWidth);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = leftWidth;

    const handleMouseMove = (moveEvent) => {
      const container = e.target.closest('[data-splitpane]');
      if (!container) return;

      const rect = container.getBoundingClientRect();
      let newWidth;

      if (direction === 'horizontal') {
        const delta = ((moveEvent.clientX - startX) / rect.width) * 100;
        newWidth = startWidth + delta;
      } else {
        const delta = ((moveEvent.clientY - startY) / rect.height) * 100;
        newWidth = startWidth + delta;
      }

      newWidth = Math.max(minLeftWidth, Math.min(maxLeftWidth, newWidth));
      setLeftWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [leftWidth, minLeftWidth, maxLeftWidth, direction]);

  const isHorizontal = direction === 'horizontal';

  return (
    <div
      data-splitpane
      className={`flex ${isHorizontal ? 'flex-row' : 'flex-col'} h-full w-full`}
    >
      {/* Left / Top panel */}
      <div
        style={{ [isHorizontal ? 'width' : 'height']: `${leftWidth}%` }}
        className="overflow-auto"
      >
        {left}
      </div>

      {/* Divider */}
      <div
        onMouseDown={handleMouseDown}
        className={`
          shrink-0 bg-border transition-colors
          ${isHorizontal
            ? 'w-px hover:w-0.5 cursor-col-resize hover:bg-brand'
            : 'h-px hover:h-0.5 cursor-row-resize hover:bg-brand'
          }
          ${isDragging ? (isHorizontal ? 'w-0.5 bg-brand' : 'h-0.5 bg-brand') : ''}
        `}
      />

      {/* Right / Bottom panel */}
      <div className="flex-1 overflow-auto min-w-0 min-h-0">
        {right}
      </div>
    </div>
  );
}

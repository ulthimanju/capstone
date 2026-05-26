import { useRef, useCallback, useEffect } from 'react';

/**
 * ChatInput — Message input area with auto-growing textarea and send button.
 *
 * - Textarea grows from 1 to 4 rows as content is typed.
 * - Pressing **Enter** (without Shift) triggers `onSend`.
 * - Send button is disabled when value is empty.
 *
 * @param {object}   props
 * @param {string}   props.value        – Controlled value
 * @param {(v: string) => void} props.onChange – Change handler
 * @param {() => void} props.onSend     – Send handler
 * @param {string}   [props.placeholder]
 * @param {boolean}  [props.disabled]
 * @param {string}   [props.className]
 */
export default function ChatInput({
  value = '',
  onChange,
  onSend,
  placeholder = 'Type a message…',
  disabled = false,
  className = '',
}) {
  const textareaRef = useRef(null);
  const hasValue = value.trim().length > 0;

  /* ── Auto-resize textarea ── */
  const resize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    // Clamp between 1 row (~36px) and 4 rows (~108px)
    el.style.height = `${Math.min(el.scrollHeight, 108)}px`;
  }, []);

  useEffect(() => {
    resize();
  }, [value, resize]);

  /* ── Keyboard handling ── */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (hasValue && !disabled) onSend?.();
    }
  };

  return (
    <div
      className={`flex items-end gap-2 p-3 bg-surface border-t border-border ${className}`}
    >
      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className="flex-1 bg-surface-elevated border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-disabled resize-none focus:border-brand focus:ring-2 ring-brand-focus-glow outline-none transition-colors duration-150"
      />

      {/* Send button */}
      <button
        type="button"
        onClick={() => hasValue && !disabled && onSend?.()}
        disabled={!hasValue || disabled}
        aria-label="Send message"
        className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-focus-ring ${
          hasValue && !disabled
            ? 'bg-brand text-bg cursor-pointer hover:bg-brand-hover'
            : 'bg-surface-elevated text-text-disabled cursor-not-allowed'
        }`}
      >
        {/* Paper-plane icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
          />
        </svg>
      </button>
    </div>
  );
}

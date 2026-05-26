import { useState, useRef } from 'react';

/**
 * FileDropZone — Drag-and-drop file upload area with click support.
 *
 * @param {Function} onFiles — called with FileList
 * @param {string} accept — file type accept string (e.g. ".pdf,.png")
 * @param {string} label — descriptive text
 * @param {string} className
 */
export default function FileDropZone({
  onFiles,
  accept,
  label = 'Drop files here or click to upload',
  className = '',
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files?.length) {
      onFiles?.(e.dataTransfer.files);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e) => {
    if (e.target.files?.length) {
      onFiles?.(e.target.files);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`min-h-[120px] flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed cursor-pointer transition-colors duration-150 ease-in-out focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:outline-none ${
        isDragOver
          ? 'border-brand bg-brand-glow'
          : 'border-border hover:border-brand hover:bg-brand-glow'
      } ${className}`}
    >
      {/* Upload cloud icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-8 w-8 text-text-muted"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M11.47 2.47a.75.75 0 011.06 0l3.75 3.75a.75.75 0 01-1.06 1.06l-2.47-2.47V15a.75.75 0 01-1.5 0V4.81L8.78 7.28a.75.75 0 01-1.06-1.06l3.75-3.75zM3 15.75a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z"
          clipRule="evenodd"
        />
      </svg>
      <p className="text-sm text-text-muted">{label}</p>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
        tabIndex={-1}
      />
    </div>
  );
}

import { useState, useRef, useCallback } from 'react';
import axiosClient from '../../api/axiosClient';

/* ── Constants ── */
const ACCEPTED_EXTENSIONS = ['.pdf', '.md', '.txt'];
const ACCEPTED_MIME_TYPES = ['application/pdf', 'text/markdown', 'text/plain', 'text/x-markdown'];
const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

/* ── Cloud upload icon ── */
function CloudUploadIcon({ className = '' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`h-10 w-10 text-text-muted ${className}`} aria-hidden="true">
      <path fillRule="evenodd" d="M11.47 2.47a.75.75 0 011.06 0l3.75 3.75a.75.75 0 01-1.06 1.06l-2.47-2.47V15a.75.75 0 01-1.5 0V4.81L8.78 7.28a.75.75 0 01-1.06-1.06l3.75-3.75zM3 15.75a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
    </svg>
  );
}

/* ── Format badge ── */
function FormatBadge({ label }) {
  return (
    <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-mono font-medium bg-surface-elevated border border-border text-text-muted">
      {label}
    </span>
  );
}

/* ── Validate file ── */
function validateFile(file) {
  const ext = '.' + file.name.split('.').pop().toLowerCase();
  const mime = file.type;

  if (!ACCEPTED_EXTENSIONS.includes(ext) && !ACCEPTED_MIME_TYPES.includes(mime)) {
    return `Unsupported file type "${ext}". Accepted formats: PDF, MD, TXT.`;
  }
  if (file.size > MAX_SIZE_BYTES) {
    return `File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum size is 50 MB.`;
  }
  return null;
}

/**
 * DocumentUploadZone — Drag-and-drop / click-to-browse file uploader.
 *
 * @param {{ notebookId: string|number, onUploadComplete: (doc: object) => void }} props
 */
export default function DocumentUploadZone({ notebookId, onUploadComplete }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadingFilename, setUploadingFilename] = useState('');
  const [error, setError] = useState('');
  const [shakeKey, setShakeKey] = useState(0);

  const inputRef = useRef(null);

  /* ── Trigger shake animation ── */
  const triggerShake = useCallback(() => {
    setShakeKey((k) => k + 1);
  }, []);

  /* ── Handle file ── */
  const handleFile = useCallback(
    async (file) => {
      setError('');
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        triggerShake();
        return;
      }

      setUploading(true);
      setProgress(0);
      setUploadingFilename(file.name);

      const formData = new FormData();
      formData.append('file', file);

      try {
        const { data } = await axiosClient.post(
          `/api/notebooks/${notebookId}/documents`,
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (evt) => {
              if (evt.total) {
                setProgress(Math.round((evt.loaded / evt.total) * 100));
              }
            },
          },
        );
        onUploadComplete?.(data);
        setProgress(100);
        setTimeout(() => {
          setUploading(false);
          setUploadingFilename('');
          setProgress(0);
        }, 600);
      } catch (err) {
        const msg =
          err.response?.data?.message ||
          err.response?.data?.error ||
          'Upload failed. Please try again.';
        setError(msg);
        triggerShake();
        setUploading(false);
        setUploadingFilename('');
        setProgress(0);
      }
    },
    [notebookId, onUploadComplete, triggerShake],
  );

  /* ── Drag handlers ── */
  const onDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const onDragLeave = (e) => { e.preventDefault(); setIsDragOver(false); };
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const onClick = () => { if (!uploading) inputRef.current?.click(); };
  const onInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = ''; // reset so same file can be re-uploaded
  };

  /* ── Border / background classes ── */
  const hasError = !!error;
  const borderClass = hasError
    ? 'border-danger'
    : isDragOver
    ? 'border-brand'
    : 'border-border hover:border-brand';
  const bgClass = isDragOver ? 'bg-brand-glow' : hasError ? 'bg-danger-muted/20' : '';
  const scaleClass = isDragOver ? 'scale-[1.01]' : '';
  const shakeClass = hasError ? 'animate-shake' : '';

  return (
    <div
      key={shakeKey}
      role="button"
      tabIndex={uploading ? -1 : 0}
      aria-label="Upload document"
      onClick={onClick}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !uploading) {
          e.preventDefault();
          onClick();
        }
      }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`relative w-full rounded-xl border-2 border-dashed p-6 flex flex-col items-center justify-center gap-3 transition-all duration-150 ${
        uploading ? 'cursor-default' : 'cursor-pointer'
      } ${borderClass} ${bgClass} ${scaleClass} ${shakeClass} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.md,.txt"
        onChange={onInputChange}
        className="hidden"
        tabIndex={-1}
      />

      {/* ── Uploading state ── */}
      {uploading ? (
        <div className="w-full space-y-3">
          <div className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4 text-brand shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm text-text-primary truncate">{uploadingFilename}</span>
          </div>
          <div className="w-full h-1.5 bg-surface-elevated rounded-full overflow-hidden">
            <div
              className="h-full bg-brand rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-text-muted text-center">{progress}% uploaded…</p>
        </div>
      ) : (
        <>
          {/* ── Default / error state ── */}
          <CloudUploadIcon className={hasError ? 'text-danger' : ''} />

          {hasError ? (
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-danger">{error}</p>
              <p className="text-xs text-text-muted">Click or drag a valid file to try again</p>
            </div>
          ) : (
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-text-primary">
                {isDragOver ? 'Drop it!' : 'Drag & drop files here'}
              </p>
              <p className="text-xs text-text-muted">or click to browse</p>
            </div>
          )}

          <div className="flex items-center gap-2 mt-1">
            <FormatBadge label="PDF" />
            <FormatBadge label="MD" />
            <FormatBadge label="TXT" />
            <span className="text-xs text-text-disabled">· max 50 MB</span>
          </div>
        </>
      )}
    </div>
  );
}

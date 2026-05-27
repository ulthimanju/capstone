import { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import DocumentUploadZone from '../components/ui/DocumentUploadZone';
import StatusBadge from '../components/ui/StatusBadge';

/* ═════════════════════════════════════════════
   API helpers
   ═════════════════════════════════════════════ */
const api = {
  getNotebooks: () => axiosClient.get('/api/notebooks').then((r) => r.data),
  createNotebook: (title) => axiosClient.post('/api/notebooks', { title }).then((r) => r.data),
  getDocuments: (nbId) => axiosClient.get(`/api/notebooks/${nbId}/documents`).then((r) => r.data),
  getDocumentStatus: (nbId, docId) =>
    axiosClient.get(`/api/notebooks/${nbId}/documents/${docId}/status`).then((r) => r.data),
  sendChat: (nbId, question) =>
    axiosClient.post(`/api/notebooks/${nbId}/query`, { question }).then((r) => r.data),
  summarizeDocument: (nbId, docId) =>
    axiosClient.post(`/api/notebooks/${nbId}/documents/${docId}/summarize`).then((r) => r.data),
};

/* ═════════════════════════════════════════════
   Small helper components
   ═════════════════════════════════════════════ */

/* Spinner */
function Spinner({ size = 'sm' }) {
  const s = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  return (
    <svg className={`animate-spin text-brand ${s}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

/* Typing indicator */
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3 bg-surface-elevated rounded-xl w-fit">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-text-muted"
          style={{ animation: `pulse-brand 1.2s ease-in-out infinite`, animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  );
}

/* Doc status → badge status mapping */
function docBadgeStatus(status) {
  switch (status?.toUpperCase()) {
    case 'READY': return 'success';
    case 'PROCESSING': return 'warning';
    case 'FAILED': return 'error';
    default: return 'neutral';
  }
}

/* Format date */
function fmtDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

/* ═════════════════════════════════════════════
   Create Notebook Modal
   ═════════════════════════════════════════════ */
function CreateNotebookModal({ open, onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTitle('');
      setError('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) { setError('Notebook title is required.'); return; }
    setLoading(true);
    setError('');
    try {
      const notebook = await api.createNotebook(trimmed);
      onCreated(notebook);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create notebook. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-border rounded-lg max-w-md w-full mx-4 animate-fade-in"
        style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.6)' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-nb-title"
      >
        <form onSubmit={handleSubmit}>
          <div className="p-6 pb-4">
            <h2 id="create-nb-title" className="text-lg font-semibold text-text-primary">
              New Notebook
            </h2>
          </div>
          <div className="px-6 pb-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Title</label>
              <input
                ref={inputRef}
                type="text"
                value={title}
                onChange={(e) => { setTitle(e.target.value); setError(''); }}
                placeholder="e.g. Calculus II, Machine Learning…"
                className={`w-full h-9 px-3 rounded-md text-sm bg-surface-elevated border text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-brand-focus-glow ${
                  error ? 'border-danger' : 'border-border focus:border-brand'
                }`}
              />
              {error && <p className="mt-1 text-xs text-danger">{error}</p>}
            </div>
          </div>
          <div className="px-6 pb-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-text-muted hover:text-text-primary rounded-md cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium bg-brand hover:bg-brand-hover text-bg rounded-md cursor-pointer transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? <><Spinner /> Creating…</> : 'Create Notebook'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════
   Left Panel — Notebook List
   ═════════════════════════════════════════════ */
function NotebookSidebar({ notebooks, selectedId, onSelect, onCreateClick, isLoading }) {
  return (
    <div className="flex flex-col h-full" style={{ width: 280, minWidth: 280 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <h2 className="text-sm font-semibold text-text-primary">Notebooks</h2>
        <button
          type="button"
          onClick={onCreateClick}
          title="New notebook"
          className="w-7 h-7 rounded-md flex items-center justify-center text-text-muted hover:text-brand hover:bg-surface-elevated cursor-pointer transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto py-2">
        {isLoading && (
          <div className="flex items-center justify-center py-10">
            <Spinner size="md" />
          </div>
        )}

        {!isLoading && notebooks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-16 px-4 text-center">
            <svg className="w-10 h-10 text-text-disabled mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            <p className="text-sm font-medium text-text-muted">No notebooks yet</p>
            <p className="text-xs text-text-disabled mt-1">Create your first one</p>
          </div>
        )}

        {!isLoading &&
          notebooks.map((nb) => {
            const isActive = nb.id === selectedId;
            return (
              <button
                key={nb.id}
                type="button"
                onClick={() => onSelect(nb)}
                className={`w-full text-left px-4 py-3 flex flex-col gap-0.5 cursor-pointer transition-colors duration-100 border-l-2 ${
                  isActive
                    ? 'border-brand bg-brand-muted text-text-primary'
                    : 'border-transparent hover:bg-surface-elevated text-text-muted hover:text-text-primary'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium truncate">{nb.title}</span>
                  {nb.documentCount !== undefined && (
                    <span className="shrink-0 text-xs rounded-full bg-surface-elevated border border-border px-2 py-0.5 text-text-disabled">
                      {nb.documentCount}
                    </span>
                  )}
                </div>
                <span className="text-xs text-text-disabled">{fmtDate(nb.createdAt)}</span>
              </button>
            );
          })}
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════
   Document Card
   ═════════════════════════════════════════════ */
function DocumentCard({ doc, onSummarize }) {
  const status = doc.status?.toUpperCase();
  const isProcessing = status === 'PROCESSING';
  const isReady = status === 'READY';

  return (
    <div
      className={`bg-surface rounded-lg border border-border p-3 flex flex-col gap-2 hover:border-brand/40 transition-colors ${
        isProcessing ? 'skeleton-shimmer' : ''
      }`}
    >
      {/* File icon + name */}
      <div className="flex items-start gap-2">
        <svg className="w-5 h-5 text-text-muted shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        <span className="text-sm font-medium text-text-primary break-all leading-tight">{doc.filename || doc.name}</span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <StatusBadge status={docBadgeStatus(status)}>
          {status || 'UNKNOWN'}
        </StatusBadge>
        {isReady ? (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onSummarize(doc); }}
            className="text-xs text-brand hover:text-brand-hover hover:underline flex items-center gap-1 cursor-pointer transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            Summarize
          </button>
        ) : (
          <span className="text-xs text-text-disabled">{fmtDate(doc.createdAt)}</span>
        )}
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════
   Chat Message
   ═════════════════════════════════════════════ */
function ChatMessage({ msg }) {
  const isUser = msg.role === 'user';
  const [citationsOpen, setCitationsOpen] = useState(false);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] space-y-1 ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
            isUser
              ? 'bg-brand text-white rounded-br-sm'
              : 'bg-surface-elevated text-text-primary rounded-bl-sm border border-border'
          }`}
        >
          {msg.content}
        </div>

        {/* Citations */}
        {!isUser && msg.sources?.length > 0 && (
          <div className="flex flex-col gap-1 pl-1">
            <button
              type="button"
              onClick={() => setCitationsOpen((v) => !v)}
              className="text-xs text-text-disabled hover:text-brand transition-colors flex items-center gap-1 cursor-pointer"
            >
              <svg className={`w-3 h-3 transition-transform ${citationsOpen ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
              {msg.sources.length} source{msg.sources.length > 1 ? 's' : ''}
            </button>
            {citationsOpen && (
              <div className="flex flex-wrap gap-1.5 animate-fade-in">
                {msg.sources.map((src, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center rounded-md border border-border bg-surface px-2 py-0.5 text-xs text-text-muted"
                  >
                    {src.filename || src.source || `Source ${i + 1}`}
                    {src.page && <span className="ml-1 text-text-disabled">p.{src.page}</span>}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════
   Summarize Modal Component
   ═════════════════════════════════════════════ */
function SummarizeModal({ open, onClose, doc, onRegenerate, summaryText, loading, error }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const t = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(t);
    }
  }, [copied]);

  if (!open) return null;

  const handleCopy = () => {
    if (!summaryText) return;
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-border rounded-lg max-w-2xl w-full flex flex-col h-[80vh] animate-fade-in"
        style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.6)' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="summary-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 id="summary-title" className="text-lg font-semibold text-text-primary">
              AI Summary &amp; Simplification
            </h2>
            <p className="text-xs text-text-muted mt-1 truncate max-w-lg">
              {doc?.filename || doc?.name}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading && (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center space-y-4">
              <Spinner size="md" />
              <p className="text-sm text-text-muted animate-pulse">
                Questly is reading and simplifying the document. Please wait…
              </p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center h-full py-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-danger/10 text-danger flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-text-primary">Generation Failed</p>
              <p className="text-xs text-text-disabled max-w-md">{error}</p>
              <button
                type="button"
                onClick={onRegenerate}
                className="mt-2 px-4 py-2 text-xs font-semibold bg-brand hover:bg-brand-hover text-bg rounded-md cursor-pointer transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && summaryText && (
            <div className="prose prose-invert max-w-none text-sm text-text-muted leading-relaxed whitespace-pre-wrap select-text selection:bg-brand/20">
              {summaryText}
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && !error && summaryText && (
          <div className="p-6 border-t border-border flex justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={onRegenerate}
              className="px-4 py-2 border border-border text-sm text-text-muted hover:text-text-primary rounded-md cursor-pointer hover:bg-surface-elevated transition-colors flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Regenerate
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="px-4 py-2 border border-border text-sm text-text-muted hover:text-text-primary rounded-md cursor-pointer hover:bg-surface-elevated transition-colors flex items-center gap-1.5"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0A2.25 2.25 0 0113.5 5.25h-3a2.25 2.25 0 01-2.166-1.638m7.332 0a2.25 2.25 0 00-2.25-2.25h-3a2.25 2.25 0 00-2.25 2.25m7.47 2.167M3.75 3.75h1.5m1.5 0h1.5m-3 1.5v13.5c0 1.242 1.008 2.25 2.25 2.25h12c1.242 0 2.25-1.008 2.25-2.25V5.25c0-1.242-1.008-2.25-2.25-2.25h-1.5m-9 0h-1.5" />
                    </svg>
                    Copy to Clipboard
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold bg-brand hover:bg-brand-hover text-bg rounded-md cursor-pointer transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════
   Right Panel — Documents + Chat
   ═════════════════════════════════════════════ */
function NotebookDetail({ notebook }) {
  const queryClient = useQueryClient();

  /* ── Documents query ── */
  const {
    data: documents = [],
    isLoading: docsLoading,
    refetch: refetchDocs,
  } = useQuery({
    queryKey: ['documents', notebook.id],
    queryFn: () => api.getDocuments(notebook.id),
    refetchInterval: false,
  });

  /* ── Poll PROCESSING documents every 3 seconds ── */
  const hasProcessing = documents.some((d) => d.status?.toUpperCase() === 'PROCESSING');

  useEffect(() => {
    if (!hasProcessing) return;
    const interval = setInterval(async () => {
      const processingDocs = documents.filter((d) => d.status?.toUpperCase() === 'PROCESSING');
      for (const doc of processingDocs) {
        try {
          const updated = await api.getDocumentStatus(notebook.id, doc.id);
          if (updated.status !== 'PROCESSING') {
            await refetchDocs();
            break;
          }
        } catch (_) {
          // ignore
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [hasProcessing, documents, notebook.id, refetchDocs]);

  /* ── Chat state ── */
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  /* ── Summarize modal states ── */
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryDoc, setSummaryDoc] = useState(null);
  const [summaryText, setSummaryText] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState('');

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, aiLoading]);

  const hasReadyDocs = documents.some((d) => d.status?.toUpperCase() === 'READY');
  const chatDisabled = !hasReadyDocs || hasProcessing || aiLoading;

  const handleSend = async () => {
    const q = input.trim();
    if (!q || chatDisabled) return;
    setInput('');
    const userMsg = { role: 'user', content: q, id: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setAiLoading(true);
    try {
      const resp = await api.sendChat(notebook.id, q);
      const aiMsg = {
        role: 'assistant',
        content: resp.answer || resp.response || resp.content || 'No response received.',
        sources: resp.sources || resp.citations || [],
        id: Date.now() + 1,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errMsg = {
        role: 'assistant',
        content:
          err.response?.data?.message ||
          'Sorry, I couldn\'t get a response. Please try again.',
        sources: [],
        id: Date.now() + 1,
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleUploadComplete = useCallback(
      (doc) => {
        queryClient.invalidateQueries({ queryKey: ['documents', notebook.id] });
        queryClient.invalidateQueries({ queryKey: ['notebooks'] });
      },
      [queryClient, notebook.id],
  );

  /* ── Trigger Summarize Endpoint ── */
  const fetchSummary = async (doc) => {
    setSummaryLoading(true);
    setSummaryError('');
    setSummaryText('');
    try {
      const res = await api.summarizeDocument(notebook.id, doc.id);
      setSummaryText(res.summary || 'Summary is empty.');
    } catch (err) {
      setSummaryError(
          err.response?.data?.message ||
          'Failed to generate summary. The local AI engine might be busy or offline.'
      );
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleSummarize = (doc) => {
    setSummaryDoc(doc);
    setSummaryOpen(true);
    fetchSummary(doc);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Documents section (55%) ── */}
      <div className="flex flex-col overflow-hidden" style={{ flex: '0 0 55%' }}>
        {/* Section header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-text-primary">Documents</h3>
            {docsLoading && <Spinner />}
            {hasProcessing && (
              <span className="text-xs text-warning animate-pulse-brand">Processing…</span>
            )}
          </div>
        </div>

        {/* Document grid + upload zone */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {!docsLoading && documents.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <svg className="w-8 h-8 text-text-disabled mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <p className="text-sm text-text-muted">No documents yet</p>
              <p className="text-xs text-text-disabled mt-0.5">Upload files below to get started</p>
            </div>
          )}

          {documents.length > 0 && (
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
              {documents.map((doc) => (
                <DocumentCard key={doc.id} doc={doc} onSummarize={handleSummarize} />
              ))}
            </div>
          )}

          {/* Upload zone */}
          <DocumentUploadZone
            notebookId={notebook.id}
            onUploadComplete={handleUploadComplete}
          />
        </div>
      </div>

      {/* ── Chat section (45%) ── */}
      <div className="flex flex-col border-t border-border overflow-hidden" style={{ flex: '0 0 45%' }}>
        {/* Chat header */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-border shrink-0">
          <svg className="w-4 h-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
          </svg>
          <h3 className="text-sm font-semibold text-text-primary">Ask AI</h3>
          <span className="text-xs text-text-disabled truncate">· {notebook.title}</span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {messages.length === 0 && !aiLoading && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <svg className="w-8 h-8 text-text-disabled mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              <p className="text-sm text-text-muted">
                {hasReadyDocs ? 'Ask a question about your documents' : 'Upload and process documents to start chatting'}
              </p>
              {hasProcessing && (
                <p className="text-xs text-warning mt-1">Documents are being processed…</p>
              )}
            </div>
          )}

          {messages.map((msg) => (
            <ChatMessage key={msg.id} msg={msg} />
          ))}

          {aiLoading && <TypingDots />}
          <div ref={chatEndRef} />
        </div>

        {/* Input bar */}
        <div className="px-4 py-3 border-t border-border shrink-0">
          <div className={`flex items-center gap-2 rounded-lg border bg-surface-elevated px-3 py-1.5 transition-colors ${
            chatDisabled ? 'border-border opacity-60' : 'border-border focus-within:border-brand'
          }`}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={chatDisabled}
              placeholder={
                hasProcessing
                  ? 'Waiting for documents to process…'
                  : !hasReadyDocs
                  ? 'Upload a document to chat'
                  : 'Ask a question…'
              }
              className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-disabled focus:outline-none disabled:cursor-not-allowed"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={chatDisabled || !input.trim()}
              className="w-7 h-7 rounded-md bg-brand hover:bg-brand-hover text-bg flex items-center justify-center shrink-0 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              {aiLoading ? (
                <Spinner />
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-xs text-text-disabled mt-1.5 text-center">
            Shift+Enter for new line · Enter to send
          </p>
        </div>
      </div>

      {/* ── Summarize Modal ── */}
      <SummarizeModal
        open={summaryOpen}
        onClose={() => setSummaryOpen(false)}
        doc={summaryDoc}
        summaryText={summaryText}
        loading={summaryLoading}
        error={summaryError}
        onRegenerate={() => fetchSummary(summaryDoc)}
      />
    </div>
  );
}

/* ═════════════════════════════════════════════
   NotebooksPage — Main export
   ═════════════════════════════════════════════ */
export default function NotebooksPage() {
  const queryClient = useQueryClient();
  const [selectedNotebook, setSelectedNotebook] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  /* ── Fetch notebooks ── */
  const { data: notebooks = [], isLoading } = useQuery({
    queryKey: ['notebooks'],
    queryFn: api.getNotebooks,
  });

  /* ── Handle creation ── */
  const handleNotebookCreated = useCallback(
    (notebook) => {
      queryClient.invalidateQueries({ queryKey: ['notebooks'] });
      setSelectedNotebook(notebook);
    },
    [queryClient],
  );

  return (
    <div className="flex h-full overflow-hidden -m-6">
      {/* ── Left sidebar ── */}
      <div className="border-r border-border bg-surface-sidebar flex-shrink-0 h-full overflow-hidden">
        <NotebookSidebar
          notebooks={notebooks}
          selectedId={selectedNotebook?.id}
          onSelect={setSelectedNotebook}
          onCreateClick={() => setCreateModalOpen(true)}
          isLoading={isLoading}
        />
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 bg-bg overflow-hidden">
        {selectedNotebook ? (
          <NotebookDetail key={selectedNotebook.id} notebook={selectedNotebook} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <svg className="w-12 h-12 text-text-disabled mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            <p className="text-base font-medium text-text-muted">Select a notebook to start studying</p>
            <p className="text-sm text-text-disabled mt-1">Or create a new one to get started</p>
            <button
              type="button"
              onClick={() => setCreateModalOpen(true)}
              className="mt-5 px-4 py-2 text-sm font-medium bg-brand hover:bg-brand-hover text-bg rounded-md cursor-pointer transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              New Notebook
            </button>
          </div>
        )}
      </div>

      {/* ── Create notebook modal ── */}
      <CreateNotebookModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={handleNotebookCreated}
      />
    </div>
  );
}

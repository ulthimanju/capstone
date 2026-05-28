import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import FlashCard from '../components/flashcard/FlashCard';
import FlashCardDeck from '../components/flashcard/FlashCardDeck';
import ReviewRatingBar from '../components/flashcard/ReviewRatingBar';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const api = {
  getNotebooks: () => axiosClient.get('/api/notebooks').then((r) => r.data),
  getFlashcards: (nbId) => axiosClient.get('/api/flashcards', { params: { notebookId: nbId } }).then((r) => r.data),
  getDueFlashcards: (nbId) => axiosClient.get('/api/flashcards/due', { params: { notebookId: nbId } }).then((r) => r.data),
  generateFlashcards: (nbId, count) => axiosClient.post('/api/flashcards/generate', { notebookId: nbId, count }).then((r) => r.data),
  reviewFlashcard: (cardId, rating) => axiosClient.post(`/api/flashcards/${cardId}/review`, { rating }).then((r) => r.data),
  deleteFlashcard: (cardId) => axiosClient.delete(`/api/flashcards/${cardId}`),
};

export default function FlashcardsPage() {
  const queryClient = useQueryClient();
  const [selectedNb, setSelectedNb] = useState(null);
  const [activeTab, setActiveTab] = useState('study'); // 'study' | 'browse' | 'stats'
  const [genCount, setGenCount] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);

  // Deck states
  const [deckIndex, setDeckIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  /* ── Query notebooks ── */
  const { data: notebooks = [], isLoading: notebooksLoading } = useQuery({
    queryKey: ['notebooks'],
    queryFn: api.getNotebooks,
  });

  // Auto-select first notebook if none selected
  useEffect(() => {
    if (notebooks.length > 0 && !selectedNb) {
      setSelectedNb(notebooks[0]);
    }
  }, [notebooks, selectedNb]);

  /* ── Query all flashcards for selected notebook ── */
  const { data: allCards = [], isLoading: allCardsLoading } = useQuery({
    queryKey: ['flashcards', selectedNb?.id],
    queryFn: () => api.getFlashcards(selectedNb.id),
    enabled: !!selectedNb,
  });

  /* ── Query due flashcards for selected notebook ── */
  const { data: dueCards = [], isLoading: dueCardsLoading, refetch: refetchDue } = useQuery({
    queryKey: ['flashcards-due', selectedNb?.id],
    queryFn: () => api.getDueFlashcards(selectedNb.id),
    enabled: !!selectedNb,
  });

  // Reset deck on notebook/due cards changes
  useEffect(() => {
    setDeckIndex(0);
    setIsFlipped(false);
  }, [selectedNb, dueCards.length]);

  const handleGenerate = async () => {
    if (!selectedNb) return;
    setIsGenerating(true);
    try {
      await api.generateFlashcards(selectedNb.id, genCount);
      queryClient.invalidateQueries({ queryKey: ['flashcards', selectedNb.id] });
      queryClient.invalidateQueries({ queryKey: ['flashcards-due', selectedNb.id] });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate flashcards. Make sure documents are uploaded and READY.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRate = async (rating) => {
    if (dueCards.length === 0) return;
    const currentCard = dueCards[deckIndex];
    setIsFlipped(false);

    try {
      await api.reviewFlashcard(currentCard.id, rating);
      
      // Delay index update slightly to allow flip animation back to front
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['flashcards', selectedNb.id] });
        queryClient.invalidateQueries({ queryKey: ['flashcards-due', selectedNb.id] });
        if (deckIndex < dueCards.length - 1) {
          setDeckIndex((prev) => prev + 1);
        }
      }, 300);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit rating.');
    }
  };

  const handleDelete = async (cardId) => {
    if (!confirm('Are you sure you want to delete this flashcard?')) return;
    try {
      await api.deleteFlashcard(cardId);
      queryClient.invalidateQueries({ queryKey: ['flashcards', selectedNb?.id] });
      queryClient.invalidateQueries({ queryKey: ['flashcards-due', selectedNb?.id] });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete flashcard.');
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden p-6 space-y-6">
      {/* Upper header block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Flashcards</h1>
          <p className="text-sm text-text-muted mt-1">Master key concepts using spaced repetition (SM-2)</p>
        </div>

        {/* Notebook selector */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-text-muted whitespace-nowrap">Notebook:</label>
          {notebooksLoading ? (
            <div className="w-40 h-9 rounded-md bg-surface skeleton-shimmer" />
          ) : notebooks.length === 0 ? (
            <span className="text-sm text-text-disabled">Create a notebook first</span>
          ) : (
            <select
              value={selectedNb?.id || ''}
              onChange={(e) => {
                const found = notebooks.find((nb) => nb.id === e.target.value);
                if (found) setSelectedNb(found);
              }}
              className="h-9 px-3 rounded-md text-sm bg-surface border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand cursor-pointer"
            >
              {notebooks.map((nb) => (
                <option key={nb.id} value={nb.id}>
                  {nb.title}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Main Area */}
      {selectedNb ? (
        <div className="flex-1 flex flex-col min-h-0 bg-surface rounded-lg border border-border overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-border shrink-0 bg-surface-sidebar px-4 gap-2">
            <button
              onClick={() => setActiveTab('study')}
              className={`px-4 py-3 text-sm font-medium border-b-2 cursor-pointer transition-colors duration-100 ${
                activeTab === 'study' ? 'border-brand text-brand' : 'border-transparent text-text-muted hover:text-text-primary'
              }`}
            >
              Study Session ({dueCards.length} due)
            </button>
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-4 py-3 text-sm font-medium border-b-2 cursor-pointer transition-colors duration-100 ${
                activeTab === 'browse' ? 'border-brand text-brand' : 'border-transparent text-text-muted hover:text-text-primary'
              }`}
            >
              Browse All ({allCards.length})
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-4 py-3 text-sm font-medium border-b-2 cursor-pointer transition-colors duration-100 ${
                activeTab === 'stats' ? 'border-brand text-brand' : 'border-transparent text-text-muted hover:text-text-primary'
              }`}
            >
              Stats
            </button>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-6 min-h-0">
            {isGenerating && (
              <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
                <svg className="animate-spin text-brand w-8 h-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-sm text-text-muted animate-pulse">
                  Questly AI is analyzing your documents and writing custom flashcards…
                </p>
              </div>
            )}

            {!isGenerating && activeTab === 'study' && (
              <div className="max-w-xl mx-auto flex flex-col h-full justify-center">
                {allCardsLoading || dueCardsLoading ? (
                  <div className="flex justify-center py-20"><LoadingSpinner size="md" /></div>
                ) : allCards.length === 0 ? (
                  /* No Cards at all */
                  <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-brand/10 text-brand flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary">No Flashcards Yet</h3>
                      <p className="text-xs text-text-disabled mt-1 max-w-sm">
                        Generate AI study cards from your uploaded documents to kickstart your study session.
                      </p>
                    </div>
                    <div className="flex items-center gap-3 bg-surface-elevated border border-border p-4 rounded-lg">
                      <label className="text-xs font-semibold text-text-muted">Count:</label>
                      <select
                        value={genCount}
                        onChange={(e) => setGenCount(parseInt(e.target.value))}
                        className="h-8 px-2 rounded-md text-xs bg-surface border border-border text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
                      >
                        <option value="5">5 Cards</option>
                        <option value="10">10 Cards</option>
                        <option value="15">15 Cards</option>
                      </select>
                      <button
                        onClick={handleGenerate}
                        className="px-4 py-2 text-xs font-semibold bg-brand hover:bg-brand-hover text-bg rounded-md cursor-pointer transition-colors"
                      >
                        Generate Flashcards
                      </button>
                    </div>
                  </div>
                ) : dueCards.length === 0 ? (
                  /* Cards exist but none are due */
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                    <div className="w-14 h-14 rounded-full bg-success/15 text-success flex items-center justify-center">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0110 21a3.745 3.745 0 01-3.068-1.593 3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-semibold text-text-primary">All Caught Up!</h3>
                    <p className="text-xs text-text-disabled mt-1 max-w-sm">
                      You reviewed all flashcards for today. Come back tomorrow or select a different notebook!
                    </p>
                  </div>
                ) : (
                  /* Study deck session */
                  <div className="space-y-6">
                    <FlashCardDeck
                      currentIndex={deckIndex}
                      totalCards={dueCards.length}
                      onNext={() => {
                        setIsFlipped(false);
                        setDeckIndex((i) => Math.min(dueCards.length - 1, i + 1));
                      }}
                      onPrev={() => {
                        setIsFlipped(false);
                        setDeckIndex((i) => Math.max(0, i - 1));
                      }}
                    >
                      <FlashCard
                        question={dueCards[deckIndex].question}
                        answer={dueCards[deckIndex].answer}
                        flipped={isFlipped}
                        onFlip={() => setIsFlipped((v) => !v)}
                      />
                    </FlashCardDeck>

                    {isFlipped && (
                      <div className="animate-slide-up flex flex-col items-center space-y-2">
                        <p className="text-xs text-text-disabled font-medium">How well did you remember this?</p>
                        <ReviewRatingBar onRate={handleRate} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {!isGenerating && activeTab === 'browse' && (
              <div className="space-y-4">
                {allCardsLoading ? (
                  <div className="flex justify-center py-10"><LoadingSpinner size="md" /></div>
                ) : allCards.length === 0 ? (
                  <p className="text-sm text-text-disabled text-center py-10">No flashcards generated yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {allCards.map((card) => (
                      <div key={card.id} className="bg-surface-elevated border border-border p-4 rounded-lg flex flex-col justify-between space-y-3 relative group">
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-brand tracking-wider">Q: {card.question}</p>
                          <div className="border-t border-border pt-2">
                            <p className="text-xs text-text-muted leading-relaxed">A: {card.answer}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-text-disabled border-t border-border/50 pt-2 shrink-0">
                          <span>Next review: {card.nextReview}</span>
                          <button
                            onClick={() => handleDelete(card.id)}
                            className="text-danger hover:text-danger-hover cursor-pointer font-medium hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!isGenerating && activeTab === 'stats' && (
              <div className="max-w-4xl mx-auto space-y-6">
                {allCardsLoading ? (
                  <div className="flex justify-center py-10"><LoadingSpinner size="md" /></div>
                ) : allCards.length === 0 ? (
                  <p className="text-sm text-text-disabled text-center py-10">No metrics available.</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-surface-elevated border border-border p-5 rounded-lg flex flex-col space-y-1">
                      <span className="text-xs font-medium text-text-muted">Total Flashcards</span>
                      <span className="text-2xl font-bold text-text-primary">{allCards.length}</span>
                    </div>
                    <div className="bg-surface-elevated border border-border p-5 rounded-lg flex flex-col space-y-1">
                      <span className="text-xs font-medium text-text-muted">Due for Review</span>
                      <span className="text-2xl font-bold text-text-primary">{dueCards.length}</span>
                    </div>
                    <div className="bg-surface-elevated border border-border p-5 rounded-lg flex flex-col space-y-1">
                      <span className="text-xs font-medium text-text-muted">Avg. Ease Factor</span>
                      <span className="text-2xl font-bold text-text-primary">
                        {(allCards.reduce((acc, c) => acc + (parseFloat(c.easeFactor) || 2.5), 0) / allCards.length).toFixed(2)}
                      </span>
                    </div>
                    <div className="bg-surface-elevated border border-border p-5 rounded-lg flex flex-col space-y-1">
                      <span className="text-xs font-medium text-text-muted">Mastery Rate</span>
                      <span className="text-2xl font-bold text-text-primary">
                        {((allCards.filter(c => c.repetitions > 3).length / allCards.length) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-grow flex items-center justify-center py-20 text-center">
          <LoadingSpinner size="md" />
        </div>
      )}
    </div>
  );
}

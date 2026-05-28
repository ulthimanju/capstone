import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import Button from '../ui/Button';
import Select from '../ui/Select';
import LoadingSpinner from '../ui/LoadingSpinner';

/**
 * DuelBattleDialog — Custom premium modal allowing students to challenge each other
 * to a timed turn-based Quiz Battle Duel.
 */
export default function DuelBattleDialog({ isOpen, onClose, onChallengeCreated, currentUser }) {
  const [loading, setLoading] = useState(false);
  const [opponents, setOpponents] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedOpponent, setSelectedOpponent] = useState('');
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        setSuccess(false);

        // Fetch all users to find potential opponents
        const usersRes = await axiosClient.get('/api/users');
        const allUsers = usersRes.data || [];
        const potentialOpponents = allUsers
          .filter(u => u.id !== currentUser?.id)
          .map(u => ({
            value: u.id,
            label: u.displayName || u.name || u.email.split('@')[0]
          }));
        setOpponents(potentialOpponents);

        // Fetch quizzes to choose as battle templates
        const quizzesRes = await axiosClient.get('/api/quizzes');
        const allQuizzes = quizzesRes.data || [];
        const quizOptions = allQuizzes.map(q => ({
          value: q.id,
          label: q.title || 'AI Generated Quiz'
        }));
        setQuizzes(quizOptions);

      } catch (err) {
        console.error('Failed to load duel dialog dependencies:', err);
        setError('Failed to load opponents or quiz templates. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [isOpen, currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOpponent || !selectedQuiz) {
      setError('Please select both an opponent and a quiz template.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosClient.post('/api/gamification/challenges', {
        opponentId: selectedOpponent,
        quizId: selectedQuiz
      });

      setSuccess(true);
      if (onChallengeCreated) {
        onChallengeCreated(response.data);
      }
      
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err) {
      console.error('Failed to initiate duel challenge:', err);
      setError(err.response?.data?.message || 'Failed to send challenge. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-surface-elevated border border-border shadow-modal rounded-2xl overflow-hidden p-6 md:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-text-primary tracking-tight flex items-center gap-2">
              <span>⚔️</span> Initiate Timed Quiz Duel
            </h2>
            <p className="text-xs text-text-muted">
              Challenge an opponent to a real-time turn-based speed quiz battle.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors text-sm font-bold p-1 hover:bg-surface rounded-full"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        {loading && opponents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <LoadingSpinner size="md" />
            <p className="text-xs text-text-muted">Fetching potential opponents and quiz templates...</p>
          </div>
        ) : success ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center animate-scale-up">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center text-3xl">
              ✓
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">Duel Dispatched!</h3>
              <p className="text-xs text-text-muted mt-1">
                Your opponent has been notified via real-time SSE stream.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3.5 bg-danger/10 border border-danger/20 text-danger rounded-xl text-xs font-semibold">
                ⚠️ {error}
              </div>
            )}

            {/* Explainer card */}
            <div className="bg-brand/5 border border-brand/10 rounded-xl p-4 space-y-2 text-xs">
              <span className="font-extrabold text-brand uppercase tracking-wider block">🏆 Battle Duel Rules</span>
              <ul className="list-disc pl-4 space-y-1 text-text-muted">
                <li>Both players answer the exact same quiz questions.</li>
                <li><strong>Speed Tie-Breaker</strong>: If scores are tied, the player who finished faster wins!</li>
                <li><strong>Prize</strong>: Winner receives an immediate bonus of <span className="text-brand font-semibold">+150 XP</span>.</li>
              </ul>
            </div>

            {/* Selects */}
            <div className="space-y-4">
              <Select
                label="Choose an Opponent"
                options={opponents}
                value={selectedOpponent}
                onChange={setSelectedOpponent}
                placeholder="Search and select student"
              />

              <Select
                label="Select Quiz Template"
                options={quizzes}
                value={selectedQuiz}
                onChange={setSelectedQuiz}
                placeholder="Choose active study quiz"
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end items-center gap-3 pt-3 border-t border-border">
              <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={loading || !selectedOpponent || !selectedQuiz}>
                {loading ? 'Sending Request...' : 'Send Challenge ⚔️'}
              </Button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}

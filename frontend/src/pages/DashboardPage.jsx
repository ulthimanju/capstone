import { useState, useEffect } from 'react';
import PageHeader from '../components/layout/PageHeader';
import ContentGrid from '../components/layout/ContentGrid';
import StatCard from '../components/cards/StatCard';
import NotebookCard from '../components/cards/NotebookCard';
import QuizCard from '../components/cards/QuizCard';
import WeakSpotCard from '../components/cards/WeakSpotCard';
import ChallengeCard from '../components/gamification/ChallengeCard';
import XPBar from '../components/gamification/XPBar';
import StreakDisplay from '../components/gamification/StreakDisplay';
import LeaderboardRow from '../components/gamification/LeaderboardRow';
import ProgressBar from '../components/navigation/ProgressBar';
import Button from '../components/ui/Button';
import axiosClient from '../api/axiosClient';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import DuelBattleDialog from '../components/gamification/DuelBattleDialog';

/**
 * DashboardPage — Main landing page showing stats, XP, streak,
 * recent notebooks, quizzes, challenges, and leaderboard.
 */
export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [notebooks, setNotebooks] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [weakSpots, setWeakSpots] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isDuelOpen, setIsDuelOpen] = useState(false);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        
        // Pass whitelisted X-User-Timezone header to cache timezone
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
        const headers = { 'X-User-Timezone': userTimezone };

        // Fetch User profile (me) and stats
        const profileRes = await axiosClient.get('/api/users/me', { headers });
        const statsRes = await axiosClient.get('/api/users/me/stats');
        
        setProfile(profileRes.data);
        setStats(statsRes.data);

        // Fetch other study segments
        const notebooksRes = await axiosClient.get('/api/notebooks');
        setNotebooks(notebooksRes.data || []);

        try {
          const quizzesRes = await axiosClient.get('/api/quizzes');
          setQuizzes(quizzesRes.data || []);
        } catch (e) {
          console.warn('Quiz service unavailable', e);
        }

        try {
          const weakSpotsRes = await axiosClient.get('/api/quizzes/weak-spots');
          setWeakSpots(weakSpotsRes.data || []);
        } catch (e) {
          console.warn('Quiz service weak-spots unavailable', e);
        }

        try {
          const leaderboardRes = await axiosClient.get('/api/gamification/leaderboard');
          setLeaderboard(leaderboardRes.data || []);
        } catch (e) {
          console.warn('Leaderboard service unavailable', e);
        }

      } catch (err) {
        console.error('Failed to load dashboard aggregates:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const displayName = profile?.name || 'Student';
  const currentXP = stats?.xp || 0;
  // Dynamic level mapping: e.g. level = floor(XP / 500) + 1
  const level = Math.floor(currentXP / 500) + 1;
  const currentLevelMin = (level - 1) * 500;
  const nextLevelMin = level * 500;
  const levelProgressXp = currentXP - currentLevelMin;
  const levelRangeXp = nextLevelMin - currentLevelMin;

  const streakCount = stats?.streak || 0;

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header + XP */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="flex-1">
          <PageHeader
            title={`Welcome back, ${displayName} 👋`}
            subtitle="Continue your learning streak and earn XP"
          />
          <div className="mt-2 max-w-md">
            <XPBar currentXP={levelProgressXp} maxXP={levelRangeXp} level={level} />
            <p className="text-xs text-text-muted mt-1">Total accumulated XP: {currentXP} points</p>
          </div>
        </div>
        <div className="flex items-center gap-6 shrink-0">
          <StreakDisplay count={streakCount} activeToday={streakCount > 0} />
        </div>
      </div>

      {/* Stat Cards */}
      <ContentGrid cols={1} mdCols={2} lgCols={4} gap={4}>
        <StatCard
          icon={<svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>}
          value={notebooks.length}
          label="Notebooks"
          trend={{ value: 'Live items count', direction: 'up' }}
        />
        <StatCard
          icon={<svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>}
          value={quizzes.length}
          label="Quizzes"
          trend={{ value: 'Practices generated', direction: 'up' }}
        />
        <StatCard
          icon={<svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" /></svg>}
          value={`${streakCount}d`}
          label="Streak"
        />
        <StatCard
          icon={<svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>}
          value={weakSpots.filter(w => w.isActive).length}
          label="Weak Spots"
          trend={{ value: 'Topics flagged', direction: 'down' }}
        />
      </ContentGrid>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2/3: Notebooks + Quizzes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Notebooks */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">Recent Notebooks</h2>
              <a href="/notebooks">
                <Button variant="ghost" size="sm">View all →</Button>
              </a>
            </div>
            {notebooks.length === 0 ? (
              <div className="bg-surface border border-border p-6 rounded-md text-center text-text-muted">
                No notebooks created yet. Get started by creating one!
              </div>
            ) : (
              <ContentGrid cols={1} mdCols={2} gap={4}>
                {notebooks.slice(0, 4).map((notebook) => (
                  <NotebookCard
                    key={notebook.id}
                    title={notebook.title}
                    description={notebook.description || 'Grounded micro-tutor notebooks details.'}
                    updatedAt="Updated recently"
                    onClick={() => window.location.href = `/notebooks?id=${notebook.id}`}
                    onDelete={() => {}}
                  />
                ))}
              </ContentGrid>
            )}
          </section>

          {/* Recent Quizzes */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">Recent Quizzes</h2>
              <a href="/quizzes">
                <Button variant="ghost" size="sm">View all →</Button>
              </a>
            </div>
            {quizzes.length === 0 ? (
              <div className="bg-surface border border-border p-6 rounded-md text-center text-text-muted">
                No quizzes generated yet. Generate a quiz inside a notebook!
              </div>
            ) : (
              <ContentGrid cols={1} mdCols={3} gap={4}>
                {quizzes.slice(0, 3).map((quiz) => (
                  <QuizCard 
                    key={quiz.id}
                    title={quiz.title || 'AI Quiz'} 
                    questionCount={quiz.questions?.length || 5} 
                    score={null} 
                    onStart={() => window.location.href = `/quizzes?id=${quiz.id}`} 
                  />
                ))}
              </ContentGrid>
            )}
          </section>

          {/* Weak Spots from Decoupled quiz-service */}
          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-4">Weak Spots</h2>
            {weakSpots.filter(w => w.isActive).length === 0 ? (
              <div className="bg-surface border border-border p-6 rounded-md text-center text-text-muted">
                Congratulations! You currently have no active weak spots. Keep it up!
              </div>
            ) : (
              <ContentGrid cols={1} mdCols={2} gap={4}>
                {weakSpots.filter(w => w.isActive).slice(0, 4).map((ws) => (
                  <WeakSpotCard
                    key={ws.id}
                    topic={ws.topic}
                    accuracy={Math.max(10, 100 - (ws.wrongCount * 15))} // Calculate approximate accuracy
                    suggestions={[
                      'Revisit document chunks for this topic',
                      `You missed this topic ${ws.wrongCount} times consecutively`,
                      'Take a localized quiz practice review'
                    ]}
                  />
                ))}
              </ContentGrid>
            )}
          </section>
        </div>

        {/* Right 1/3: Challenges + Leaderboard */}
        <div className="space-y-6">
          {/* Timed challenges */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">Active Challenges</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDuelOpen(true)}
                className="text-brand hover:text-brand-hover hover:bg-brand/10"
              >
                ⚔️ Duel Battle
              </Button>
            </div>
            <div className="space-y-3">
              <ChallengeCard
                title="Quiz Duel Marathon"
                description="Challenge an opponent to a quiz battle duel"
                status="ACTIVE"
                deadline="Today"
                reward={150}
              />
              <ChallengeCard
                title="XP Hunter"
                description="Earn 500 XP to secure double multiplier"
                status="PENDING"
                deadline="This week"
                reward={100}
              />
            </div>
          </section>

          {/* Live Leaderboard from Redis ZSET */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">Leaderboard</h2>
              <a href="/leaderboard">
                <Button variant="ghost" size="sm">View all →</Button>
              </a>
            </div>
            <div className="bg-surface border border-border rounded-md overflow-hidden">
              {leaderboard.length === 0 ? (
                <div className="p-4 text-center text-text-muted text-sm">
                  Leaderboard is currently recalculating...
                </div>
              ) : (
                leaderboard.slice(0, 5).map((row, idx) => (
                  <LeaderboardRow 
                    key={row.userId}
                    rank={idx + 1} 
                    name={row.name || `Student-${row.userId.substring(0, 4)}`} 
                    xp={row.xp} 
                    isCurrentUser={row.userId === profile?.id} 
                  />
                ))
              )}
            </div>
          </section>
        </div>
    </div>
      
      <DuelBattleDialog
        isOpen={isDuelOpen}
        onClose={() => setIsDuelOpen(false)}
        currentUser={profile}
        onChallengeCreated={(newChallenge) => {
          console.log("New challenge created", newChallenge);
          // Auto refresh leaderboard/stats/etc.
          window.location.reload();
        }}
      />
    </div>
  );
}


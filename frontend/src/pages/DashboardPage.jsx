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

/**
 * DashboardPage — Main landing page showing stats, XP, streak,
 * recent notebooks, quizzes, challenges, and leaderboard.
 */
export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header + XP */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="flex-1">
          <PageHeader
            title="Welcome back, Manju 👋"
            subtitle="Continue your learning streak and earn XP"
          />
          <div className="mt-2 max-w-md">
            <XPBar currentXP={2450} maxXP={3000} level={12} />
          </div>
        </div>
        <div className="flex items-center gap-6 shrink-0">
          <StreakDisplay count={7} activeToday={true} />
        </div>
      </div>

      {/* Stat Cards */}
      <ContentGrid cols={1} mdCols={2} lgCols={4} gap={4}>
        <StatCard
          icon={<svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>}
          value={8}
          label="Notebooks"
          trend={{ value: '+2 this week', direction: 'up' }}
        />
        <StatCard
          icon={<svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>}
          value={24}
          label="Quizzes"
          trend={{ value: '+5 this week', direction: 'up' }}
        />
        <StatCard
          icon={<svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" /></svg>}
          value="7d"
          label="Streak"
        />
        <StatCard
          icon={<svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>}
          value={3}
          label="Weak Spots"
          trend={{ value: '+1 this week', direction: 'down' }}
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
              <Button variant="ghost" size="sm">View all →</Button>
            </div>
            <ContentGrid cols={1} mdCols={2} gap={4}>
              <NotebookCard
                title="Data Structures & Algorithms"
                description="Binary trees, graph traversal, dynamic programming fundamentals and advanced techniques"
                updatedAt="2 hours ago"
                onClick={() => {}}
                onDelete={() => {}}
              />
              <NotebookCard
                title="Machine Learning Basics"
                description="Supervised learning, neural networks, backpropagation and gradient descent"
                updatedAt="Yesterday"
                onClick={() => {}}
                onDelete={() => {}}
              />
              <NotebookCard
                title="Operating Systems"
                description="Process scheduling, memory management, file systems and I/O"
                updatedAt="3 days ago"
                onClick={() => {}}
                onDelete={() => {}}
              />
              <NotebookCard
                title="Database Systems"
                description="SQL optimization, normalization, ACID properties and transaction management"
                updatedAt="1 week ago"
                onClick={() => {}}
                onDelete={() => {}}
              />
            </ContentGrid>
          </section>

          {/* Recent Quizzes */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">Recent Quizzes</h2>
              <Button variant="ghost" size="sm">View all →</Button>
            </div>
            <ContentGrid cols={1} mdCols={3} gap={4}>
              <QuizCard title="Binary Trees" questionCount={10} score={85} onStart={() => {}} />
              <QuizCard title="Neural Networks" questionCount={15} score={62} onStart={() => {}} />
              <QuizCard title="SQL Joins" questionCount={8} score={null} onStart={() => {}} />
            </ContentGrid>
          </section>

          {/* Weak Spots */}
          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-4">Weak Spots</h2>
            <ContentGrid cols={1} mdCols={2} gap={4}>
              <WeakSpotCard
                topic="Graph Traversal (BFS/DFS)"
                accuracy={42}
                suggestions={['Review adjacency list vs matrix', 'Practice shortest path problems', 'Try topological sort exercises']}
              />
              <WeakSpotCard
                topic="Backpropagation"
                accuracy={38}
                suggestions={['Revisit chain rule fundamentals', 'Trace through a small network by hand', 'Watch 3Blue1Brown neural networks series']}
              />
            </ContentGrid>
          </section>
        </div>

        {/* Right 1/3: Challenges + Leaderboard */}
        <div className="space-y-6">
          {/* Active Challenges */}
          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-4">Challenges</h2>
            <div className="space-y-3">
              <ChallengeCard
                title="Quiz Marathon"
                description="Complete 5 quizzes in one day"
                status="ACTIVE"
                deadline="Today 11:59 PM"
                reward={150}
              />
              <ChallengeCard
                title="Knowledge Explorer"
                description="Upload 3 new notebooks"
                status="PENDING"
                deadline="This week"
                reward={100}
              />
              <ChallengeCard
                title="Perfect Score"
                description="Score 100% on any quiz"
                status="COMPLETED"
                deadline="Completed"
                reward={200}
              />
            </div>
          </section>

          {/* Leaderboard Preview */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">Leaderboard</h2>
              <Button variant="ghost" size="sm">View all →</Button>
            </div>
            <div className="bg-surface border border-border rounded-md overflow-hidden">
              <LeaderboardRow rank={1} name="Alex Chen" xp={4200} isCurrentUser={false} />
              <LeaderboardRow rank={2} name="Sarah Kim" xp={3850} isCurrentUser={false} />
              <LeaderboardRow rank={3} name="Raj Patel" xp={3600} isCurrentUser={false} />
              <div className="border-t border-border" />
              <LeaderboardRow rank={7} name="Manju" xp={2450} isCurrentUser={true} />
            </div>
          </section>

          {/* Course Progress */}
          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-4">Course Progress</h2>
            <div className="bg-surface border border-border rounded-md p-4 space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-text-primary font-medium">DSA Fundamentals</span>
                  <span className="text-text-muted">72%</span>
                </div>
                <ProgressBar value={72} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-text-primary font-medium">ML Foundations</span>
                  <span className="text-text-muted">45%</span>
                </div>
                <ProgressBar value={45} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-text-primary font-medium">System Design</span>
                  <span className="text-text-muted">18%</span>
                </div>
                <ProgressBar value={18} />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

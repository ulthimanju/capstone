import { useState } from 'react';
import PageHeader from '../components/layout/PageHeader';
import ContentGrid from '../components/layout/ContentGrid';

/* ── UI Primitives ── */
import Button from '../components/ui/Button';
import IconButton from '../components/ui/IconButton';
import GoogleAuthButton from '../components/ui/GoogleAuthButton';
import RatingButton from '../components/ui/RatingButton';
import UploadButton from '../components/ui/UploadButton';
import StatusToggle from '../components/ui/StatusToggle';
import TextInput from '../components/ui/TextInput';
import PasswordInput from '../components/ui/PasswordInput';
import Textarea from '../components/ui/Textarea';
import Select from '../components/ui/Select';
import SearchInput from '../components/ui/SearchInput';
import URLInput from '../components/ui/URLInput';
import FileDropZone from '../components/ui/FileDropZone';
import FormCard from '../components/ui/FormCard';
import Badge from '../components/ui/Badge';
import RoleBadge from '../components/ui/RoleBadge';
import DifficultyBadge from '../components/ui/DifficultyBadge';
import StatusBadge from '../components/ui/StatusBadge';
import FormatBadge from '../components/ui/FormatBadge';
import XPBadge from '../components/ui/XPBadge';
import BadgeIcon from '../components/ui/BadgeIcon';
import BadgeStack from '../components/ui/BadgeStack';
import Toast from '../components/ui/Toast';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import SkeletonLoader from '../components/ui/SkeletonLoader';

/* ── Navigation ── */
import Breadcrumb from '../components/navigation/Breadcrumb';
import Tabs from '../components/navigation/Tabs';
import Pagination from '../components/navigation/Pagination';
import StepProgress from '../components/navigation/StepProgress';
import ProgressBar from '../components/navigation/ProgressBar';

/* ── Cards ── */
import StatCard from '../components/cards/StatCard';
import NotebookCard from '../components/cards/NotebookCard';
import CourseCard from '../components/cards/CourseCard';
import DocumentListItem from '../components/cards/DocumentListItem';
import QuizCard from '../components/cards/QuizCard';
import AssignmentCard from '../components/cards/AssignmentCard';
import WeakSpotCard from '../components/cards/WeakSpotCard';

/* ── Tables ── */
import DataTable from '../components/tables/DataTable';
import PracticeTable from '../components/tables/PracticeTable';
import SubmissionsTable from '../components/tables/SubmissionsTable';

/* ── Modals ── */
import ConfirmModal from '../components/modals/ConfirmModal';
import FormModal from '../components/modals/FormModal';
import SourceModal from '../components/modals/SourceModal';
import NodeInfoPanel from '../components/modals/NodeInfoPanel';

/* ── Quiz ── */
import QuestionCard from '../components/quiz/QuestionCard';
import OptionButton from '../components/quiz/OptionButton';
import QuizTimer from '../components/quiz/QuizTimer';
import QuizResultSummary from '../components/quiz/QuizResultSummary';
import QuizProgressBar from '../components/quiz/QuizProgressBar';

/* ── Flashcard ── */
import FlashCard from '../components/flashcard/FlashCard';
import FlashCardDeck from '../components/flashcard/FlashCardDeck';
import ReviewRatingBar from '../components/flashcard/ReviewRatingBar';

/* ── Skill Tree ── */
import SkillNode from '../components/skilltree/SkillNode';
import SkillTreeCanvas from '../components/skilltree/SkillTreeCanvas';

/* ── Gamification ── */
import XPBar from '../components/gamification/XPBar';
import StreakDisplay from '../components/gamification/StreakDisplay';
import BadgeGrid from '../components/gamification/BadgeGrid';
import LeaderboardRow from '../components/gamification/LeaderboardRow';
import ChallengeCard from '../components/gamification/ChallengeCard';

/* ── Chat ── */
import ChatBubble from '../components/chat/ChatBubble';
import SourceChip from '../components/chat/SourceChip';
import ChatInput from '../components/chat/ChatInput';

/* ── Charts ── */
import ChartContainer from '../components/charts/ChartContainer';

/* ═══════════════════════════════════════════
   Section wrapper for the showcase
   ═══════════════════════════════════════════ */
function Section({ title, children }) {
  return (
    <section className="mb-12">
      <h2 className="text-xl font-bold text-text-primary mb-1">{title}</h2>
      <div className="h-px bg-border mb-6" />
      {children}
    </section>
  );
}

function SubSection({ title, children }) {
  return (
    <div className="mb-8">
      <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">{title}</h3>
      {children}
    </div>
  );
}

export default function ComponentShowcasePage() {
  /* ── Local state for interactive demos ── */
  const [statusVal, setStatusVal] = useState('UNSOLVED');
  const [activeTab, setActiveTab] = useState('tab1');
  const [currentPage, setCurrentPage] = useState(3);
  const [searchVal, setSearchVal] = useState('');
  const [chatVal, setChatVal] = useState('');
  const [flipped, setFlipped] = useState(false);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [showNodePanel, setShowNodePanel] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastVariant, setToastVariant] = useState('success');

  return (
    <div className="max-w-6xl space-y-8">
      <PageHeader
        title="Component Showcase"
        subtitle="All 71 Supabase-themed components in one living styleguide"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { setToastVariant('success'); setShowToast(true); }}>Show Toast</Button>
            <Button variant="primary" size="sm" onClick={() => setShowConfirm(true)}>Open Modal</Button>
          </div>
        }
      />

      {/* ══════════════ BUTTONS ══════════════ */}
      <Section title="Buttons">
        <SubSection title="Button variants">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="primary" loading>Loading</Button>
            <Button variant="primary" disabled>Disabled</Button>
          </div>
        </SubSection>
        <SubSection title="Button sizes">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" size="sm">Small</Button>
            <Button variant="primary" size="md">Medium</Button>
            <Button variant="primary" size="lg">Large</Button>
          </div>
        </SubSection>
        <SubSection title="Specialized buttons">
          <div className="flex flex-wrap items-center gap-4">
            <IconButton icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>} />
            <GoogleAuthButton />
            <UploadButton>Upload File</UploadButton>
          </div>
        </SubSection>
        <SubSection title="Rating buttons">
          <div className="flex gap-2 max-w-md">
            <RatingButton rating="again" />
            <RatingButton rating="hard" />
            <RatingButton rating="good" selected />
            <RatingButton rating="easy" />
          </div>
        </SubSection>
        <SubSection title="Status toggle">
          <StatusToggle value={statusVal} onChange={setStatusVal} />
        </SubSection>
      </Section>

      {/* ══════════════ INPUTS ══════════════ */}
      <Section title="Inputs & Forms">
        <ContentGrid cols={1} mdCols={2} gap={6}>
          <div className="space-y-4">
            <TextInput label="Full Name" placeholder="Enter your name" />
            <PasswordInput label="Password" placeholder="Enter password" />
            <TextInput label="With error" placeholder="Invalid input" error="This field is required" />
            <URLInput label="Website" placeholder="https://example.com" />
          </div>
          <div className="space-y-4">
            <Select label="Difficulty" options={[{ value: 'easy', label: 'Easy' }, { value: 'medium', label: 'Medium' }, { value: 'hard', label: 'Hard' }]} />
            <SearchInput value={searchVal} onChange={(e) => setSearchVal(e.target.value)} onClear={() => setSearchVal('')} placeholder="Search components..." />
            <Textarea label="Notes" placeholder="Write your notes here..." />
          </div>
        </ContentGrid>
        <SubSection title="File drop zone">
          <FileDropZone onFiles={() => {}} label="Drop your PDF, MD, or TXT files here" />
        </SubSection>
        <SubSection title="Form card">
          <div className="max-w-md">
            <FormCard title="Create Notebook" onSubmit={(e) => e.preventDefault()} submitLabel="Create">
              <TextInput label="Notebook Name" placeholder="e.g. Data Structures" />
              <Textarea label="Description" placeholder="What is this notebook about?" />
            </FormCard>
          </div>
        </SubSection>
      </Section>

      {/* ══════════════ BADGES ══════════════ */}
      <Section title="Badges & Tags">
        <SubSection title="Generic badges">
          <div className="flex flex-wrap gap-2">
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger">Danger</Badge>
            <Badge variant="neutral">Neutral</Badge>
            <Badge variant="brand">Brand</Badge>
          </div>
        </SubSection>
        <SubSection title="Role badges">
          <div className="flex flex-wrap gap-2">
            <RoleBadge role="STUDENT" />
            <RoleBadge role="TUTOR" />
            <RoleBadge role="ADMIN" />
          </div>
        </SubSection>
        <SubSection title="Difficulty badges">
          <div className="flex flex-wrap gap-2">
            <DifficultyBadge difficulty="EASY" />
            <DifficultyBadge difficulty="MEDIUM" />
            <DifficultyBadge difficulty="HARD" />
          </div>
        </SubSection>
        <SubSection title="Status badges">
          <div className="flex flex-wrap gap-2">
            <StatusBadge status="success">Active</StatusBadge>
            <StatusBadge status="warning">Pending</StatusBadge>
            <StatusBadge status="error">Failed</StatusBadge>
            <StatusBadge status="neutral">Draft</StatusBadge>
            <StatusBadge status="info">Processing</StatusBadge>
          </div>
        </SubSection>
        <SubSection title="Format, XP & Achievement badges">
          <div className="flex flex-wrap items-center gap-3">
            <FormatBadge format="PDF" />
            <FormatBadge format="MD" />
            <FormatBadge format="TXT" />
            <XPBadge amount={50} />
            <XPBadge amount={200} />
            <BadgeIcon icon="🏆" label="Champion" earned={true} />
            <BadgeIcon icon="🎯" label="Sharpshooter" earned={true} />
            <BadgeIcon icon="🔥" label="On Fire" earned={false} />
          </div>
        </SubSection>
        <SubSection title="Stacked Achievements / Avatars (BadgeStack)">
          <div className="flex flex-wrap items-center gap-8">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-text-muted uppercase">Avatar Stack (Max 3)</span>
              <BadgeStack
                items={[
                  { id: 1, label: 'Alex Chen', image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80' },
                  { id: 2, label: 'Sarah Kim', image: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=80&h=80&q=80' },
                  { id: 3, label: 'Raj Patel', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80' },
                  { id: 4, label: 'John Doe', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80&q=80' },
                  { id: 5, label: 'Emily Watson', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&h=80&q=80' },
                ]}
                max={3}
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-text-muted uppercase">Achievement Stack (Max 4)</span>
              <BadgeStack
                items={[
                  { id: 1, label: 'Champion', icon: '🏆' },
                  { id: 2, label: 'Sharpshooter', icon: '🎯' },
                  { id: 3, label: 'On Fire', icon: '🔥' },
                  { id: 4, label: 'Bookworm', icon: '📚' },
                  { id: 5, label: 'Speed Demon', icon: '⚡' },
                  { id: 6, label: 'Big Brain', icon: '🧠' },
                ]}
                max={4}
                size="lg"
              />
            </div>
          </div>
        </SubSection>
      </Section>

      {/* ══════════════ NAVIGATION ══════════════ */}
      <Section title="Navigation">
        <SubSection title="Breadcrumb">
          <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Notebooks', href: '/notebooks' }, { label: 'Data Structures' }]} />
        </SubSection>
        <SubSection title="Tabs">
          <Tabs
            tabs={[{ id: 'tab1', label: 'Overview' }, { id: 'tab2', label: 'Quizzes' }, { id: 'tab3', label: 'Flashcards' }, { id: 'tab4', label: 'Settings' }]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </SubSection>
        <SubSection title="Pagination">
          <Pagination currentPage={currentPage} totalPages={12} onPageChange={setCurrentPage} />
        </SubSection>
        <SubSection title="Step progress">
          <StepProgress steps={[{ label: 'Upload' }, { label: 'Process' }, { label: 'Generate' }, { label: 'Review' }]} currentStep={2} />
        </SubSection>
        <SubSection title="Progress bars">
          <div className="space-y-3 max-w-md">
            <ProgressBar value={75} showValue label="Course Progress" />
            <ProgressBar value={45} showValue label="Quiz Score" variant="warning" />
            <ProgressBar value={20} showValue label="Weak Area" variant="danger" />
          </div>
        </SubSection>
      </Section>

      {/* ══════════════ CARDS ══════════════ */}
      <Section title="Cards">
        <SubSection title="Stat cards">
          <ContentGrid cols={1} mdCols={2} lgCols={4} gap={4}>
            <StatCard icon={<span className="text-brand text-lg">📚</span>} value={8} label="Notebooks" trend={{ value: '+2', direction: 'up' }} />
            <StatCard icon={<span className="text-accent-blue text-lg">❓</span>} value={24} label="Quizzes" trend={{ value: '+5', direction: 'up' }} />
            <StatCard icon={<span className="text-warning text-lg">🔥</span>} value="7d" label="Streak" />
            <StatCard icon={<span className="text-danger text-lg">📉</span>} value={3} label="Weak Spots" trend={{ value: '+1', direction: 'down' }} />
          </ContentGrid>
        </SubSection>
        <SubSection title="Notebook & Course cards">
          <ContentGrid cols={1} mdCols={3} gap={4}>
            <NotebookCard title="Data Structures" description="Binary trees, graphs, and dynamic programming" updatedAt="2h ago" onClick={() => {}} onDelete={() => {}} />
            <CourseCard title="ML Fundamentals" progress={65} enrolled={true} instructor="Dr. Smith" />
            <CourseCard title="System Design" progress={20} enrolled={false} instructor="Prof. Jones" />
          </ContentGrid>
        </SubSection>
        <SubSection title="Document list items">
          <div className="space-y-1">
            <DocumentListItem name="Chapter 1 - Introduction.pdf" format="PDF" status="processed" onClick={() => {}} onDelete={() => {}} />
            <DocumentListItem name="Notes - Week 3.md" format="MD" status="processing" onClick={() => {}} onDelete={() => {}} />
            <DocumentListItem name="Summary.txt" format="TXT" status="error" onClick={() => {}} onDelete={() => {}} />
          </div>
        </SubSection>
        <SubSection title="Quiz, Assignment & Weak Spot cards">
          <ContentGrid cols={1} mdCols={3} gap={4}>
            <QuizCard title="Binary Search" questionCount={10} score={92} onStart={() => {}} />
            <AssignmentCard title="Lab 3: Sorting" status="GRADED" grade={88} dueDate="May 20, 2026" />
            <WeakSpotCard topic="Recursion" accuracy={35} suggestions={['Practice base case identification', 'Draw recursion trees']} />
          </ContentGrid>
        </SubSection>
      </Section>

      {/* ══════════════ TABLES ══════════════ */}
      <Section title="Tables">
        <SubSection title="Data table">
          <DataTable
            columns={[
              { key: 'name', label: 'Name' },
              { key: 'role', label: 'Role' },
              { key: 'xp', label: 'XP' },
              { key: 'status', label: 'Status' },
            ]}
            data={[
              { name: 'Manju', role: 'Student', xp: 2450, status: 'Active' },
              { name: 'Alex Chen', role: 'Tutor', xp: 4200, status: 'Active' },
              { name: 'Sarah Kim', role: 'Student', xp: 3850, status: 'Inactive' },
            ]}
          />
        </SubSection>
        <SubSection title="Practice table">
          <PracticeTable
            problems={[
              { id: 1, title: 'Two Sum', url: 'https://leetcode.com/problems/two-sum', status: 'SOLVED', difficulty: 'EASY' },
              { id: 2, title: 'Add Two Numbers', url: 'https://leetcode.com/problems/add-two-numbers', status: 'ATTEMPTED', difficulty: 'MEDIUM' },
              { id: 3, title: 'Median of Two Sorted Arrays', url: 'https://leetcode.com/problems/median-of-two-sorted-arrays', status: 'UNSOLVED', difficulty: 'HARD' },
            ]}
            onStatusChange={() => {}}
          />
        </SubSection>
        <SubSection title="Submissions table">
          <SubmissionsTable
            submissions={[
              { id: 1, title: 'Lab 1: Arrays', grade: 95, submittedAt: '2026-05-20', status: 'graded' },
              { id: 2, title: 'Lab 2: Linked Lists', grade: 72, submittedAt: '2026-05-22', status: 'graded' },
              { id: 3, title: 'Lab 3: Sorting', grade: 45, submittedAt: '2026-05-25', status: 'graded' },
            ]}
            onView={() => {}}
          />
        </SubSection>
      </Section>

      {/* ══════════════ QUIZ ══════════════ */}
      <Section title="Quiz Components">
        <SubSection title="Question + Options">
          <div className="max-w-2xl space-y-3">
            <QuestionCard questionNumber={3} totalQuestions={10} question="What is the time complexity of binary search on a sorted array of n elements?" />
            <div className="space-y-2">
              <OptionButton label="O(n)" index={0} selected={selectedOption === 0} onClick={() => setSelectedOption(0)} />
              <OptionButton label="O(log n)" index={1} selected={selectedOption === 1} correct={true} onClick={() => setSelectedOption(1)} />
              <OptionButton label="O(n log n)" index={2} selected={selectedOption === 2} onClick={() => setSelectedOption(2)} />
              <OptionButton label="O(1)" index={3} selected={selectedOption === 3} correct={false} onClick={() => setSelectedOption(3)} />
            </div>
          </div>
        </SubSection>
        <SubSection title="Quiz Timer & Progress">
          <div className="flex items-center gap-6">
            <QuizTimer seconds={145} />
            <QuizTimer seconds={25} />
            <QuizTimer seconds={7} />
          </div>
          <div className="mt-4">
            <QuizProgressBar total={10} current={3} answered={[0, 1, 4, 7]} />
          </div>
        </SubSection>
        <SubSection title="Quiz Result Summary">
          <div className="max-w-md">
            <QuizResultSummary score={75} totalQuestions={10} correctCount={7} wrongTopics={['Recursion', 'Graph Traversal', 'Dynamic Programming']} />
          </div>
        </SubSection>
      </Section>

      {/* ══════════════ FLASHCARDS ══════════════ */}
      <Section title="Flashcard Components">
        <div className="max-w-lg">
          <FlashCardDeck
            currentIndex={flashcardIndex}
            totalCards={5}
            onPrev={() => setFlashcardIndex(Math.max(0, flashcardIndex - 1))}
            onNext={() => setFlashcardIndex(Math.min(4, flashcardIndex + 1))}
          >
            <FlashCard
              question="What is the difference between a stack and a queue?"
              answer="A stack follows LIFO (Last In, First Out) while a queue follows FIFO (First In, First Out). Stacks use push/pop operations, queues use enqueue/dequeue."
              flipped={flipped}
              onFlip={() => setFlipped(!flipped)}
            />
          </FlashCardDeck>
          <div className="mt-4">
            <ReviewRatingBar onRate={(r) => { setFlipped(false); setFlashcardIndex(Math.min(4, flashcardIndex + 1)); }} />
          </div>
        </div>
      </Section>

      {/* ══════════════ SKILL TREE ══════════════ */}
      <Section title="Skill Tree">
        <SubSection title="Skill nodes">
          <div className="flex items-end gap-6">
            <SkillNode label="Arrays" status="unlocked" />
            <SkillNode label="Linked Lists" status="in-progress" progress={65} />
            <SkillNode label="Trees" status="locked" />
          </div>
        </SubSection>
        <SubSection title="Skill tree canvas">
          <SkillTreeCanvas
            nodes={[
              { id: '1', label: 'Arrays', status: 'unlocked', x: 50, y: 50 },
              { id: '2', label: 'Sorting', status: 'unlocked', x: 200, y: 50 },
              { id: '3', label: 'Searching', status: 'in-progress', progress: 60, x: 350, y: 50 },
              { id: '4', label: 'Trees', status: 'locked', x: 200, y: 180 },
              { id: '5', label: 'Graphs', status: 'locked', x: 350, y: 180 },
              { id: '6', label: 'DP', status: 'locked', x: 500, y: 120 },
            ]}
            edges={[
              { from: '1', to: '2', unlocked: true },
              { from: '2', to: '3', unlocked: true },
              { from: '2', to: '4', unlocked: false },
              { from: '3', to: '5', unlocked: false },
              { from: '3', to: '6', unlocked: false },
              { from: '4', to: '5', unlocked: false },
            ]}
            onNodeClick={(id) => console.log('Node clicked:', id)}
          />
        </SubSection>
      </Section>

      {/* ══════════════ GAMIFICATION ══════════════ */}
      <Section title="Gamification">
        <SubSection title="XP Bar">
          <div className="max-w-md">
            <XPBar currentXP={2450} maxXP={3000} level={12} />
          </div>
        </SubSection>
        <SubSection title="Streak display">
          <div className="flex gap-8">
            <StreakDisplay count={7} activeToday={true} />
            <StreakDisplay count={0} activeToday={false} />
          </div>
        </SubSection>
        <SubSection title="Badge grid">
          <BadgeGrid badges={[
            { icon: '🏆', label: 'Champion', earned: true },
            { icon: '🎯', label: 'Sharpshooter', earned: true },
            { icon: '🔥', label: 'On Fire', earned: true },
            { icon: '📚', label: 'Bookworm', earned: true },
            { icon: '⚡', label: 'Speed Demon', earned: false },
            { icon: '🧠', label: 'Big Brain', earned: false },
            { icon: '💎', label: 'Diamond', earned: false },
            { icon: '🌟', label: 'All Star', earned: false },
          ]} />
        </SubSection>
        <SubSection title="Leaderboard rows">
          <div className="bg-surface border border-border rounded-md overflow-hidden max-w-md">
            <LeaderboardRow rank={1} name="Alex Chen" xp={4200} isCurrentUser={false} />
            <LeaderboardRow rank={2} name="Sarah Kim" xp={3850} isCurrentUser={false} />
            <LeaderboardRow rank={3} name="Raj Patel" xp={3600} isCurrentUser={false} />
            <LeaderboardRow rank={7} name="Manju" xp={2450} isCurrentUser={true} />
          </div>
        </SubSection>
        <SubSection title="Challenge cards">
          <ContentGrid cols={1} mdCols={3} gap={4}>
            <ChallengeCard title="Quiz Marathon" description="Complete 5 quizzes in one day" status="ACTIVE" deadline="Today" reward={150} />
            <ChallengeCard title="Explorer" description="Upload 3 notebooks" status="PENDING" deadline="This week" reward={100} />
            <ChallengeCard title="Perfect Score" description="Score 100% on any quiz" status="COMPLETED" deadline="Done" reward={200} />
          </ContentGrid>
        </SubSection>
      </Section>

      {/* ══════════════ CHAT / RAG ══════════════ */}
      <Section title="Chat / RAG">
        <div className="max-w-2xl bg-bg border border-border rounded-md overflow-hidden">
          <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
            <ChatBubble sender="user" message="What is the time complexity of quicksort?" timestamp="2:30 PM" />
            <ChatBubble
              sender="ai"
              message="Quicksort has an average-case time complexity of O(n log n) and a worst-case of O(n²). The worst case occurs when the pivot selection is poor, such as always picking the smallest or largest element."
              timestamp="2:30 PM"
              sources={['DSA Notebook', 'Sorting Algorithms.pdf']}
            />
            <ChatBubble sender="user" message="How can I avoid the worst case?" timestamp="2:31 PM" />
          </div>
          <ChatInput
            value={chatVal}
            onChange={(e) => setChatVal(e.target.value)}
            onSend={() => setChatVal('')}
            placeholder="Ask about your study materials..."
          />
        </div>
        <SubSection title="Source chips">
          <div className="flex gap-2 mt-4">
            <SourceChip name="DSA Notebook" preview="Chapter 5: Sorting algorithms including quicksort, mergesort, and heapsort..." />
            <SourceChip name="Algorithms.pdf" preview="Comparison-based sorting lower bound of Ω(n log n)..." />
            <SourceChip name="Lecture Notes" preview="Week 4: Divide and conquer paradigm..." />
          </div>
        </SubSection>
      </Section>

      {/* ══════════════ FEEDBACK ══════════════ */}
      <Section title="Feedback & State">
        <SubSection title="Loading spinners">
          <div className="flex items-center gap-4">
            <LoadingSpinner size="sm" />
            <LoadingSpinner size="md" />
            <LoadingSpinner size="lg" />
          </div>
        </SubSection>
        <SubSection title="Skeleton loaders">
          <ContentGrid cols={1} mdCols={4} gap={4}>
            <SkeletonLoader variant="card" />
            <div className="space-y-2">
              <SkeletonLoader variant="text" lines={3} />
            </div>
            <div className="flex items-center gap-3">
              <SkeletonLoader variant="avatar" />
              <SkeletonLoader variant="button" />
            </div>
          </ContentGrid>
        </SubSection>
        <SubSection title="Empty & Error states">
          <ContentGrid cols={1} mdCols={2} gap={4}>
            <div className="bg-surface border border-border rounded-md">
              <EmptyState
                icon={<svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>}
                title="No notebooks yet"
                description="Upload your first document to get started"
                action={<Button variant="primary" size="sm">Upload</Button>}
              />
            </div>
            <div className="bg-surface border border-border rounded-md">
              <ErrorState title="Failed to load" message="Could not connect to the server. Please check your connection." onRetry={() => {}} />
            </div>
          </ContentGrid>
        </SubSection>
        <SubSection title="Toast notifications">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { setToastVariant('success'); setShowToast(true); }}>Success</Button>
            <Button variant="outline" size="sm" onClick={() => { setToastVariant('warning'); setShowToast(true); }}>Warning</Button>
            <Button variant="outline" size="sm" onClick={() => { setToastVariant('error'); setShowToast(true); }}>Error</Button>
            <Button variant="outline" size="sm" onClick={() => { setToastVariant('info'); setShowToast(true); }}>Info</Button>
          </div>
        </SubSection>
      </Section>

      {/* ══════════════ CHARTS ══════════════ */}
      <Section title="Charts">
        <ChartContainer title="Weekly Activity">
          <div className="h-40 flex items-center justify-center text-text-muted text-sm">
            Install <code className="font-mono text-brand mx-1">recharts</code> to see live charts here. Theme tokens are exported from ChartContainer.
          </div>
        </ChartContainer>
      </Section>

      {/* ══════════════ MODALS (rendered conditionally) ══════════════ */}
      <ConfirmModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => setShowConfirm(false)}
        title="Delete Notebook?"
        message="This action cannot be undone. All quizzes and flashcards generated from this notebook will also be deleted."
        confirmLabel="Delete"
        confirmVariant="danger"
      />

      <FormModal
        open={showFormModal}
        onClose={() => setShowFormModal(false)}
        title="Create New Quiz"
        onSubmit={(e) => { e.preventDefault(); setShowFormModal(false); }}
        submitLabel="Generate Quiz"
      >
        <TextInput label="Quiz Title" placeholder="e.g. Binary Trees Quiz" />
        <Select label="Difficulty" options={[{ value: 'easy', label: 'Easy' }, { value: 'medium', label: 'Medium' }, { value: 'hard', label: 'Hard' }]} />
      </FormModal>

      <SourceModal
        open={showSourceModal}
        onClose={() => setShowSourceModal(false)}
        title="Source Chunks"
        sources={[
          { content: 'Binary search works by repeatedly dividing the search interval in half...', metadata: 'DSA Notebook, Page 42' },
          { content: 'The time complexity of binary search is O(log n) where n is the number of elements...', metadata: 'Algorithms.pdf, Section 3.2' },
        ]}
      />

      <NodeInfoPanel
        open={showNodePanel}
        onClose={() => setShowNodePanel(false)}
        title="Binary Trees"
        description="Learn about binary tree data structures including traversal algorithms, balanced trees, and binary search trees."
        prerequisites={['Arrays', 'Linked Lists', 'Recursion']}
        status="in-progress"
      />

      {showToast && (
        <Toast
          message={`This is a ${toastVariant} notification!`}
          variant={toastVariant}
          visible={showToast}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}

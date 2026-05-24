# Questly — UI Component Inventory

> **Completed**: 2026-05-24
> **Stack**: React 19 · Vite · Tailwind CSS v4 · Zustand
> **Scope**: All reusable components required across 10 key screens

---

## Component Summary

| Category | Component Count |
|---|---|
| Layout | 6 |
| Navigation | 5 |
| Buttons | 6 |
| Inputs & Forms | 8 |
| Cards | 7 |
| Modals & Dialogs | 4 |
| Tables | 3 |
| Charts | 4 |
| Badges & Tags | 6 |
| Quiz Components | 5 |
| Flashcard Components | 3 |
| Skill Tree Components | 3 |
| Gamification Components | 5 |
| Feedback & State | 5 |
| Chat / RAG Components | 3 |
| **Total** | **73** |

---

## 1. Layout

### `AppShell`
Top-level wrapper that composes Sidebar + TopBar + main content area.

| Prop | Type | Description |
|---|---|---|
| `children` | ReactNode | Page content |

---

### `Sidebar`
Left navigation panel. Collapsible on smaller viewports.

| Prop | Type | Description |
|---|---|---|
| `collapsed` | boolean | Collapsed state |
| `onToggle` | () => void | Toggle callback |

**Navigation items:**
- Dashboard, Notebooks, Quiz, Flashcards, Courses, Practice, Skill Tree, Analytics, Profile

---

### `TopBar`
Top header bar with user info and XP.

| Prop | Type | Description |
|---|---|---|
| `user` | User | Current user object |
| `xp` | number | Current XP total |

---

### `PageHeader`
Consistent page title + optional action button slot.

| Prop | Type | Description |
|---|---|---|
| `title` | string | Page title |
| `subtitle` | string | Optional subtitle |
| `action` | ReactNode | Optional right-side action (e.g. New Button) |

---

### `ContentGrid`
Responsive grid layout for card collections.

| Prop | Type | Description |
|---|---|---|
| `cols` | 1 \| 2 \| 3 \| 4 | Grid columns |
| `children` | ReactNode | Card items |

---

### `SplitPane`
Two-panel horizontal layout (used in Notebook view).

| Prop | Type | Description |
|---|---|---|
| `left` | ReactNode | Left panel content |
| `right` | ReactNode | Right panel content |
| `leftWidth` | string | CSS width (e.g. `"40%"`) |

---

## 2. Navigation

### `Breadcrumb`
Path trail for nested pages.

| Prop | Type | Description |
|---|---|---|
| `items` | `{ label: string, href?: string }[]` | Breadcrumb segments |

---

### `Tabs`
Horizontal tab switcher.

| Prop | Type | Description |
|---|---|---|
| `tabs` | `{ label: string, value: string }[]` | Tab definitions |
| `active` | string | Active tab value |
| `onChange` | (value: string) => void | Tab change handler |

---

### `Pagination`
Page number controls for tables/lists.

| Prop | Type | Description |
|---|---|---|
| `page` | number | Current page |
| `totalPages` | number | Total pages |
| `onChange` | (page: number) => void | Page change handler |

---

### `StepProgress`
Horizontal step indicator (used in quiz onboarding).

| Prop | Type | Description |
|---|---|---|
| `steps` | string[] | Step labels |
| `current` | number | Active step index |

---

### `ProgressBar`
Linear progress bar.

| Prop | Type | Description |
|---|---|---|
| `value` | number | 0–100 |
| `label` | string | Optional label text |
| `color` | `"primary" \| "success" \| "warning"` | Color variant |

---

## 3. Buttons

### `Button`
Primary action button.

| Variant | Usage |
|---|---|
| `primary` | Main CTA (Login, Submit, Enroll) |
| `secondary` | Secondary actions (Cancel, Back) |
| `danger` | Destructive actions (Delete) |
| `ghost` | Subtle actions (Skip, Dismiss) |
| `outline` | Bordered button without fill |

| Prop | Type | Description |
|---|---|---|
| `variant` | string | Visual variant |
| `size` | `"sm" \| "md" \| "lg"` | Size |
| `loading` | boolean | Shows spinner, disables click |
| `disabled` | boolean | Disabled state |
| `leftIcon` | ReactNode | Icon before label |
| `onClick` | () => void | Click handler |

---

### `IconButton`
Square button with only an icon (no label).

| Prop | Type | Description |
|---|---|---|
| `icon` | ReactNode | Icon element |
| `tooltip` | string | Hover tooltip |
| `variant` | string | Visual variant |

---

### `GoogleAuthButton`
OAuth button with Google branding.

| Prop | Type | Description |
|---|---|---|
| `label` | string | e.g. "Continue with Google" |
| `onClick` | () => void | Triggers OAuth flow |

---

### `RatingButton`
SM-2 rating button used in flashcard review (1–4 scale).

| Prop | Type | Description |
|---|---|---|
| `rating` | 1 \| 2 \| 3 \| 4 | Rating value |
| `label` | string | "Again" / "Hard" / "Good" / "Easy" |
| `onClick` | (rating: number) => void | Rating handler |

---

### `UploadButton`
File picker trigger button.

| Prop | Type | Description |
|---|---|---|
| `accept` | string | Accepted MIME types |
| `onFile` | (file: File) => void | File selected handler |
| `loading` | boolean | Upload in progress |

---

### `StatusToggle`
Three-state toggle for practice item status.

| Prop | Type | Description |
|---|---|---|
| `status` | `"UNSOLVED" \| "ATTEMPTED" \| "SOLVED"` | Current status |
| `onChange` | (status: string) => void | Change handler |

---

## 4. Inputs & Forms

### `TextInput`
Standard text input field.

| Prop | Type | Description |
|---|---|---|
| `label` | string | Field label |
| `placeholder` | string | Placeholder text |
| `error` | string | Error message |
| `value` | string | Controlled value |
| `onChange` | (v: string) => void | Change handler |

---

### `PasswordInput`
Text input with show/hide toggle.

| Prop | Type | Description |
|---|---|---|
| `label` | string | Field label |
| `error` | string | Error message |

---

### `Textarea`
Multi-line text input (used for assignment submission).

| Prop | Type | Description |
|---|---|---|
| `label` | string | Field label |
| `rows` | number | Visible rows |
| `maxLength` | number | Character limit |

---

### `Select`
Dropdown select input.

| Prop | Type | Description |
|---|---|---|
| `label` | string | Field label |
| `options` | `{ label: string, value: string }[]` | Options |
| `value` | string | Selected value |
| `onChange` | (v: string) => void | Change handler |

---

### `SearchInput`
Search bar with icon and clear button.

| Prop | Type | Description |
|---|---|---|
| `placeholder` | string | Placeholder |
| `value` | string | Controlled value |
| `onChange` | (v: string) => void | Change handler |
| `onClear` | () => void | Clear handler |

---

### `FileDropZone`
Drag-and-drop file upload area.

| Prop | Type | Description |
|---|---|---|
| `accept` | string[] | Accepted extensions |
| `maxSizeMB` | number | Max file size |
| `onFiles` | (files: File[]) => void | Files dropped handler |

---

### `URLInput`
Input for pasting problem URLs (Practice Tracker).

| Prop | Type | Description |
|---|---|---|
| `label` | string | Field label |
| `onSubmit` | (url: string) => void | Submit handler |
| `validate` | (url: string) => boolean | URL validation fn |

---

### `FormCard`
Wrapper card for form sections with title and submit button.

| Prop | Type | Description |
|---|---|---|
| `title` | string | Form title |
| `onSubmit` | () => void | Submit handler |
| `loading` | boolean | Submit in progress |
| `children` | ReactNode | Form fields |

---

## 5. Cards

### `StatCard`
Single metric display card (Dashboard).

| Prop | Type | Description |
|---|---|---|
| `label` | string | Metric label |
| `value` | string \| number | Metric value |
| `icon` | ReactNode | Icon |
| `trend` | `"up" \| "down" \| "neutral"` | Optional trend indicator |

---

### `NotebookCard`
Notebook list item card.

| Prop | Type | Description |
|---|---|---|
| `name` | string | Notebook name |
| `sourceCount` | number | Number of documents |
| `updatedAt` | string | Last updated date |
| `onClick` | () => void | Open notebook |
| `onDelete` | () => void | Delete handler |

---

### `CourseCard`
Course browse/enroll card.

| Prop | Type | Description |
|---|---|---|
| `title` | string | Course title |
| `description` | string | Short description |
| `thumbnail` | string | Thumbnail URL |
| `moduleCount` | number | Number of modules |
| `enrolled` | boolean | Enrolled state |
| `progress` | number | 0–100 progress |
| `onEnroll` | () => void | Enroll handler |

---

### `DocumentListItem`
Single document row inside notebook panel.

| Prop | Type | Description |
|---|---|---|
| `name` | string | File name |
| `format` | string | PDF / MD / TXT / GDOC |
| `status` | `"PROCESSING" \| "READY" \| "FAILED"` | Embedding status |
| `wordCount` | number | Word count |
| `onDelete` | () => void | Delete handler |

---

### `QuizCard`
Quiz list item with metadata.

| Prop | Type | Description |
|---|---|---|
| `title` | string | Quiz title |
| `questionCount` | number | Number of questions |
| `lastScore` | number | Last attempt score (%) |
| `createdAt` | string | Creation date |
| `onStart` | () => void | Start quiz handler |

---

### `AssignmentCard`
Assignment item card.

| Prop | Type | Description |
|---|---|---|
| `title` | string | Assignment title |
| `courseName` | string | Parent course name |
| `status` | `"PENDING" \| "GRADED"` | Submission status |
| `grade` | number | AI grade if graded |
| `onOpen` | () => void | Open handler |

---

### `WeakSpotCard`
Weak topic highlight card (Dashboard + Analytics).

| Prop | Type | Description |
|---|---|---|
| `topic` | string | Topic name |
| `wrongCount` | number | Consecutive wrong answers |
| `notebookName` | string | Source notebook |
| `onReview` | () => void | Start review session |

---

## 6. Modals & Dialogs

### `ConfirmModal`
Destructive action confirmation dialog.

| Prop | Type | Description |
|---|---|---|
| `open` | boolean | Visibility |
| `title` | string | Modal title |
| `message` | string | Confirmation message |
| `onConfirm` | () => void | Confirm handler |
| `onCancel` | () => void | Cancel handler |
| `danger` | boolean | Red confirm button |

---

### `FormModal`
Modal with a form inside (Create Notebook, Create List, etc.).

| Prop | Type | Description |
|---|---|---|
| `open` | boolean | Visibility |
| `title` | string | Modal title |
| `onClose` | () => void | Close handler |
| `onSubmit` | () => void | Submit handler |
| `loading` | boolean | Submit in progress |
| `children` | ReactNode | Form fields |

---

### `SourceModal`
Expandable panel showing RAG source chunks.

| Prop | Type | Description |
|---|---|---|
| `sources` | `{ documentId, sourceName, chunk }[]` | Source list |
| `open` | boolean | Visibility |
| `onClose` | () => void | Close handler |

---

### `NodeInfoPanel`
Skill tree node detail panel (slide-in from right).

| Prop | Type | Description |
|---|---|---|
| `node` | SkillNode | Node data |
| `open` | boolean | Visibility |
| `onClose` | () => void | Close handler |
| `onStart` | () => void | "Start Learning" handler |

---

## 7. Tables

### `DataTable`
Generic sortable/filterable table.

| Prop | Type | Description |
|---|---|---|
| `columns` | Column[] | Column definitions |
| `data` | Row[] | Row data |
| `loading` | boolean | Loading state |
| `emptyMessage` | string | Empty state text |
| `onRowClick` | (row: Row) => void | Row click handler |

---

### `PracticeTable`
Practice problem list with inline status edit.

| Prop | Type | Description |
|---|---|---|
| `items` | PracticeItem[] | Problem items |
| `onStatusChange` | (id, status) => void | Status update handler |
| `onDelete` | (id: string) => void | Delete handler |

---

### `SubmissionsTable`
Assignment submission history (Tutor/Admin view).

| Prop | Type | Description |
|---|---|---|
| `submissions` | Submission[] | Submission records |
| `onView` | (id: string) => void | View detail handler |

---

## 8. Charts

### `LineChart`
Score trend over time (Analytics Dashboard).

| Prop | Type | Description |
|---|---|---|
| `data` | `{ date: string, value: number }[]` | Time series data |
| `xLabel` | string | X axis label |
| `yLabel` | string | Y axis label |
| `color` | string | Line color |

---

### `BarChart`
Time-on-topic or comparison chart.

| Prop | Type | Description |
|---|---|---|
| `data` | `{ label: string, value: number }[]` | Bar data |
| `horizontal` | boolean | Horizontal bar layout |
| `color` | string | Bar fill color |

---

### `WeeklyXPChart`
7-day XP bar chart (Dashboard).

| Prop | Type | Description |
|---|---|---|
| `data` | number[] | XP per day (7 values) |
| `labels` | string[] | Day labels |

---

### `ScoreDonut`
Circular donut chart for a single percentage score.

| Prop | Type | Description |
|---|---|---|
| `value` | number | 0–100 |
| `label` | string | Center label |
| `color` | string | Arc color |

---

## 9. Badges & Tags

### `RoleBadge`
User role indicator.

| Variant | Color |
|---|---|
| STUDENT | Blue |
| TUTOR | Green |
| ADMIN | Purple |

---

### `DifficultyBadge`
LeetCode-style difficulty indicator.

| Variant | Color |
|---|---|
| EASY | Green |
| MEDIUM | Yellow |
| HARD | Red |

---

### `StatusBadge`
Generic status badge for documents, submissions, etc.

| Variant | Examples |
|---|---|
| `success` | READY, GRADED, SOLVED |
| `warning` | PROCESSING, ATTEMPTED |
| `error` | FAILED |
| `neutral` | PENDING, UNSOLVED |

---

### `FormatBadge`
Document format indicator.

| Values | PDF, MD, TXT, GDOC, GSLIDE |

---

### `XPBadge`
XP gain indicator shown after an activity.

| Prop | Type | Description |
|---|---|---|
| `amount` | number | XP amount (e.g. +50 XP) |

---

### `BadgeIcon`
Gamification badge display tile.

| Prop | Type | Description |
|---|---|---|
| `name` | string | Badge name |
| `icon` | string | Icon URL or emoji |
| `earned` | boolean | Earned or locked |
| `earnedAt` | string | Earned date |

---

## 10. Quiz Components

### `QuestionCard`
Single question display card.

| Prop | Type | Description |
|---|---|---|
| `question` | string | Question text |
| `type` | `"MCQ" \| "FILL" \| "SHORT"` | Question type |
| `options` | string[] | MCQ options (if MCQ) |
| `onAnswer` | (answer: string) => void | Answer handler |

---

### `OptionButton`
MCQ answer option button.

| Prop | Type | Description |
|---|---|---|
| `label` | string | Option label (A/B/C/D) |
| `text` | string | Option text |
| `selected` | boolean | Selected state |
| `correct` | boolean | Show correct after submit |
| `wrong` | boolean | Show wrong after submit |
| `onClick` | () => void | Select handler |

---

### `QuizTimer`
Countdown timer display.

| Prop | Type | Description |
|---|---|---|
| `seconds` | number | Remaining seconds |
| `onExpire` | () => void | Timer expired callback |
| `warning` | boolean | Red state when low |

---

### `QuizResultSummary`
Score summary shown after submission.

| Prop | Type | Description |
|---|---|---|
| `score` | number | Score percentage |
| `correct` | number | Correct answer count |
| `total` | number | Total questions |
| `wrongTopics` | string[] | Flagged weak topics |
| `onRetry` | () => void | Retry handler |

---

### `QuizProgressBar`
Question-by-question progress indicator.

| Prop | Type | Description |
|---|---|---|
| `current` | number | Current question index |
| `total` | number | Total questions |
| `answered` | boolean[] | Answered state per question |

---

## 11. Flashcard Components

### `FlashCard`
Flip card with question/answer sides.

| Prop | Type | Description |
|---|---|---|
| `question` | string | Front face text |
| `answer` | string | Back face text |
| `flipped` | boolean | Flip state |
| `onFlip` | () => void | Flip handler |

**Behaviour:** 3D CSS flip animation on click.

---

### `FlashCardDeck`
Session wrapper showing card count + due info.

| Prop | Type | Description |
|---|---|---|
| `total` | number | Total cards due |
| `current` | number | Current card index |
| `onComplete` | () => void | Session complete handler |

---

### `ReviewRatingBar`
Four-button rating row (SM-2 scale).

| Prop | Type | Description |
|---|---|---|
| `onRate` | (rating: 1\|2\|3\|4) => void | Rating handler |
| `nextReview` | string | Shown after rating |

---

## 12. Skill Tree Components

### `SkillNode`
Individual node in the skill tree DAG.

| Prop | Type | Description |
|---|---|---|
| `label` | string | Topic label |
| `state` | `"locked" \| "inProgress" \| "unlocked"` | Node state |
| `onClick` | () => void | Select handler |

**Visual states:**
- `locked` — grey dashed border, lock icon
- `inProgress` — blue border, progress ring
- `unlocked` — filled, checkmark

---

### `SkillEdge`
Directed arrow connecting two skill nodes.

| Prop | Type | Description |
|---|---|---|
| `from` | string | Source node ID |
| `to` | string | Target node ID |
| `active` | boolean | Highlighted if unlocked path |

---

### `SkillTreeCanvas`
Full DAG canvas container with pan/zoom.

| Prop | Type | Description |
|---|---|---|
| `nodes` | SkillNode[] | All nodes |
| `edges` | SkillEdge[] | All edges |
| `onNodeClick` | (id: string) => void | Node click handler |

---

## 13. Gamification Components

### `XPBar`
Horizontal XP progress bar with level label.

| Prop | Type | Description |
|---|---|---|
| `xp` | number | Current XP |
| `nextMilestone` | number | XP for next level |
| `level` | number | Current level |

---

### `StreakDisplay`
Daily streak counter with flame icon.

| Prop | Type | Description |
|---|---|---|
| `streak` | number | Current streak count |
| `active` | boolean | Activity done today |

---

### `BadgeGrid`
Gallery of badges (earned + locked).

| Prop | Type | Description |
|---|---|---|
| `badges` | Badge[] | All badges |
| `earnedIds` | string[] | Earned badge IDs |

---

### `LeaderboardRow`
Single row in leaderboard table.

| Prop | Type | Description |
|---|---|---|
| `rank` | number | Position |
| `name` | string | Username |
| `avatar` | string | Avatar URL |
| `xp` | number | XP total |
| `isCurrentUser` | boolean | Highlight self |

---

### `ChallengeCard`
Active or pending quiz challenge card.

| Prop | Type | Description |
|---|---|---|
| `challenger` | string | Challenger name |
| `opponent` | string | Opponent name |
| `status` | `"PENDING" \| "ACTIVE" \| "COMPLETED"` | Challenge state |
| `winnerId` | string | Winner if completed |
| `onJoin` | () => void | Join handler |

---

## 14. Feedback & State

### `Toast`
Non-blocking notification pop-up.

| Variant | Usage |
|---|---|
| `success` | Action completed |
| `error` | Request failed |
| `info` | Neutral information |
| `warning` | Caution alert |

| Prop | Type | Description |
|---|---|---|
| `message` | string | Notification text |
| `duration` | number | Auto-dismiss ms |

---

### `LoadingSpinner`
Centered loading indicator.

| Prop | Type | Description |
|---|---|---|
| `size` | `"sm" \| "md" \| "lg"` | Spinner size |
| `label` | string | Optional loading text |

---

### `EmptyState`
Placeholder when a list or section has no data.

| Prop | Type | Description |
|---|---|---|
| `icon` | ReactNode | Illustration or icon |
| `title` | string | Empty state title |
| `message` | string | Descriptive message |
| `action` | ReactNode | Optional CTA button |

---

### `ErrorState`
Error placeholder for failed data fetches.

| Prop | Type | Description |
|---|---|---|
| `message` | string | Error description |
| `onRetry` | () => void | Retry handler |

---

### `SkeletonLoader`
Placeholder shimmer for loading content.

| Variant | Usage |
|---|---|
| `card` | Card placeholder |
| `list` | List item placeholder |
| `text` | Text block placeholder |
| `chart` | Chart area placeholder |

---

## 15. Chat / RAG Components

### `ChatBubble`
Single message in the RAG chat panel.

| Prop | Type | Description |
|---|---|---|
| `role` | `"user" \| "ai"` | Message sender |
| `content` | string | Message text |
| `sources` | Source[] | Attached source chunks |
| `timestamp` | string | Message time |

---

### `SourceChip`
Inline source reference chip shown below AI answers.

| Prop | Type | Description |
|---|---|---|
| `sourceName` | string | Document name |
| `chunk` | string | Chunk preview text |
| `onClick` | () => void | Expand full chunk |

---

### `ChatInput`
Message input bar at bottom of RAG chat.

| Prop | Type | Description |
|---|---|---|
| `value` | string | Controlled input value |
| `onChange` | (v: string) => void | Change handler |
| `onSend` | () => void | Send message handler |
| `loading` | boolean | AI response pending |
| `placeholder` | string | Input placeholder |

---

*Last Updated: 2026-05-24 | Total Components: 73 | Stack: React 19 + Tailwind CSS v4*

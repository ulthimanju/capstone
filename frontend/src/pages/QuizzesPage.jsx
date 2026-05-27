import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import OptionButton from '../components/quiz/OptionButton';
import QuizProgressBar from '../components/quiz/QuizProgressBar';
import QuizTimer from '../components/quiz/QuizTimer';
import QuizResultSummary from '../components/quiz/QuizResultSummary';

const api = {
  getNotebooks: () => axiosClient.get('/api/notebooks').then((r) => r.data),
  getQuizzes: (nbId) => axiosClient.get('/api/quizzes', { params: { notebookId: nbId } }).then((r) => r.data),
  generateQuiz: (nbId, count, types, title) =>
    axiosClient.post('/api/quizzes/generate', { notebookId: nbId, count, types, title }).then((r) => r.data),
  getQuizAttempts: (quizId) => axiosClient.get('/api/quizzes/attempts', { params: { quizId } }).then((r) => r.data),
  getAllQuizAttempts: () => axiosClient.get('/api/quizzes/attempts').then((r) => r.data),
  attemptQuiz: (quizId, answers) => axiosClient.post(`/api/quizzes/${quizId}/attempt`, { answers }).then((r) => r.data),
  getWeakSpots: () => axiosClient.get('/api/quizzes/weak-spots').then((r) => r.data),
};

/* Spinner component */
function Spinner({ size = 'sm' }) {
  const s = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  return (
    <svg className={`animate-spin text-brand ${s}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

/* Format date utility */
function fmtDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function QuizzesPage() {
  const queryClient = useQueryClient();
  const [selectedNb, setSelectedNb] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'history'

  // Quiz generation configuration
  const [qCount, setQCount] = useState(5);
  const [qTypes, setQTypes] = useState(['MCQ', 'FILL', 'SHORT']);
  const [quizTitle, setQuizTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Active quiz-taking states
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // questionId -> answer text
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes default
  const [isQuizActive, setIsQuizActive] = useState(false);

  // Attempt results states
  const [attemptResult, setAttemptResult] = useState(null);

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

  /* ── Query all quizzes for selected notebook ── */
  const { data: quizzes = [], isLoading: quizzesLoading } = useQuery({
    queryKey: ['quizzes', selectedNb?.id],
    queryFn: () => api.getQuizzes(selectedNb.id),
    enabled: !!selectedNb,
  });

  /* ── Query active weak spots globally ── */
  const { data: weakSpots = [], isLoading: weakSpotsLoading } = useQuery({
    queryKey: ['weak-spots'],
    queryFn: api.getWeakSpots,
  });

  /* ── Query all attempts globally ── */
  const { data: allAttempts = [], isLoading: attemptsLoading } = useQuery({
    queryKey: ['quizzes-attempts-all'],
    queryFn: api.getAllQuizAttempts,
  });

  /* ── Timer countdown effect ── */
  useEffect(() => {
    if (!isQuizActive || timeLeft <= 0) {
      if (isQuizActive && timeLeft <= 0) {
        handleAutoSubmit();
      }
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isQuizActive, timeLeft]);

  const handleGenerate = async () => {
    if (!selectedNb) return;
    setIsGenerating(true);
    try {
      const generated = await api.generateQuiz(
        selectedNb.id,
        qCount,
        qTypes,
        quizTitle.trim() || `Quiz on ${selectedNb.title}`
      );
      queryClient.invalidateQueries({ queryKey: ['quizzes', selectedNb.id] });
      startQuizSession(generated);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate quiz. Make sure documents are uploaded and READY.');
    } finally {
      setIsGenerating(false);
    }
  };

  const startQuizSession = (quiz) => {
    setActiveQuiz(quiz);
    setAnswers({});
    setCurrentQIndex(0);
    setTimeLeft(quiz.questions.length * 60); // 60 seconds per question
    setIsQuizActive(true);
    setAttemptResult(null);
  };

  const handleSelectOption = (questionId, option) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const handleTextAnswer = (questionId, text) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: text,
    }));
  };

  const handleAutoSubmit = () => {
    alert("Time's up! Submitting your attempt automatically.");
    handleSubmitAttempt();
  };

  const handleSubmitAttempt = async () => {
    if (!activeQuiz) return;
    setIsQuizActive(false);

    // Format answers map to payload list
    const formattedAnswers = activeQuiz.questions.map((q) => ({
      questionId: q.id,
      answer: answers[q.id] || '',
    }));

    try {
      const res = await api.attemptQuiz(activeQuiz.id, formattedAnswers);
      setAttemptResult(res);
      queryClient.invalidateQueries({ queryKey: ['quizzes-attempts-all'] });
      queryClient.invalidateQueries({ queryKey: ['weak-spots'] });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit quiz attempt.');
    }
  };

  const exitQuiz = () => {
    setActiveQuiz(null);
    setIsQuizActive(false);
    setAttemptResult(null);
    setActiveTab('dashboard');
  };

  const handleToggleType = (type) => {
    setQTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  return (
    <div className="flex flex-col h-full overflow-hidden p-6 space-y-6">
      {/* Upper header block */}
      {!isQuizActive && !attemptResult && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Quizzes</h1>
            <p className="text-sm text-text-muted mt-1">Test your knowledge and review weak spot topics with AI</p>
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
      )}

      {/* ── Active Quiz Session Screen ── */}
      {isQuizActive && activeQuiz && (
        <div className="flex-grow flex flex-col justify-center items-center overflow-y-auto">
          <div className="max-w-xl w-full bg-surface border border-border rounded-lg p-6 space-y-6 shadow-xl animate-scale-up">
            {/* Session Header */}
            <div className="flex justify-between items-center shrink-0 border-b border-border/60 pb-3">
              <div>
                <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
                  {activeQuiz.title}
                </h2>
                <span className="text-xs text-text-disabled mt-1 block">
                  Question {currentQIndex + 1} of {activeQuiz.questions.length}
                </span>
              </div>
              <QuizTimer seconds={timeLeft} />
            </div>

            {/* Progress Bar */}
            <QuizProgressBar
              total={activeQuiz.questions.length}
              current={currentQIndex}
              answered={Object.keys(answers).map((id) =>
                activeQuiz.questions.findIndex((q) => q.id === id)
              )}
            />

            {/* Question Panel */}
            <div className="space-y-4">
              <div className="bg-surface-elevated border border-border/50 rounded-lg p-4">
                <span className="text-xs font-semibold text-brand bg-brand-muted px-2 py-0.5 rounded-full inline-block mb-2">
                  {activeQuiz.questions[currentQIndex].topic}
                </span>
                <p className="text-base text-text-primary leading-relaxed font-medium">
                  {activeQuiz.questions[currentQIndex].question}
                </p>
              </div>

              {/* Answers Inputs */}
              {activeQuiz.questions[currentQIndex].type === 'MCQ' && (
                <div className="grid grid-cols-1 gap-2.5">
                  {activeQuiz.questions[currentQIndex].options.map((opt, i) => (
                    <OptionButton
                      key={i}
                      label={opt}
                      index={i}
                      selected={answers[activeQuiz.questions[currentQIndex].id] === opt}
                      onClick={() => handleSelectOption(activeQuiz.questions[currentQIndex].id, opt)}
                    />
                  ))}
                </div>
              )}

              {activeQuiz.questions[currentQIndex].type === 'FILL' && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-muted">Type your answer:</label>
                  <input
                    type="text"
                    value={answers[activeQuiz.questions[currentQIndex].id] || ''}
                    onChange={(e) => handleTextAnswer(activeQuiz.questions[currentQIndex].id, e.target.value)}
                    placeholder="e.g. attention, encoder, gradient..."
                    className="w-full h-10 px-3 rounded-md text-sm bg-surface-elevated border border-border text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
                  />
                </div>
              )}

              {activeQuiz.questions[currentQIndex].type === 'SHORT' && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-muted">Type your response:</label>
                  <textarea
                    value={answers[activeQuiz.questions[currentQIndex].id] || ''}
                    onChange={(e) => handleTextAnswer(activeQuiz.questions[currentQIndex].id, e.target.value)}
                    rows={4}
                    placeholder="Provide a concise 1-2 sentence explanation…"
                    className="w-full p-3 rounded-md text-sm bg-surface-elevated border border-border text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand resize-none"
                  />
                </div>
              )}
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between items-center border-t border-border/60 pt-4 shrink-0">
              <button
                type="button"
                onClick={() => setCurrentQIndex((i) => Math.max(0, i - 1))}
                disabled={currentQIndex === 0}
                className="px-4 py-2 border border-border rounded-md text-sm text-text-muted hover:text-text-primary hover:bg-surface-elevated disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Previous
              </button>

              {currentQIndex < activeQuiz.questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentQIndex((i) => i + 1)}
                  className="px-4 py-2 bg-brand hover:bg-brand-hover text-bg rounded-md text-sm font-semibold cursor-pointer transition-colors"
                >
                  Next Question
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitAttempt}
                  className="px-5 py-2 bg-success hover:bg-success-hover text-white rounded-md text-sm font-semibold cursor-pointer transition-colors"
                >
                  Submit Quiz
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Quiz Results Summary Screen ── */}
      {attemptResult && (
        <div className="flex-grow flex flex-col justify-center items-center overflow-y-auto">
          <div className="max-w-2xl w-full bg-surface border border-border rounded-lg p-6 space-y-6 shadow-xl animate-scale-up">
            <h2 className="text-xl font-bold text-text-primary text-center">Quiz Completed</h2>

            {/* Donut Score & Stats */}
            <QuizResultSummary
              score={parseFloat(attemptResult.score)}
              totalQuestions={attemptResult.totalQuestions}
              correctCount={attemptResult.correctQuestions}
              wrongTopics={attemptResult.feedback.filter(f => !f.correct).map(f => f.topic)}
            />

            {/* Question Feedback Accordion */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-text-primary">Detailed Review:</h3>
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                {attemptResult.feedback.map((f, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 space-y-3 ${
                      f.correct ? 'bg-success-muted/10 border-success/30' : 'bg-danger-muted/10 border-danger/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        f.correct ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
                      }`}>
                        {f.correct ? 'CORRECT' : 'INCORRECT'}
                      </span>
                      <span className="text-xs text-text-disabled font-mono">Topic: {f.topic}</span>
                    </div>

                    <p className="text-sm font-medium text-text-primary leading-normal">{f.question}</p>

                    {/* Show options highlighting for MCQ */}
                    {f.type === 'MCQ' && (
                      <div className="grid grid-cols-1 gap-2 pt-1">
                        {f.options.map((opt, optIdx) => {
                          const isUserSel = f.userAnswer === opt;
                          const isCorrect = f.correctAnswer === opt;
                          
                          let optCorrectState = null;
                          if (isCorrect) optCorrectState = true;
                          else if (isUserSel && !isCorrect) optCorrectState = false;

                          return (
                            <OptionButton
                              key={optIdx}
                              label={opt}
                              index={optIdx}
                              selected={isUserSel}
                              correct={optCorrectState}
                              disabled={true}
                            />
                          );
                        })}
                      </div>
                    )}

                    {/* Text values for FILL / SHORT */}
                    {f.type !== 'MCQ' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs border-t border-border/40 pt-2 font-mono">
                        <div>
                          <span className="text-text-disabled">Your answer:</span>
                          <p className={`font-semibold ${f.correct ? 'text-success' : 'text-danger'}`}>{f.userAnswer || '[No Answer Provided]'}</p>
                        </div>
                        <div>
                          <span className="text-text-disabled">Correct answer:</span>
                          <p className="font-semibold text-brand">{f.correctAnswer}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Back button */}
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={exitQuiz}
                className="px-6 py-2.5 bg-brand hover:bg-brand-hover text-bg rounded-md text-sm font-semibold cursor-pointer transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Assessment Dashboard ── */}
      {!isQuizActive && !attemptResult && selectedNb && (
        <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0">
          {/* Dashboard Left Pane — Weak spots & generate quiz */}
          <div className="flex-1 flex flex-col min-h-0 bg-surface rounded-lg border border-border p-6 space-y-6 overflow-y-auto">
            {/* Header Tabs */}
            <div className="flex border-b border-border bg-surface-sidebar -m-6 mb-2 p-1 gap-2 shrink-0">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 cursor-pointer transition-colors duration-100 ${
                  activeTab === 'dashboard' ? 'border-brand text-brand' : 'border-transparent text-text-muted hover:text-text-primary'
                }`}
              >
                Quiz Generator
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 cursor-pointer transition-colors duration-100 ${
                  activeTab === 'history' ? 'border-brand text-brand' : 'border-transparent text-text-muted hover:text-text-primary'
                }`}
              >
                Attempt History
              </button>
            </div>

            {isGenerating && (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <Spinner size="md" />
                <p className="text-sm text-text-muted animate-pulse">
                  Questly AI is reading your documents and creating customized quiz questions…
                </p>
              </div>
            )}

            {!isGenerating && activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Custom quiz generation configurator */}
                <div className="bg-surface-elevated border border-border p-5 rounded-lg space-y-4">
                  <h3 className="text-sm font-semibold text-text-primary">Configure AI Study Quiz</h3>
                  
                  <div className="space-y-3">
                    {/* Title */}
                    <div>
                      <label className="block text-xs font-semibold text-text-muted mb-1.5">Quiz Title (Optional)</label>
                      <input
                        type="text"
                        value={quizTitle}
                        onChange={(e) => setQuizTitle(e.target.value)}
                        placeholder="e.g. Attention Layers Master Quiz…"
                        className="w-full h-9 px-3 rounded-md text-sm bg-surface border border-border text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Count */}
                      <div>
                        <label className="block text-xs font-semibold text-text-muted mb-1.5">Number of Questions</label>
                        <select
                          value={qCount}
                          onChange={(e) => setQCount(parseInt(e.target.value))}
                          className="w-full h-9 px-2 rounded-md text-sm bg-surface border border-border text-text-primary focus:outline-none focus:ring-1 focus:ring-brand cursor-pointer"
                        >
                          <option value="3">3 Questions</option>
                          <option value="5">5 Questions</option>
                          <option value="10">10 Questions</option>
                          <option value="15">15 Questions</option>
                        </select>
                      </div>

                      {/* Question types */}
                      <div>
                        <label className="block text-xs font-semibold text-text-muted mb-1.5">Question Types</label>
                        <div className="flex flex-wrap gap-2 pt-0.5">
                          {['MCQ', 'FILL', 'SHORT'].map((type) => {
                            const active = qTypes.includes(type);
                            return (
                              <button
                                key={type}
                                type="button"
                                onClick={() => handleToggleType(type)}
                                className={`px-3 py-1.5 rounded-md text-xs font-semibold border cursor-pointer transition-colors duration-150 ${
                                  active
                                    ? 'bg-brand/10 border-brand text-brand font-bold'
                                    : 'bg-surface border-border text-text-muted hover:text-text-primary hover:border-text-muted'
                                }`}
                              >
                                {type}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border/50 pt-4 flex justify-end shrink-0">
                    <button
                      onClick={handleGenerate}
                      disabled={qTypes.length === 0}
                      className="px-5 py-2 bg-brand hover:bg-brand-hover text-bg text-sm font-semibold rounded-md cursor-pointer transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      Start AI Quiz
                    </button>
                  </div>
                </div>

                {/* Pre-generated Quizzes list */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-text-primary">Available Quizzes ({quizzes.length})</h3>
                  {quizzesLoading ? (
                    <div className="flex justify-center py-4"><Spinner /></div>
                  ) : quizzes.length === 0 ? (
                    <p className="text-xs text-text-disabled text-center py-6">No custom quizzes generated yet for this notebook.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {quizzes.map((q) => (
                        <div key={q.id} className="bg-surface-elevated border border-border p-4 rounded-lg flex flex-col justify-between space-y-4 hover:border-brand/40 transition-colors">
                          <div>
                            <h4 className="text-sm font-medium text-text-primary truncate">{q.title}</h4>
                            <span className="text-xs text-text-disabled block mt-1">
                              {q.questions.length} questions · {fmtDate(q.createdAt)}
                            </span>
                          </div>
                          <div className="flex justify-end">
                            <button
                              onClick={() => startQuizSession(q)}
                              className="px-3.5 py-1.5 bg-brand text-bg text-xs font-bold rounded-md hover:bg-brand-hover cursor-pointer transition-colors"
                            >
                              Take Quiz
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {!isGenerating && activeTab === 'history' && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-text-primary">Attempt History</h3>
                {attemptsLoading ? (
                  <div className="flex justify-center py-10"><Spinner size="md" /></div>
                ) : allAttempts.length === 0 ? (
                  <p className="text-xs text-text-disabled text-center py-10">No quizzes attempted yet.</p>
                ) : (
                  <div className="border border-border rounded-lg overflow-hidden shrink-0">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-surface-sidebar text-text-muted uppercase border-b border-border font-semibold">
                        <tr>
                          <th className="p-3">Quiz ID</th>
                          <th className="p-3">Score</th>
                          <th className="p-3">Total Qs</th>
                          <th className="p-3 text-right">Completed At</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border text-text-muted">
                        {allAttempts.map((att) => (
                          <tr key={att.id} className="hover:bg-surface-elevated transition-colors">
                            <td className="p-3 font-mono truncate max-w-[120px]">{att.quizId}</td>
                            <td className={`p-3 font-bold ${
                              parseFloat(att.score) >= 70 ? 'text-success' : parseFloat(att.score) >= 50 ? 'text-warning' : 'text-danger'
                            }`}>
                              {att.score}%
                            </td>
                            <td className="p-3">{att.totalQuestions}</td>
                            <td className="p-3 text-right">{fmtDate(att.completedAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Dashboard Right Pane — Weak spots list */}
          <div className="bg-surface border border-border rounded-lg p-6 w-full md:w-[260px] shrink-0 flex flex-col h-full overflow-hidden">
            <h3 className="text-sm font-semibold text-text-primary shrink-0 border-b border-border/60 pb-2 mb-3">
              Active Weak Spots
            </h3>
            <div className="flex-grow overflow-y-auto space-y-3">
              {weakSpotsLoading ? (
                <div className="flex justify-center py-6"><Spinner /></div>
              ) : weakSpots.length === 0 ? (
                <div className="text-center py-10 space-y-2 shrink-0">
                  <div className="w-10 h-10 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0110 21a3.745 3.745 0 01-3.068-1.593 3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                    </svg>
                  </div>
                  <p className="text-xs font-semibold text-text-primary">No Weak Spots!</p>
                  <p className="text-[10px] text-text-disabled leading-normal">Awesome work. You have mastered all study concepts.</p>
                </div>
              ) : (
                weakSpots.map((ws) => (
                  <div key={ws.id} className="bg-surface-elevated border border-danger/25 p-3 rounded-lg flex flex-col space-y-1 hover:border-danger/45 transition-colors shrink-0">
                    <span className="text-xs font-semibold text-text-primary truncate">{ws.topic}</span>
                    <div className="flex items-center justify-between text-[10px] text-text-disabled pt-1 border-t border-border/40 shrink-0">
                      <span className="text-danger font-medium font-mono">Errors: {ws.wrongCount}</span>
                      <span>Streak: {ws.correctStreak}/2</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

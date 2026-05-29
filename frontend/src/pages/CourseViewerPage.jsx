import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import axiosClient from '../api/axiosClient';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';

export default function CourseViewerPage() {
  const { id: courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [activeTab, setActiveTab] = useState('lessons'); // 'lessons' or 'assignments'
  
  // Submission states
  const [submissionsMap, setSubmissionsMap] = useState({});
  const [submittingMap, setSubmittingMap] = useState({});
  const [submissionTextMap, setSubmissionTextMap] = useState({});
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Polling ref for grading
  const pollingIntervals = useRef({});

  const startPolling = (assignmentId) => {
    if (pollingIntervals.current[assignmentId]) return;

    const interval = setInterval(async () => {
      try {
        const { data: subData } = await axiosClient.get(`/api/assignments/${assignmentId}/submission`);
        setSubmissionsMap(prev => ({
          ...prev,
          [assignmentId]: subData
        }));

        if (subData && subData.status !== 'PENDING') {
          clearInterval(pollingIntervals.current[assignmentId]);
          delete pollingIntervals.current[assignmentId];
        }
      } catch (e) {
        console.error('Polling assignment submission failed', e);
      }
    }, 4000);

    pollingIntervals.current[assignmentId] = interval;
  };

  useEffect(() => {
    async function loadCourseData() {
      try {
        setLoading(true);
        // Load course details
        const { data: courseData } = await axiosClient.get(`/api/courses/${courseId}`);
        setCourse(courseData);

        // Load progress
        const { data: progressData } = await axiosClient.get(`/api/courses/${courseId}/progress`);
        setProgress(progressData);

        // Load first unlocked module by default if available
        if (courseData.modules && courseData.modules.length > 0) {
          const unlockedSet = new Set(progressData.unlockedModules || []);
          const firstUnlocked = courseData.modules.find(m => unlockedSet.has(m.id)) || courseData.modules[0];
          setSelectedModule(firstUnlocked);
        }

        // Load course assignments
        try {
          const { data: allAssignments } = await axiosClient.get('/api/assignments');
          const courseAssignments = (allAssignments || []).filter(a => a.courseId === courseId);
          setAssignments(courseAssignments);

          // Fetch submissions for these assignments
          const subMap = {};
          await Promise.all(
            courseAssignments.map(async (asg) => {
              try {
                const { data: subData } = await axiosClient.get(`/api/assignments/${asg.id}/submission`);
                subMap[asg.id] = subData;
                // If PENDING, start polling
                if (subData && subData.status === 'PENDING') {
                  startPolling(asg.id);
                }
              } catch (e) {
                // No submission yet
                subMap[asg.id] = null;
              }
            })
          );
          setSubmissionsMap(subMap);
        } catch (e) {
          console.error('Failed to load assignments or submissions', e);
        }

      } catch (err) {
        console.error('Failed to load course details', err);
        setError('Failed to load course content. Make sure you are enrolled.');
      } finally {
        setLoading(false);
      }
    }

    loadCourseData();

    // Cleanup polling on unmount
    return () => {
      Object.values(pollingIntervals.current).forEach(clearInterval);
    };
  }, [courseId]);

  const handleCompleteModule = async (moduleId) => {
    try {
      const { data: updatedProgress } = await axiosClient.post(`/api/courses/${courseId}/modules/${moduleId}/complete`);
      setProgress(updatedProgress);
      
      // Update course modules lists with drip unlocked modules if any
      const { data: courseData } = await axiosClient.get(`/api/courses/${courseId}`);
      setCourse(courseData);

      alert('Module marked as complete! Next modules unlocked.');
    } catch (err) {
      console.error('Failed to complete module', err);
      alert('Error completing module. Try again.');
    }
  };

  const handleSubmitAssignment = async (assignmentId) => {
    const text = submissionTextMap[assignmentId];
    if (!text || !text.trim()) {
      alert('Please enter your solution before submitting.');
      return;
    }

    try {
      setSubmittingMap(prev => ({ ...prev, [assignmentId]: true }));
      const { data: subData } = await axiosClient.post(`/api/assignments/${assignmentId}/submit`, {
        content: text,
        filePath: 'online_editor.txt'
      });

      setSubmissionsMap(prev => ({
        ...prev,
        [assignmentId]: subData
      }));

      // Start real-time polling to wait for AI Auto-grading
      startPolling(assignmentId);

    } catch (err) {
      console.error('Submission failed', err);
      alert('Failed to submit assignment. Make sure details are valid.');
    } finally {
      setSubmittingMap(prev => ({ ...prev, [assignmentId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] text-center px-4">
        <span className="text-4xl mb-4">⚠️</span>
        <h2 className="text-xl font-bold text-text-primary">{error || 'Course Not Found'}</h2>
        <Button onClick={() => navigate('/courses')} variant="primary" className="mt-4">
          Back to Catalog
        </Button>
      </div>
    );
  }

  const unlockedModulesSet = new Set(progress?.unlockedModules || []);

  return (
    <div className="h-[calc(100vh-64px)] flex overflow-hidden">
      {/* ── Left Sidebar: Sequential Gated Modules ── */}
      <aside className="w-80 border-r border-border bg-surface-sidebar flex flex-col justify-between overflow-y-auto">
        <div>
          {/* Header */}
          <div className="p-6 border-b border-border/80">
            <button
              onClick={() => navigate('/courses')}
              className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-primary mb-3 font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              All Courses
            </button>
            <h2 className="text-base font-bold text-text-primary truncate">{course.title}</h2>
            <div className="flex items-center justify-between text-xs text-text-muted mt-2">
              <span>Overview Progress</span>
              <span className="font-semibold text-text-primary">{Math.round(progress?.progress || 0)}%</span>
            </div>
            <div className="w-full bg-border rounded-full h-1.5 mt-1.5 overflow-hidden">
              <div
                className="bg-brand h-full rounded-full transition-all duration-300"
                style={{ width: `${progress?.progress || 0}%` }}
              />
            </div>
          </div>

          {/* Tab Selection */}
          <div className="flex border-b border-border text-center">
            <button
              onClick={() => setActiveTab('lessons')}
              className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 ${
                activeTab === 'lessons'
                  ? 'border-brand text-brand bg-brand-muted/20'
                  : 'border-transparent text-text-muted hover:text-text-primary'
              }`}
            >
              📖 Lesson Modules
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 ${
                activeTab === 'assignments'
                  ? 'border-brand text-brand bg-brand-muted/20'
                  : 'border-transparent text-text-muted hover:text-text-primary'
              }`}
            >
              📝 Course Projects ({assignments.length})
            </button>
          </div>

          {/* Module items */}
          <div className="p-4 space-y-2">
            {activeTab === 'lessons' ? (
              course.modules?.map((mod, index) => {
                const isUnlocked = unlockedModulesSet.has(mod.id);
                const isSelected = selectedModule?.id === mod.id;

                return (
                  <button
                    key={mod.id}
                    disabled={!isUnlocked}
                    onClick={() => setSelectedModule(mod)}
                    className={`w-full text-left p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
                      isSelected
                        ? 'bg-brand-muted border-brand text-text-primary shadow-[0_2px_12px_rgba(59,130,246,0.06)]'
                        : isUnlocked
                        ? 'bg-surface border-border hover:border-border-hover text-text-primary hover:bg-surface-elevated'
                        : 'bg-surface/30 border-border/40 text-text-disabled cursor-not-allowed'
                    }`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {isUnlocked ? (
                        <div className="w-5 h-5 rounded-full border-2 border-brand/60 flex items-center justify-center text-[10px] text-brand font-bold">
                          {index + 1}
                        </div>
                      ) : (
                        <svg className="w-4 h-4 text-text-disabled" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      )}
                    </div>

                    <div className="overflow-hidden">
                      <p className="text-xs font-bold truncate leading-snug">{mod.title}</p>
                      <p className="text-[10px] text-text-muted mt-0.5 truncate">
                        {isUnlocked ? 'Unlocked & Ready' : 'Prerequisites incomplete'}
                      </p>
                    </div>
                  </button>
                );
              })
            ) : (
              assignments.map((asg, index) => {
                const sub = submissionsMap[asg.id];
                return (
                  <button
                    key={asg.id}
                    onClick={() => {
                      setActiveTab('lessons');
                      // Find first module as fallback
                      if (course.modules && course.modules.length > 0) {
                        setSelectedModule(course.modules[0]);
                      }
                    }}
                    className="w-full text-left p-3.5 rounded-xl border border-border bg-surface hover:bg-surface-elevated flex items-start gap-3 transition-all"
                  >
                    <span className="text-lg">📁</span>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold truncate leading-snug">{asg.title}</p>
                      {sub ? (
                        <span className={`inline-flex items-center text-[10px] font-semibold mt-1 px-2 py-0.5 rounded-full ${
                          sub.status === 'GRADED'
                            ? 'bg-success-muted text-success border border-success/20'
                            : 'bg-warning-muted text-warning border border-warning/20'
                        }`}>
                          {sub.status === 'GRADED' ? `Graded: ${sub.aiGrade}%` : 'AI Review Pending'}
                        </span>
                      ) : (
                        <span className="text-[10px] text-text-muted">Not submitted yet</span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </aside>

      {/* ── Right Panel: Lesson Content & Submissions Drawer ── */}
      <main className="flex-1 bg-bg overflow-y-auto flex flex-col">
        {selectedModule ? (
          <div className="flex-1 max-w-4xl mx-auto w-full p-8 md:p-12 flex flex-col justify-between h-full">
            {/* Core Module Text */}
            <article>
              <div className="flex items-center justify-between border-b border-border/80 pb-6 mb-8">
                <div>
                  <span className="text-xs text-brand font-semibold uppercase tracking-wider">Lesson Console</span>
                  <h1 className="text-2xl font-extrabold text-text-primary mt-1">{selectedModule.title}</h1>
                </div>

                <Button
                  onClick={() => handleCompleteModule(selectedModule.id)}
                  variant="primary"
                  className="bg-brand hover:bg-brand-hover text-bg text-xs font-extrabold px-5 py-2.5 shadow-[0_2px_12px_rgba(59,130,246,0.2)]"
                >
                  ✓ Complete & Continue
                </Button>
              </div>

              {/* Lesson body section */}
              <div className="prose prose-invert max-w-none text-text-primary leading-relaxed text-sm space-y-6">
                {selectedModule.content ? (
                  <div dangerouslySetInnerHTML={{ __html: selectedModule.content }} />
                ) : (
                  <p className="text-text-muted italic">This module contains practical challenges. Work on the core project files or read assignments details below.</p>
                )}
              </div>
            </article>

            {/* Assignments Submission Panel */}
            <div className="mt-12 pt-8 border-t border-border/80">
              <h2 className="text-lg font-extrabold text-text-primary mb-4 flex items-center gap-2">
                <span>📝</span> AI Auto-Graded Assignments
              </h2>

              {assignments.length === 0 ? (
                <div className="p-6 bg-surface/40 rounded-xl border border-border text-center">
                  <p className="text-xs text-text-muted italic">No grading project is set for this course yet.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {assignments.map((asg) => {
                    const sub = submissionsMap[asg.id];
                    const submitting = submittingMap[asg.id] || false;
                    const val = submissionTextMap[asg.id] || '';

                    return (
                      <div key={asg.id} className="bg-surface rounded-2xl border border-border p-6 shadow-card">
                        <h3 className="text-sm font-extrabold text-text-primary">{asg.title}</h3>
                        <p className="text-xs text-text-muted mt-1 leading-relaxed">{asg.description}</p>
                        
                        {/* Rubric section */}
                        <div className="mt-3.5 bg-surface-elevated/40 border border-border/50 rounded-xl p-3 text-xs leading-relaxed">
                          <span className="font-bold text-text-muted block mb-1">Evaluation Rubric:</span>
                          <span className="text-text-muted text-[11px] font-mono whitespace-pre-wrap">{asg.rubric}</span>
                        </div>

                        {/* Submission interactive element */}
                        <div className="mt-6">
                          <label className="block text-xs font-bold text-text-muted mb-2">Write Your Code/Response Solution:</label>
                          <textarea
                            disabled={submitting || (sub && sub.status === 'PENDING')}
                            value={val}
                            onChange={(e) => setSubmissionTextMap(prev => ({ ...prev, [asg.id]: e.target.value }))}
                            placeholder="// Enter your solution description, explanation or code submission..."
                            rows={6}
                            className="w-full bg-surface-elevated border border-border focus:border-brand rounded-xl p-4 text-xs font-mono text-text-primary focus:outline-none transition-all resize-y"
                          />
                          
                          <div className="mt-4 flex items-center justify-between">
                            <Button
                              disabled={submitting || (sub && sub.status === 'PENDING')}
                              onClick={() => handleSubmitAssignment(asg.id)}
                              variant="primary"
                              className="text-xs font-extrabold px-5 bg-brand hover:bg-brand-hover text-bg flex items-center gap-1.5 shadow-[0_2px_10px_rgba(59,130,246,0.15)]"
                            >
                              {submitting ? 'Submitting...' : 'Submit to AI Tutor'}
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                              </svg>
                            </Button>

                            {sub && (
                              <span className={`inline-flex items-center text-xs font-bold px-3 py-1 rounded-full ${
                                sub.status === 'GRADED'
                                  ? 'bg-success-muted text-success border border-success/20 animate-fade-in'
                                  : 'bg-warning-muted text-warning border border-warning/20 animate-pulse-brand'
                              }`}>
                                {sub.status === 'GRADED' ? `✓ Auto-Graded Score: ${sub.aiGrade}/100` : '⚡ AI Autograder Reviewing...'}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Grading feedback Accordion panel */}
                        {sub && sub.status === 'GRADED' && (
                          <div className="mt-6 pt-5 border-t border-border bg-brand-muted/10 rounded-2xl p-5 border border-brand/20 animate-fade-in">
                            <h4 className="text-xs font-extrabold text-brand flex items-center gap-1.5">
                              <span>🤖</span> AI Tutor Review Feedback:
                            </h4>
                            <div className="text-xs text-text-primary mt-2 leading-relaxed whitespace-pre-wrap font-sans bg-surface-elevated/40 p-4 border border-border/80 rounded-xl">
                              {sub.aiFeedback}
                            </div>
                            <div className="text-[10px] text-text-muted mt-3 text-right">
                              Graded at: {new Date(sub.gradedAt).toLocaleString()}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <span className="text-4xl mb-3">📘</span>
            <h2 className="text-lg font-bold text-text-primary">Welcome to the Course Viewer</h2>
            <p className="text-xs text-text-muted mt-1">Select an active module from the sidebar catalog to begin.</p>
          </div>
        )}
      </main>
    </div>
  );
}

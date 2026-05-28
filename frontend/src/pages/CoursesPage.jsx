import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import axiosClient from '../api/axiosClient';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch all courses
        const { data: allCourses } = await axiosClient.get('/api/courses');
        setCourses(allCourses || []);

        // Fetch enrolled courses
        const { data: enrolledCourses } = await axiosClient.get('/api/courses/enrolled');
        const enrolledSet = new Set((enrolledCourses || []).map(c => c.id));
        setEnrolledIds(enrolledSet);

        // Fetch progress for enrolled courses
        const progressPromises = (enrolledCourses || []).map(async (c) => {
          try {
            const { data: progressData } = await axiosClient.get(`/api/courses/${c.id}/progress`);
            return { courseId: c.id, progress: progressData.progress };
          } catch (e) {
            console.error(`Failed to fetch progress for course ${c.id}`, e);
            return { courseId: c.id, progress: 0 };
          }
        });

        const progressResults = await Promise.all(progressPromises);
        const newProgressMap = {};
        progressResults.forEach(res => {
          newProgressMap[res.courseId] = res.progress;
        });
        setProgressMap(newProgressMap);
      } catch (err) {
        console.error('Failed to load courses', err);
        setError('Failed to fetch courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleEnroll = async (courseId) => {
    try {
      await axiosClient.post(`/api/courses/${courseId}/enroll`);
      setEnrolledIds(prev => {
        const next = new Set(prev);
        next.add(courseId);
        return next;
      });
      setProgressMap(prev => ({
        ...prev,
        [courseId]: 0
      }));
      // Instantly open the course viewer
      navigate(`/courses/${courseId}`);
    } catch (err) {
      console.error('Failed to enroll', err);
      alert('Could not enroll in the course. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-24 text-center">
        <p className="text-danger text-lg font-medium">{error}</p>
        <Button onClick={() => window.location.reload()} variant="primary" className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header section with rich dark-themed dashboard style */}
      <div className="mb-10 text-left">
        <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">🎓 Learning Catalog</h1>
        <p className="text-text-muted mt-2 max-w-xl">
          Level up your core coding capabilities with sequential curriculums, interactive lesson modules, and automated AI code review grading feedback.
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-surface rounded-2xl border border-border text-center">
          <span className="text-4xl">📚</span>
          <h2 className="text-xl font-semibold text-text-primary mt-4">No Courses Available</h2>
          <p className="text-text-muted text-sm mt-1">Please check back later or seed courses from backend services.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const isEnrolled = enrolledIds.has(course.id);
            const progress = progressMap[course.id] || 0;

            return (
              <div
                key={course.id}
                className="group relative bg-surface border border-border hover:border-brand/40 hover:bg-surface-elevated rounded-2xl p-6 shadow-card hover:shadow-[0_4px_20px_rgba(59,130,246,0.08)] flex flex-col justify-between transition-all duration-300 overflow-hidden"
              >
                {/* Visual accent top line */}
                <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-brand/50 to-accent-purple/50 group-hover:from-brand group-hover:to-accent-purple transition-all duration-300" />
                
                <div>
                  <div className="flex items-center justify-between mb-4">
                    {/* Level / Duration Badge */}
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-muted text-brand border border-brand/20">
                      Module Core
                    </span>
                    {isEnrolled && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success-muted text-brand border border-brand/20">
                        Enrolled
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-text-primary group-hover:text-brand transition-colors duration-200">
                    {course.title}
                  </h3>
                  <p className="text-text-muted text-xs line-clamp-3 mt-2 h-12 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border/60">
                  {isEnrolled ? (
                    <div className="space-y-4">
                      {/* Course progress bar */}
                      <div>
                        <div className="flex items-center justify-between text-xs font-medium text-text-muted mb-1.5">
                          <span>Course Progress</span>
                          <span className="text-text-primary font-bold">{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-border rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-brand h-full rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      <Button
                        onClick={() => navigate(`/courses/${course.id}`)}
                        variant="primary"
                        className="w-full justify-center text-xs font-bold bg-brand hover:bg-brand-hover text-bg flex items-center gap-1.5 shadow-[0_2px_10px_rgba(59,130,246,0.2)]"
                      >
                        Resume Learning
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                        </svg>
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleEnroll(course.id)}
                      variant="secondary"
                      className="w-full justify-center text-xs font-bold border border-border group-hover:border-brand/40 text-text-primary hover:bg-brand hover:text-bg hover:border-brand"
                    >
                      Enroll & Start
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

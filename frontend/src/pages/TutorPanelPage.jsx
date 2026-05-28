import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/Button';
import TextInput from '../components/ui/TextInput';
import Textarea from '../components/ui/Textarea';
import StatusBadge from '../components/ui/StatusBadge';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function TutorPanelPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Rubric evaluator mock states
  const [selectedStudent, setSelectedStudent] = useState('John Doe');
  const [assignmentScore, setAssignmentScore] = useState(85);
  const [feedback, setFeedback] = useState('Excellent critical analysis of algorithmic complexity. Ensure you write clean code in all helper methods next time.');

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosClient.get('/api/courses');
      setCourses(res.data || []);
    } catch (err) {
      console.error('Failed to load courses:', err);
      setError('Could not fetch course lists.');
    } finally {
      setLoading(false);
    }
  }

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Course title is required.');
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      const payload = {
        title,
        description,
        thumbnail: thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3',
        published: isPublished
      };

      await axiosClient.post('/api/courses', payload);
      setSuccess('Course created successfully!');
      setTitle('');
      setDescription('');
      setThumbnail('');
      setIsPublished(false);
      fetchCourses();
    } catch (err) {
      console.error('Failed to create course:', err);
      setError(err.response?.data?.message || 'Error occurred while saving course.');
    }
  };

  const handleGradeSubmit = () => {
    alert(`Successfully committed grade (${assignmentScore}/100) and feedback for ${selectedStudent}!`);
  };

  return (
    <div className="space-y-8 max-w-7xl">
      <PageHeader
        title="Tutor Curriculum Workspace 👨‍🏫"
        subtitle="Manage curricula progression, review student assignments, and evaluate rubrics."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Course Management & Creation Form */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-surface border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-extrabold text-text-primary tracking-tight">Active Curricula</h2>
              <p className="text-xs text-text-muted">Manage available drip-locked study paths and modules</p>
            </div>

            {loading && courses.length === 0 ? (
              <div className="flex justify-center py-8"><LoadingSpinner size="md" /></div>
            ) : error && courses.length === 0 ? (
              <p className="text-xs text-danger">{error}</p>
            ) : courses.length === 0 ? (
              <p className="text-xs text-text-muted italic">No courses have been defined yet.</p>
            ) : (
              <div className="overflow-hidden border border-border rounded-xl">
                <table className="min-w-full divide-y divide-border text-sm text-left">
                  <thead className="bg-surface-sidebar text-text-muted text-xs font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Course Title</th>
                      <th className="px-4 py-3">Modules Count</th>
                      <th className="px-4 py-3">Publish State</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-surface">
                    {courses.map((course) => (
                      <tr key={course.id} className="hover:bg-surface-sidebar/50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-text-primary">{course.title}</td>
                        <td className="px-4 py-3 text-text-muted">{course.modules?.length || 0} Modules</td>
                        <td className="px-4 py-3">
                          <StatusBadge 
                            variant={course.published || course.isPublished ? 'success' : 'warning'} 
                            label={course.published || course.isPublished ? 'Published' : 'Draft'} 
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="sm" onClick={() => window.location.href = `/courses/${course.id}`}>
                            Edit Modules
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Rubric Evaluator Mockup */}
          <section className="bg-surface border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-extrabold text-text-primary tracking-tight">AI-Assisted Rubric Evaluator</h2>
              <p className="text-xs text-text-muted">Grade student coding submissions using customized AI parameters</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Select Student Submission</label>
                  <select 
                    value={selectedStudent} 
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="w-full h-9 px-3 rounded-md text-sm bg-surface border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-focus-glow"
                  >
                    <option value="John Doe">John Doe — Assignment 1: Basic Programming</option>
                    <option value="Jane Smith">Jane Smith — Assignment 2: Graphs & Trees</option>
                    <option value="Bob Johnson">Bob Johnson — Assignment 1: Basic Programming</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Grade Score ({assignmentScore}/100)</label>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={assignmentScore} 
                    onChange={(e) => setAssignmentScore(Number(e.target.value))}
                    className="w-full h-9 accent-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Curator Evaluation Feedback</label>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Enter constructive tutor grading notes..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleGradeSubmit} variant="primary">
                  Commit Grade & Feedback
                </Button>
              </div>
            </div>
          </section>
        </div>

        {/* Right Side: Create New Course Builder Form */}
        <div>
          <section className="bg-surface border border-border p-6 rounded-2xl shadow-sm space-y-5">
            <div>
              <h2 className="text-base font-extrabold text-text-primary tracking-tight">Create New Course</h2>
              <p className="text-xs text-text-muted">Draft a new sequential study curriculum pathway</p>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4">
              {success && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-xs font-semibold">
                  ✓ {success}
                </div>
              )}
              {error && (
                <div className="p-3 bg-danger/10 border border-danger/20 text-danger rounded-xl text-xs font-semibold">
                  ⚠️ {error}
                </div>
              )}

              <TextInput
                label="Course Title"
                placeholder="e.g. Introduction to Graph Theory"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <Textarea
                label="Description"
                placeholder="Detail what students will learn in this path..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />

              <TextInput
                label="Thumbnail Image URL (Optional)"
                placeholder="https://images.unsplash.com/..."
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
              />

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="published"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-brand focus:ring-brand accent-brand bg-surface cursor-pointer"
                />
                <label htmlFor="published" className="text-xs text-text-primary font-medium cursor-pointer selection:bg-none">
                  Publish instantly (visible to all students)
                </label>
              </div>

              <Button type="submit" variant="primary" className="w-full">
                Create Course Template
              </Button>
            </form>
          </section>
        </div>

      </div>
    </div>
  );
}

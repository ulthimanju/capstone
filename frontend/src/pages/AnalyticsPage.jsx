import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import PageHeader from '../components/layout/PageHeader';
import ContentGrid from '../components/layout/ContentGrid';
import StatCard from '../components/cards/StatCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import axiosClient from '../api/axiosClient';

/**
 * AnalyticsPage — High-fidelity student analytics dashboard
 * rendering score progression and time spent per topic using Recharts.
 */
export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [topics, setTopics] = useState([]);
  const [scores, setScores] = useState([]);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        const [dashRes, topicsRes, scoresRes] = await Promise.all([
          axiosClient.get('/api/analytics/dashboard'),
          axiosClient.get('/api/analytics/topics'),
          axiosClient.get('/api/analytics/scores')
        ]);
        setDashboard(dashRes.data);
        setTopics(topicsRes.data || []);
        setScores(scoresRes.data || []);
      } catch (err) {
        console.error('Failed to load student analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Formatting helpers
  const formatTime = (secs) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const chartColorPalette = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6 max-w-7xl">
      <PageHeader
        title="Study Analytics & Insights 📊"
        subtitle="Track your daily study time, average performance scores, and topics mastery"
      />

      {/* Aggregated Totals Grid */}
      <ContentGrid cols={1} mdCols={2} lgCols={4} gap={4}>
        <StatCard
          icon={<svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>}
          value={formatTime(dashboard?.studyTimeSecs || 0)}
          label="Total Study Time"
        />
        <StatCard
          icon={<svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2Z" /></svg>}
          value={dashboard?.quizzesTaken || 0}
          label="Quizzes Completed"
        />
        <StatCard
          icon={<svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" /></svg>}
          value={`${dashboard?.avgScore || 0}%`}
          label="Average Performance"
        />
        <StatCard
          icon={<svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" /></svg>}
          value={dashboard?.problemsSolved || 0}
          label="Practice Items Solved"
        />
      </ContentGrid>

      {/* Main Charts Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Side: Score Trend (Area Chart) */}
        <section className="bg-surface border border-border p-6 rounded-md shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-semibold text-text-primary">Performance Trend</h2>
            <p className="text-xs text-text-muted">Dynamic average quiz scores plotted chronologically</p>
          </div>
          <div className="h-72 w-full">
            {scores.length === 0 ? (
              <div className="flex items-center justify-center h-full text-text-muted text-sm border border-dashed border-border rounded-md">
                Complete study quizzes to populate performance trends
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={scores} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="date" stroke="#888" tickLine={false} style={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} stroke="#888" tickLine={false} style={{ fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#2e2e2e', color: '#fff', borderRadius: '4px' }}
                    labelFormatter={(label) => `Date: ${label}`}
                    formatter={(value) => [`${value}%`, 'Average Score']}
                  />
                  <Area type="monotone" dataKey="avgScore" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#scoreColor)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        {/* Right Side: Time spent per Topic (Bar Chart) */}
        <section className="bg-surface border border-border p-6 rounded-md shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-semibold text-text-primary">Time Spent per Topic</h2>
            <p className="text-xs text-text-muted">Total accumulated study time in minutes per learning segment</p>
          </div>
          <div className="h-72 w-full">
            {topics.length === 0 ? (
              <div className="flex items-center justify-center h-full text-text-muted text-sm border border-dashed border-border rounded-md">
                No topic duration statistics recorded yet. Spend time reviewing flashcards or answering quizzes!
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={topics.map(t => ({ ...t, minutes: Math.round(t.studyTimeSecs / 60) }))} 
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="topic" stroke="#888" tickLine={false} style={{ fontSize: 11 }} />
                  <YAxis stroke="#888" tickLine={false} style={{ fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#2e2e2e', color: '#fff', borderRadius: '4px' }}
                    formatter={(value) => [`${value} minutes`, 'Duration']}
                  />
                  <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
                    {topics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={chartColorPalette[index % chartColorPalette.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

      </div>

      {/* Advanced Topic breakdown list */}
      <section className="bg-surface border border-border rounded-md p-6 shadow-sm">
        <h2 className="text-base font-semibold text-text-primary mb-4">Topic Mastery Breakdown</h2>
        {topics.length === 0 ? (
          <p className="text-text-muted text-sm">No topics mastered yet. Finish course modules or solve practice issues!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border text-sm text-left">
              <thead>
                <tr className="text-text-muted">
                  <th className="pb-3 font-medium">Topic Name</th>
                  <th className="pb-3 font-medium">Accumulated Duration</th>
                  <th className="pb-3 font-medium text-right">Average Quiz Accuracy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {topics.map((topic, idx) => (
                  <tr key={idx} className="hover:bg-surface-elevated transition-colors duration-100">
                    <td className="py-3 text-text-primary font-medium">{topic.topic}</td>
                    <td className="py-3 text-text-muted">{formatTime(topic.studyTimeSecs)}</td>
                    <td className="py-3 text-right font-medium">
                      {topic.avgScore != null ? (
                        <span className={`px-2 py-0.5 rounded-sm text-xs font-semibold ${
                          topic.avgScore >= 80.0 
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                            : topic.avgScore >= 50.0 
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            : 'bg-red-500/10 text-red-500 border border-red-500/20'
                        }`}>
                          {topic.avgScore}%
                        </span>
                      ) : (
                        <span className="text-text-disabled">Not assessed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

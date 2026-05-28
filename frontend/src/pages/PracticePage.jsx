import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';

export default function PracticePage() {
  const [lists, setLists] = useState([]);
  const [selectedListId, setSelectedListId] = useState(null);
  const [selectedListDetails, setSelectedListDetails] = useState(null);
  const [stats, setStats] = useState({
    totalProblems: 0,
    solved: 0,
    attempted: 0,
    unsolved: 0
  });

  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Forms states
  const [newListName, setNewListName] = useState('');
  const [newListPlatform, setNewListPlatform] = useState('LeetCode');
  
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemUrl, setNewItemUrl] = useState('');
  const [newItemDifficulty, setNewItemDifficulty] = useState('EASY');

  // UI overlays
  const [showAddList, setShowAddList] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);

  const fetchStatsAndLists = async () => {
    try {
      setLoading(true);
      const { data: statsData } = await axiosClient.get('/api/practice/stats');
      setStats(statsData);

      const { data: listData } = await axiosClient.get('/api/practice/lists');
      setLists(listData || []);

      if (listData && listData.length > 0 && !selectedListId) {
        setSelectedListId(listData[0].id);
      }
    } catch (e) {
      console.error('Failed to fetch practice details', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatsAndLists();
  }, []);

  useEffect(() => {
    if (!selectedListId) {
      setSelectedListDetails(null);
      return;
    }
    
    async function loadListDetails() {
      try {
        setDetailsLoading(true);
        const { data: details } = await axiosClient.get(`/api/practice/lists/${selectedListId}`);
        setSelectedListDetails(details);
      } catch (e) {
        console.error('Failed to load list items', e);
      } finally {
        setDetailsLoading(false);
      }
    }

    loadListDetails();
  }, [selectedListId]);

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    try {
      const { data: newList } = await axiosClient.post('/api/practice/lists', {
        name: newListName,
        platform: newListPlatform
      });

      setLists(prev => [...prev, newList]);
      setSelectedListId(newList.id);
      setNewListName('');
      setShowAddList(false);
      
      // Update stats
      const { data: statsData } = await axiosClient.get('/api/practice/stats');
      setStats(statsData);
    } catch (err) {
      console.error('Failed to create practice list', err);
      alert('Failed to create list.');
    }
  };

  const handleDeleteList = async (listId) => {
    if (!confirm('Are you sure you want to delete this list and all its problems?')) return;

    try {
      await axiosClient.delete(`/api/practice/lists/${listId}`);
      const nextLists = lists.filter(l => l.id !== listId);
      setLists(nextLists);
      if (selectedListId === listId) {
        setSelectedListId(nextLists.length > 0 ? nextLists[0].id : null);
      } else {
        // Just reload details
        setSelectedListId(selectedListId);
      }

      // Update stats
      const { data: statsData } = await axiosClient.get('/api/practice/stats');
      setStats(statsData);
    } catch (err) {
      console.error('Failed to delete list', err);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemTitle.trim() || !newItemUrl.trim()) return;

    try {
      const { data: item } = await axiosClient.post(`/api/practice/lists/${selectedListId}/items`, {
        title: newItemTitle,
        problemUrl: newItemUrl,
        difficulty: newItemDifficulty
      });

      setSelectedListDetails(prev => ({
        ...prev,
        items: [...(prev.items || []), item]
      }));

      setNewItemTitle('');
      setNewItemUrl('');
      setShowAddItem(false);

      // Refresh overall stats
      const { data: statsData } = await axiosClient.get('/api/practice/stats');
      setStats(statsData);
    } catch (err) {
      console.error('Failed to add item', err);
      alert('Failed to add coding problem.');
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await axiosClient.delete(`/api/practice/lists/${selectedListId}/items/${itemId}`);
      setSelectedListDetails(prev => ({
        ...prev,
        items: (prev.items || []).filter(item => item.id !== itemId)
      }));

      // Refresh overall stats
      const { data: statsData } = await axiosClient.get('/api/practice/stats');
      setStats(statsData);
    } catch (err) {
      console.error('Failed to remove item', err);
    }
  };

  const handleUpdateStatus = async (itemId, nextStatus) => {
    try {
      const { data: updatedItem } = await axiosClient.patch(
        `/api/practice/lists/${selectedListId}/items/${itemId}/status`,
        { status: nextStatus }
      );

      setSelectedListDetails(prev => ({
        ...prev,
        items: (prev.items || []).map(item => item.id === itemId ? updatedItem : item)
      }));

      // Refresh overall stats
      const { data: statsData } = await axiosClient.get('/api/practice/stats');
      setStats(statsData);
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-10 text-left">
        <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">💻 Practice Board</h1>
        <p className="text-text-muted mt-2 max-w-xl">
          Keep track of your coding placement preps (LeetCode, HackerRank, custom lists), solve challenges, and monitor statistics dynamically.
        </p>
      </div>

      {/* Stats Board Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
        <div className="bg-surface border border-border p-5 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-brand/50" />
          <span className="text-xs font-bold text-text-muted">Total Problems</span>
          <p className="text-2xl font-black text-text-primary mt-1">{stats.totalProblems}</p>
        </div>
        <div className="bg-surface border border-border p-5 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-brand/60" />
          <span className="text-xs font-bold text-text-muted">Solved</span>
          <p className="text-2xl font-black text-success mt-1">{stats.solved}</p>
        </div>
        <div className="bg-surface border border-border p-5 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-accent-purple" />
          <span className="text-xs font-bold text-text-muted">Attempted</span>
          <p className="text-2xl font-black text-accent-purple mt-1">{stats.attempted}</p>
        </div>
        <div className="bg-surface border border-border p-5 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-text-disabled" />
          <span className="text-xs font-bold text-text-muted">Unsolved</span>
          <p className="text-2xl font-black text-text-muted mt-1">{stats.unsolved}</p>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar: Lists Listing */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-text-primary uppercase tracking-wide">Practice Lists</h2>
            <button
              onClick={() => setShowAddList(!showAddList)}
              className="text-xs font-extrabold text-brand hover:text-brand-hover transition-colors flex items-center gap-1"
            >
              ➕ Add List
            </button>
          </div>

          {/* Form to Create List */}
          {showAddList && (
            <form onSubmit={handleCreateList} className="bg-surface border border-brand/20 p-4 rounded-xl space-y-3 animate-fade-in">
              <div>
                <label className="block text-[10px] font-bold text-text-muted mb-1 uppercase">List Title</label>
                <input
                  type="text"
                  required
                  placeholder="LeetCode 75, Core DS..."
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  className="w-full bg-surface-elevated border border-border focus:border-brand rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-muted mb-1 uppercase">Platform</label>
                <select
                  value={newListPlatform}
                  onChange={(e) => setNewListPlatform(e.target.value)}
                  className="w-full bg-surface-elevated border border-border focus:border-brand rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none"
                >
                  <option value="LeetCode">LeetCode</option>
                  <option value="HackerRank">HackerRank</option>
                  <option value="CodeForces">CodeForces</option>
                  <option value="Custom">Custom Platform</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" onClick={() => setShowAddList(false)} variant="secondary" className="px-3 py-1 text-[10px]">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="px-3 py-1 text-[10px] bg-brand text-bg">
                  Create
                </Button>
              </div>
            </form>
          )}

          {lists.length === 0 ? (
            <p className="text-xs text-text-muted italic">No lists created. Add one above to begin tracker!</p>
          ) : (
            <div className="space-y-1.5">
              {lists.map((list) => {
                const isSelected = selectedListId === list.id;
                return (
                  <div
                    key={list.id}
                    className={`group w-full flex items-center justify-between p-3.5 rounded-xl border text-xs transition-all ${
                      isSelected
                        ? 'bg-brand-muted border-brand text-text-primary'
                        : 'bg-surface border-border hover:border-border-hover hover:bg-surface-elevated text-text-muted hover:text-text-primary'
                    }`}
                  >
                    <button
                      onClick={() => setSelectedListId(list.id)}
                      className="flex-1 text-left font-bold truncate pr-2 flex items-center gap-1.5"
                    >
                      <span>📂</span>
                      <span className="truncate">{list.name}</span>
                    </button>
                    <button
                      onClick={() => handleDeleteList(list.id)}
                      className="opacity-0 group-hover:opacity-100 text-danger hover:text-red-400 font-extrabold text-[10px] transition-opacity"
                    >
                      Delete
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Dashboard Area: Problems Ledger */}
        <div className="lg:col-span-3">
          {selectedListDetails ? (
            <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 shadow-card space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
                <div>
                  <h2 className="text-xl font-extrabold text-text-primary flex items-center gap-2">
                    <span>📚</span> {selectedListDetails.name}
                  </h2>
                  <p className="text-xs text-text-muted mt-1 font-medium">Platform: {selectedListDetails.platform}</p>
                </div>

                <Button
                  onClick={() => setShowAddItem(!showAddItem)}
                  variant="primary"
                  className="text-xs font-bold px-4 py-2 bg-brand hover:bg-brand-hover text-bg flex items-center gap-1.5"
                >
                  ➕ Add Coding Problem
                </Button>
              </div>

              {/* Form to Add Problem Item */}
              {showAddItem && (
                <form onSubmit={handleAddItem} className="bg-surface-elevated border border-border p-5 rounded-xl space-y-4 animate-fade-in max-w-xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-text-muted mb-1 uppercase">Problem Title</label>
                      <input
                        type="text"
                        required
                        placeholder="Two Sum, Reverse Linked List..."
                        value={newItemTitle}
                        onChange={(e) => setNewItemTitle(e.target.value)}
                        className="w-full bg-surface border border-border focus:border-brand rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-text-muted mb-1 uppercase">Difficulty</label>
                      <select
                        value={newItemDifficulty}
                        onChange={(e) => setNewItemDifficulty(e.target.value)}
                        className="w-full bg-surface border border-border focus:border-brand rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none"
                      >
                        <option value="EASY">EASY</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HARD">HARD</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-text-muted mb-1 uppercase">Problem Link (URL)</label>
                    <input
                      type="url"
                      required
                      placeholder="https://leetcode.com/problems/..."
                      value={newItemUrl}
                      onChange={(e) => setNewItemUrl(e.target.value)}
                      className="w-full bg-surface border border-border focus:border-brand rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button type="button" onClick={() => setShowAddItem(false)} variant="secondary" className="px-4 py-1.5 text-xs">
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" className="px-4 py-1.5 text-xs bg-brand text-bg">
                      Add Problem
                    </Button>
                  </div>
                </form>
              )}

              {/* Items Grid/List Details */}
              {detailsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size="md" />
                </div>
              ) : !selectedListDetails.items || selectedListDetails.items.length === 0 ? (
                <div className="py-20 text-center border border-dashed border-border rounded-xl">
                  <span className="text-3xl">💻</span>
                  <p className="text-xs text-text-muted mt-3 font-medium">This practice list is empty. Add your first problem above!</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-surface-elevated text-text-muted font-bold border-b border-border">
                        <th className="p-4">Coding Problem</th>
                        <th className="p-4">Difficulty</th>
                        <th className="p-4">Solve Status Tracker</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {selectedListDetails.items.map((item) => (
                        <tr key={item.id} className="hover:bg-surface-elevated/45 transition-colors">
                          <td className="p-4">
                            <a
                              href={item.problemUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold text-text-primary hover:text-brand hover:underline flex items-center gap-1.5"
                            >
                              {item.title}
                              <svg className="w-3.5 h-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                            <span className="text-[10px] text-text-muted mt-0.5 block truncate max-w-sm">{item.problemUrl}</span>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                              item.difficulty === 'EASY'
                                ? 'bg-success-muted text-success border-success/20'
                                : item.difficulty === 'MEDIUM'
                                ? 'bg-warning-muted text-warning border-warning/20'
                                : 'bg-danger-muted text-danger border-danger/20'
                            }`}>
                              {item.difficulty}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-1.5">
                              {['UNSOLVED', 'ATTEMPTED', 'SOLVED'].map((s) => {
                                const isActive = item.status === s;
                                return (
                                  <button
                                    key={s}
                                    onClick={() => handleUpdateStatus(item.id, s)}
                                    className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold transition-all border ${
                                      isActive
                                        ? s === 'SOLVED'
                                          ? 'bg-success text-bg border-success'
                                          : s === 'ATTEMPTED'
                                          ? 'bg-accent-purple text-bg border-accent-purple'
                                          : 'bg-text-disabled text-bg border-text-disabled'
                                        : 'bg-surface border-border text-text-muted hover:text-text-primary hover:border-border-hover'
                                    }`}
                                  >
                                    {s}
                                  </button>
                                );
                              })}
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-danger hover:text-red-400 font-extrabold text-[10px]"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 bg-surface border border-border rounded-2xl text-center">
              <span className="text-4xl mb-4">📘</span>
              <h3 className="text-base font-bold text-text-primary">No Active Practice List</h3>
              <p className="text-xs text-text-muted mt-1.5">Select an existing practice list from the sidebar or create a new one to begin tracking.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

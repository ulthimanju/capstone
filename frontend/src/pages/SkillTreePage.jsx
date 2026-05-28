import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import SkillTreeCanvas from '../components/skilltree/SkillTreeCanvas';

// Hardcoded seed coordinates matching our dynamic 5-node learning DAG hierarchy
const COORDINATE_MAP = {
  '11111111-1111-1111-1111-111111111111': { x: 80, y: 180, icon: '💻' }, // Node A: Basic Programming
  '22222222-2222-2222-2222-222222222222': { x: 280, y: 80, icon: '📊' },  // Node B: Data Structures
  '33333333-3333-3333-3333-333333333333': { x: 480, y: 80, icon: '🧮' },  // Node C: Algorithms
  '44444444-4444-4444-4444-444444444444': { x: 280, y: 280, icon: '🧠' }, // Node D: AI Basics
  '55555555-5555-5555-5555-555555555555': { x: 680, y: 180, icon: '🤖' }  // Node E: Machine Learning
};

export default function SkillTreePage() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [rawNodes, setRawNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSkillTree = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get('/api/gamification/skill-tree');
      const apiNodes = data.nodes || [];
      setRawNodes(apiNodes);

      // Map API nodes to the properties that <SkillTreeCanvas /> expects
      const canvasNodes = apiNodes.map(node => {
        const coords = COORDINATE_MAP[node.id] || { x: 100, y: 100, icon: '📘' };
        
        // Derive node status state
        let status = 'locked';
        if (node.completed) {
          status = 'unlocked'; // 'unlocked' shows checkmark
        } else if (node.unlocked) {
          status = 'in-progress'; // 'in-progress' shows progress ring
        }

        return {
          id: node.id,
          label: node.label,
          description: node.description,
          status: status,
          progress: node.completed ? 100 : (node.unlocked ? 50 : 0), // progress ring percentage
          x: coords.x,
          y: coords.y,
          icon: coords.icon
        };
      });

      // Build edges dynamically from prerequisites
      const derivedEdges = [];
      apiNodes.forEach(node => {
        if (node.prerequisites && node.prerequisites.length > 0) {
          node.prerequisites.forEach(prereqId => {
            // Find prerequisite node to see if it is unlocked/completed
            const prereqNode = apiNodes.find(n => n.id === prereqId);
            derivedEdges.push({
              from: prereqId,
              to: node.id,
              unlocked: prereqNode ? prereqNode.completed : false
            });
          });
        }
      });

      setNodes(canvasNodes);
      setEdges(derivedEdges);
    } catch (err) {
      console.error('Failed to load skill tree details', err);
      setError('Failed to fetch learning Skill Tree. Please check back later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkillTree();
  }, []);

  const handleNodeClick = (nodeId) => {
    const node = rawNodes.find(n => n.id === nodeId);
    if (node) {
      // Find prerequisite labels
      const prereqs = (node.prerequisites || []).map(pid => {
        const pNode = rawNodes.find(n => n.id === pid);
        return pNode ? pNode.label : 'Unknown Prerequisite';
      });

      // Derive canvas details
      const cNode = nodes.find(n => n.id === nodeId);

      setSelectedNode({
        ...node,
        icon: cNode?.icon,
        status: cNode?.status,
        prerequisiteLabels: prereqs
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] text-center">
        <p className="text-danger text-lg font-medium">{error}</p>
        <Button onClick={() => window.location.reload()} variant="primary" className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex overflow-hidden relative">
      {/* ── Left Content: Interactive SVG Canvas ── */}
      <div className="flex-1 p-6 flex flex-col justify-between">
        <div className="mb-4">
          <h1 className="text-2xl font-black text-text-primary tracking-tight">🏆 Master Skill Tree</h1>
          <p className="text-text-muted text-xs mt-1 max-w-lg leading-relaxed">
            Map out your personalized curriculum progression. Complete core milestones to drip unlock higher-level modules, interactive coding lists, and duels.
          </p>
        </div>

        {/* Mount Canvas component */}
        <div className="flex-1 bg-surface-sidebar border border-border rounded-2xl overflow-hidden relative">
          <SkillTreeCanvas
            nodes={nodes}
            edges={edges}
            onNodeClick={handleNodeClick}
            className="w-full h-full border-none rounded-none"
          />
        </div>
      </div>

      {/* ── Right Content: Detail Drawers Slide Overlay ── */}
      {selectedNode && (
        <aside className="w-80 border-l border-border bg-surface-sidebar p-6 flex flex-col justify-between overflow-y-auto animate-slide-in-right z-20">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
              <span className="text-2xl">{selectedNode.icon}</span>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-text-muted hover:text-text-primary text-xs font-bold transition-colors"
              >
                ✕ Close
              </button>
            </div>

            <h2 className="text-base font-extrabold text-text-primary">{selectedNode.label}</h2>
            
            {/* Status Badge */}
            <div className="mt-2.5">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                selectedNode.status === 'unlocked'
                  ? 'bg-success-muted text-success border-success/20'
                  : selectedNode.status === 'in-progress'
                  ? 'bg-brand-muted text-brand border-brand/20'
                  : 'bg-surface border-border text-text-disabled'
              }`}>
                {selectedNode.status === 'unlocked'
                  ? '✓ Unlocked & Mastered'
                  : selectedNode.status === 'in-progress'
                  ? '⚡ In Progress'
                  : '🔒 Locked'}
              </span>
            </div>

            <p className="text-xs text-text-muted mt-4 leading-relaxed bg-surface rounded-xl p-3.5 border border-border">
              {selectedNode.description || 'No description provided.'}
            </p>

            {/* Prerequisites */}
            <div className="mt-6">
              <span className="text-[10px] font-black text-text-muted uppercase tracking-wide">Prerequisite Requirements</span>
              {selectedNode.prerequisiteLabels.length === 0 ? (
                <p className="text-xs text-text-muted italic mt-1.5">No prerequisites. Instantly unlockable!</p>
              ) : (
                <ul className="space-y-1.5 mt-2">
                  {selectedNode.prerequisiteLabels.map((prereq, index) => (
                    <li key={index} className="flex items-center gap-2 text-xs text-text-primary font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                      {prereq}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-border mt-6">
            {selectedNode.status === 'unlocked' ? (
              <p className="text-[10px] text-success font-black uppercase text-center">✓ You have mastered this node!</p>
            ) : selectedNode.status === 'in-progress' ? (
              <p className="text-[10px] text-brand font-black uppercase text-center">⚡ Keep studying lessons to complete!</p>
            ) : (
              <p className="text-[10px] text-text-disabled font-black uppercase text-center">🔒 Satisfy prerequisites to unlock.</p>
            )}
          </div>
        </aside>
      )}
    </div>
  );
}

import { useCallback, useEffect, useMemo, useState } from 'react';
import DOMPurify from 'dompurify';
import TopNavbar from '../components/TopNavbar';
import Sidebar from '../components/Sidebar';
import CanvasBoard from '../components/CanvasBoard';
import NodeModal from '../components/NodeModal';
import { roadmapApi } from '../api/client';
import { createNode } from '../utils/nodeUtils';
import useAutoSave from '../hooks/useAutoSave';

const defaultRoadmap = {
  title: 'Interview Preparation',
  nodes: [
    createNode({ type: 'group', position: { x: 100, y: 100 }, title: 'DSA Group' }),
    createNode({ type: 'topic', position: { x: 420, y: 220 }, title: 'System Design' })
  ],
  connections: []
};

export default function App() {
  const [roadmap, setRoadmap] = useState(defaultRoadmap);
  const [activeNode, setActiveNode] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('group');
  const [savedState, setSavedState] = useState('Unsaved');
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const sanitizeNode = useCallback((node) => ({
    ...node,
    title: DOMPurify.sanitize(node.title || ''),
    summary: DOMPurify.sanitize(node.summary || ''),
    code: DOMPurify.sanitize(node.code || ''),
    output: DOMPurify.sanitize(node.output || ''),
    notes: DOMPurify.sanitize(node.notes || '')
  }), []);

  const loadRoadmap = useCallback(async () => {
    try {
      const { data } = await roadmapApi.getRoadmap();
      setRoadmap({
        title: data.title || 'Interview Preparation',
        nodes: data.nodes || [],
        connections: data.connections || []
      });
      setSavedState('Saved');
    } catch {
      setRoadmap(defaultRoadmap);
      setSavedState('Offline / Local default');
    }
  }, []);

  useEffect(() => {
    loadRoadmap();
  }, [loadRoadmap]);

  const saveRoadmap = useCallback(async () => {
    try {
      setSavedState('Saving...');
      await roadmapApi.saveRoadmap({
        title: roadmap.title,
        nodes: roadmap.nodes.map(sanitizeNode),
        connections: roadmap.connections
      });
      setSavedState('Saved');
    } catch {
      setSavedState('Save failed');
    }
  }, [roadmap, sanitizeNode]);

  useAutoSave(saveRoadmap, 5000, [roadmap.nodes, roadmap.connections, roadmap.title]);

  const highlightedNodeId = useMemo(() => {
    if (!searchTerm.trim()) return null;
    const found = roadmap.nodes.find((node) => node.title.toLowerCase().includes(searchTerm.toLowerCase()));
    return found?.id || null;
  }, [roadmap.nodes, searchTerm]);

  const progress = useMemo(() => {
    const total = roadmap.nodes.length;
    const completed = roadmap.nodes.filter((node) => node.isCompleted).length;
    const percent = total ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
  }, [roadmap.nodes]);

  const addNode = (type, parentId = null) => {
    const position = { x: 120 + Math.random() * 300, y: 120 + Math.random() * 300 };
    const node = createNode({ type, position, parentId });
    setRoadmap((prev) => ({
      ...prev,
      nodes: [...prev.nodes, node],
      connections: parentId ? [...prev.connections, { sourceId: parentId, targetId: node.id }] : prev.connections
    }));
    setSelectedNodeId(node.id);
    setSavedState('Unsaved');
  };

  const updateNode = (updated) => {
    if (!updated.title?.trim()) return;
    setRoadmap((prev) => ({
      ...prev,
      nodes: prev.nodes.map((node) => (node.id === updated.id ? { ...node, ...updated } : node))
    }));
    setActiveNode(updated);
    setSavedState('Unsaved');
  };

  const deleteNodeById = (nodeId) => {
    if (!nodeId) return;
    setRoadmap((prev) => ({
      ...prev,
      nodes: prev.nodes.filter((node) => node.id !== nodeId),
      connections: prev.connections.filter((edge) => edge.sourceId !== nodeId && edge.targetId !== nodeId)
    }));
    setActiveNode(null);
    setSelectedNodeId(null);
    setSavedState('Unsaved');
  };

  const deleteSelected = () => deleteNodeById(selectedNodeId);

  const handleImageUpload = async (nodeId, file) => {
    const formData = new FormData();
    formData.append('image', file);
    const { data } = await roadmapApi.uploadImage(nodeId, formData);
    updateNode(data);
  };

  const handleImageDelete = async (nodeId, imageName) => {
    const { data } = await roadmapApi.deleteImage(nodeId, imageName);
    updateNode(data);
  };

  const handleContextAction = (action, node) => {
    setSelectedNodeId(node.id);
    if (action === 'addChild') addNode('content', node.id);
    if (action === 'rename') setActiveNode(node);
    if (action === 'markComplete') updateNode({ ...node, isCompleted: !node.isCompleted });
    if (action === 'delete') deleteNodeById(node.id);
  };

  return (
    <div className="h-screen bg-slate-950 text-slate-100 flex flex-col">
      <TopNavbar onSave={saveRoadmap} savedState={savedState} darkMode={darkMode} onToggleTheme={() => setDarkMode((d) => !d)} />
      <div className="flex flex-1 min-h-0">
        <Sidebar
          onAdd={addNode}
          onDelete={deleteSelected}
          onResetView={loadRoadmap}
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          progress={progress}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
        />
        <CanvasBoard
          nodesData={roadmap.nodes}
          edgesData={roadmap.connections}
          onNodesChangeData={(nodes) => {
            setRoadmap((prev) => ({ ...prev, nodes }));
            setSavedState('Unsaved');
          }}
          onEdgesChangeData={(connections) => {
            setRoadmap((prev) => ({ ...prev, connections }));
            setSavedState('Unsaved');
          }}
          onNodeClick={(node) => {
            setSelectedNodeId(node.id);
            setActiveNode(node);
          }}
          highlightedNodeId={highlightedNodeId}
          focusNodeId={highlightedNodeId}
          onContextAction={handleContextAction}
        />
      </div>

      <NodeModal
        node={activeNode}
        onClose={() => setActiveNode(null)}
        onChange={updateNode}
        onImageUpload={handleImageUpload}
        onImageDelete={handleImageDelete}
      />
    </div>
  );
}

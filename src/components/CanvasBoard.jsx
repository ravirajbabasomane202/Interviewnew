import { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState
} from 'reactflow';
import 'reactflow/dist/style.css';
import { toFlowEdge, toFlowNode } from '../utils/nodeUtils';

export default function CanvasBoard({ nodesData, edgesData, onNodesChangeData, onEdgesChangeData, onNodeClick, highlightedNodeId, onContextAction }) {
  const initialNodes = useMemo(() => nodesData.map(toFlowNode), [nodesData]);
  const initialEdges = useMemo(() => edgesData.map(toFlowEdge), [edgesData]);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [menu, setMenu] = useState(null);

  const syncNodes = (updated) => {
    setNodes(updated);
    onNodesChangeData(updated.map((n) => ({ ...n.data, position: n.position })));
  };

  const handleNodesChange = useCallback((changes) => {
    onNodesChange(changes);
    setTimeout(() => {
      setNodes((current) => {
        onNodesChangeData(current.map((n) => ({ ...n.data, position: n.position })));
        return current;
      });
    }, 0);
  }, [onNodesChange, onNodesChangeData, setNodes]);

  const handleEdgesChange = useCallback((changes) => {
    onEdgesChange(changes);
    setTimeout(() => {
      setEdges((current) => {
        onEdgesChangeData(current.map((e) => ({ sourceId: e.source, targetId: e.target })));
        return current;
      });
    }, 0);
  }, [onEdgesChange, onEdgesChangeData, setEdges]);

  const onConnect = useCallback((params) => {
    setEdges((eds) => {
      const updated = addEdge({ ...params, type: 'smoothstep' }, eds);
      onEdgesChangeData(updated.map((e) => ({ sourceId: e.source, targetId: e.target })));
      return updated;
    });
  }, [onEdgesChangeData]);

  return (
    <div className="flex-1 relative" onClick={() => setMenu(null)}>
      <ReactFlow
        nodes={nodes.map((n) => ({ ...n, style: { borderColor: n.id === highlightedNodeId ? '#f59e0b' : undefined } }))}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => onNodeClick(node.data)}
        onNodeContextMenu={(event, node) => {
          event.preventDefault();
          setMenu({ x: event.clientX, y: event.clientY, node });
        }}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>

      {menu && (
        <div className="absolute z-10 bg-slate-900 border border-slate-700 rounded-lg p-1 text-sm" style={{ top: menu.y, left: menu.x }}>
          <button className="block px-3 py-1 hover:bg-slate-800 w-full text-left" onClick={() => onContextAction('addChild', menu.node.data)}>Add child</button>
          <button className="block px-3 py-1 hover:bg-slate-800 w-full text-left" onClick={() => onContextAction('rename', menu.node.data)}>Rename</button>
          <button className="block px-3 py-1 hover:bg-slate-800 w-full text-left" onClick={() => onContextAction('markComplete', menu.node.data)}>Mark complete</button>
          <button className="block px-3 py-1 hover:bg-slate-800 w-full text-left text-red-400" onClick={() => onContextAction('delete', menu.node.data)}>Delete</button>
        </div>
      )}
    </div>
  );
}

import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, { Background, Controls, MiniMap, addEdge, useEdgesState, useNodesState } from 'reactflow';
import 'reactflow/dist/style.css';
import { toFlowEdge, toFlowNode } from '../utils/nodeUtils';

export default function CanvasBoard({
  nodesData,
  edgesData,
  onNodesChangeData,
  onEdgesChangeData,
  onNodeClick,
  highlightedNodeId,
  onContextAction,
  focusNodeId
}) {
  const mappedNodes = useMemo(() => nodesData.map(toFlowNode), [nodesData]);
  const mappedEdges = useMemo(() => edgesData.map(toFlowEdge), [edgesData]);
  const [nodes, setNodes, onNodesChange] = useNodesState(mappedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(mappedEdges);
  const [menu, setMenu] = useState(null);

  useEffect(() => {
    setNodes(mappedNodes);
  }, [mappedNodes, setNodes]);

  useEffect(() => {
    setEdges(mappedEdges);
  }, [mappedEdges, setEdges]);

  const syncNodes = useCallback(
    (currentNodes) => {
      onNodesChangeData(currentNodes.map((n) => ({ ...n.data, position: n.position })));
    },
    [onNodesChangeData]
  );

  const handleNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
      setTimeout(() => {
        setNodes((current) => {
          syncNodes(current);
          return current;
        });
      }, 0);
    },
    [onNodesChange, setNodes, syncNodes]
  );

  const handleEdgesChange = useCallback(
    (changes) => {
      onEdgesChange(changes);
      setTimeout(() => {
        setEdges((current) => {
          onEdgesChangeData(current.map((e) => ({ sourceId: e.source, targetId: e.target })));
          return current;
        });
      }, 0);
    },
    [onEdgesChange, onEdgesChangeData, setEdges]
  );

  const onConnect = useCallback(
    (params) => {
      setEdges((eds) => {
        const updated = addEdge({ ...params, type: 'smoothstep' }, eds);
        onEdgesChangeData(updated.map((e) => ({ sourceId: e.source, targetId: e.target })));
        return updated;
      });
    },
    [onEdgesChangeData, setEdges]
  );

  return (
    <div className="flex-1 relative" onClick={() => setMenu(null)}>
      <ReactFlow
        nodes={nodes.map((n) => ({
          ...n,
          data: { ...n.data, isFocused: n.id === focusNodeId },
          style: {
            borderColor: n.id === highlightedNodeId ? '#f59e0b' : undefined,
            boxShadow: n.id === highlightedNodeId ? '0 0 0 2px rgba(245,158,11,0.25)' : undefined
          }
        }))}
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
        <Background gap={20} size={1} />
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

export const NODE_TYPES = ['group', 'topic', 'subtopic', 'content'];

export const createNode = ({ type = 'topic', position, parentId = null, title }) => ({
  id: crypto.randomUUID(),
  title: title || `New ${type}`,
  type,
  parentId,
  position,
  summary: '',
  code: '',
  output: '',
  notes: '',
  images: [],
  difficulty: 'Medium',
  priorityTag: 'Frequent',
  isCompleted: false,
  metadata: {}
});

export const toFlowNode = (node) => {
  const badges = [
    node.priorityTag === 'Weak' ? 'Weak' : null,
    node.priorityTag === 'Important' ? 'Important' : null,
    node.isCompleted ? 'Completed' : null
  ]
    .filter(Boolean)
    .join(' • ');

  return {
    id: node.id,
    data: {
      ...node,
      label: `${node.title}\n${node.type.toUpperCase()}${badges ? `\n${badges}` : ''}`
    },
    position: node.position,
    className: node.isCompleted ? 'completed' : ''
  };
};

export const toFlowEdge = (edge) => ({
  id: `${edge.sourceId}-${edge.targetId}`,
  source: edge.sourceId,
  target: edge.targetId,
  type: 'smoothstep'
});

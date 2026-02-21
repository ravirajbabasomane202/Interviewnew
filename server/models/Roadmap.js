import mongoose from 'mongoose';

const positionSchema = new mongoose.Schema(
  {
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  },
  { _id: false }
);

const nodeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ['group', 'topic', 'subtopic', 'content'], required: true },
    parentId: { type: String, default: null },
    position: { type: positionSchema, required: true },
    summary: { type: String, default: '' },
    code: { type: String, default: '' },
    output: { type: String, default: '' },
    notes: { type: String, default: '' },
    images: [{ type: String }],
    isCompleted: { type: Boolean, default: false },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    priorityTag: { type: String, enum: ['Important', 'Weak', 'Frequent'], default: 'Frequent' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { _id: false }
);

const connectionSchema = new mongoose.Schema(
  {
    sourceId: { type: String, required: true },
    targetId: { type: String, required: true }
  },
  { _id: false }
);

const roadmapSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'default', unique: true },
    title: { type: String, required: true, default: 'Interview Preparation' },
    nodes: [nodeSchema],
    connections: [connectionSchema]
  },
  { timestamps: true }
);

export default mongoose.model('Roadmap', roadmapSchema);

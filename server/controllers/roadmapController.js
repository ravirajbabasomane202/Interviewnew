import fs from 'fs';
import path from 'path';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import Roadmap from '../models/Roadmap.js';

const window = new JSDOM('').window;
const purifier = DOMPurify(window);

const sanitize = (str = '') => purifier.sanitize(str);

const defaultRoadmap = {
  key: 'default',
  title: 'Interview Preparation',
  nodes: [],
  connections: []
};

export async function getRoadmap(req, res) {
  let roadmap = await Roadmap.findOne({ key: 'default' });
  if (!roadmap) roadmap = await Roadmap.create(defaultRoadmap);
  res.json(roadmap);
}

export async function saveRoadmap(req, res) {
  const payload = req.body;
  if (!payload?.title?.trim()) return res.status(400).json({ message: 'Title is required' });

  payload.nodes = (payload.nodes || []).map((node) => ({
    ...node,
    title: sanitize(node.title),
    summary: sanitize(node.summary),
    code: sanitize(node.code),
    output: sanitize(node.output),
    notes: sanitize(node.notes)
  }));

  const roadmap = await Roadmap.findOneAndUpdate({ key: 'default' }, payload, { new: true, upsert: true });
  res.json(roadmap);
}

export async function resetRoadmap(req, res) {
  const roadmap = await Roadmap.findOneAndUpdate({ key: 'default' }, defaultRoadmap, { new: true, upsert: true });
  res.json(roadmap);
}

export async function uploadNodeImage(req, res) {
  const { nodeId } = req.params;
  const roadmap = await Roadmap.findOne({ key: 'default' });
  if (!roadmap) return res.status(404).json({ message: 'Roadmap not found' });
  const node = roadmap.nodes.find((item) => item.id === nodeId);
  if (!node) return res.status(404).json({ message: 'Node not found' });
  if (!req.file) return res.status(400).json({ message: 'Image is required' });

  node.images.push(req.file.filename);
  await roadmap.save();
  res.json(node);
}

export async function deleteNodeImage(req, res) {
  const { nodeId, imageName } = req.params;
  const roadmap = await Roadmap.findOne({ key: 'default' });
  if (!roadmap) return res.status(404).json({ message: 'Roadmap not found' });
  const node = roadmap.nodes.find((item) => item.id === nodeId);
  if (!node) return res.status(404).json({ message: 'Node not found' });

  node.images = node.images.filter((img) => img !== imageName);
  const imagePath = path.join(process.cwd(), 'server', 'uploads', imageName);
  if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);

  await roadmap.save();
  res.json(node);
}

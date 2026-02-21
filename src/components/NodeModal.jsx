import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Editor from '@monaco-editor/react';

const tabs = ['Summary', 'Code', 'Output', 'Images', 'Notes'];

export default function NodeModal({ node, onClose, onChange, onImageUpload, onImageDelete }) {
  const [activeTab, setActiveTab] = useState('Summary');
  const [editableCode, setEditableCode] = useState(true);

  if (!node) return null;

  const updateField = (field, value) => onChange({ ...node, [field]: value });

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} className="w-full max-w-4xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl">
          <div className="border-b border-slate-700 p-4 flex items-center justify-between">
            <input className="bg-transparent text-lg font-semibold text-slate-100 outline-none" value={node.title} onChange={(e) => updateField('title', e.target.value)} />
            <button className="text-slate-400" onClick={onClose}>Close</button>
          </div>
          <div className="flex gap-2 p-3 border-b border-slate-700">
            {tabs.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-1 rounded-lg text-sm ${activeTab === tab ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-300'}`}>
                {tab}
              </button>
            ))}
          </div>

          <div className="p-4 h-[460px] overflow-auto">
            {activeTab === 'Summary' && (
              <textarea value={node.summary || ''} onChange={(e) => updateField('summary', e.target.value)} className="w-full h-96 rounded-lg bg-slate-800 p-3 text-slate-100" />
            )}

            {activeTab === 'Code' && (
              <div className="space-y-2">
                <button className="rounded bg-slate-700 px-2 py-1 text-xs text-slate-100" onClick={() => setEditableCode((v) => !v)}>
                  {editableCode ? 'Switch Read-Only' : 'Switch Editable'}
                </button>
                <Editor
                  theme="vs-dark"
                  height="380px"
                  defaultLanguage="javascript"
                  value={node.code || ''}
                  options={{ readOnly: !editableCode }}
                  onChange={(value) => updateField('code', value || '')}
                />
              </div>
            )}

            {activeTab === 'Output' && (
              <textarea value={node.output || ''} onChange={(e) => updateField('output', e.target.value)} className="w-full h-96 rounded-lg bg-black p-3 text-emerald-300 font-mono" />
            )}

            {activeTab === 'Images' && (
              <div className="space-y-3">
                <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && onImageUpload(node.id, e.target.files[0])} className="text-slate-200" />
                <div className="grid grid-cols-2 gap-3">
                  {(node.images || []).map((img) => (
                    <div key={img} className="border border-slate-700 rounded-lg p-2">
                      <img src={`${import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'}/uploads/${img}`} alt={img} className="h-36 w-full object-cover rounded" />
                      <button className="mt-2 text-xs text-red-400" onClick={() => onImageDelete(node.id, img)}>Delete</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'Notes' && (
              <textarea value={node.notes || ''} onChange={(e) => updateField('notes', e.target.value)} className="w-full h-96 rounded-lg bg-slate-800 p-3 text-slate-100" />
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

const buttonStyles = 'rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-2 text-sm text-slate-100 text-left';

export default function Sidebar({
  onAdd,
  onDelete,
  onResetView,
  searchTerm,
  onSearch,
  progress,
  selectedType,
  onTypeChange
}) {
  return (
    <aside className="w-72 border-r border-slate-800 bg-slate-900 p-4 space-y-4">
      <div className="space-y-2">
        <h2 className="text-sm font-medium text-slate-300">Node Actions</h2>
        <select value={selectedType} onChange={(e) => onTypeChange(e.target.value)} className="w-full rounded-lg bg-slate-800 p-2 text-slate-100 text-sm">
          <option value="group">Group</option>
          <option value="topic">Topic</option>
          <option value="subtopic">Subtopic</option>
          <option value="content">Content</option>
        </select>
        <button className={buttonStyles} onClick={() => onAdd(selectedType)}>Add {selectedType}</button>
        <button className={buttonStyles} onClick={onDelete}>Delete Node</button>
        <button className={buttonStyles} onClick={onResetView}>Reset View</button>
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-medium text-slate-300">Search</h2>
        <input value={searchTerm} onChange={(e) => onSearch(e.target.value)} placeholder="Search by title..." className="w-full rounded-lg bg-slate-800 p-2 text-sm text-slate-100" />
      </div>

      <div className="space-y-2 rounded-xl border border-slate-800 p-3">
        <h2 className="text-sm font-medium text-slate-300">Progress</h2>
        <p className="text-xs text-slate-400">Total: {progress.total}</p>
        <p className="text-xs text-slate-400">Completed: {progress.completed}</p>
        <p className="text-xs text-slate-200">{progress.percent}%</p>
        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500" style={{ width: `${progress.percent}%` }} />
        </div>
      </div>
    </aside>
  );
}

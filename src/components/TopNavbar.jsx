export default function TopNavbar({ onSave, savedState, darkMode, onToggleTheme }) {
  return (
    <header className="h-14 border-b border-slate-800 bg-slate-900/90 backdrop-blur flex items-center justify-between px-4">
      <h1 className="text-slate-100 font-semibold">Interview Workflow Canvas</h1>
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-400">{savedState}</span>
        <button onClick={onToggleTheme} className="rounded-lg bg-slate-700 px-3 py-1 text-xs text-slate-100">
          {darkMode ? 'Light' : 'Dark'}
        </button>
        <button onClick={onSave} className="rounded-lg bg-indigo-500 px-4 py-1.5 text-sm text-white shadow">
          Save Roadmap
        </button>
      </div>
    </header>
  );
}

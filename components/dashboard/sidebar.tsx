import Link from "next/link";

export function Sidebar() {
  return (
    <aside className="w-64 bg-[#1B2435] border-r border-slate-700/30 flex flex-col h-screen sticky top-0">
      <div className="h-20 flex items-center px-6 gap-3">
        <div className="w-8 h-8 bg-slate-300 rounded flex items-center justify-center">
          <svg className="w-5 h-5 text-slate-800" viewBox="0 0 24 24" fill="currentColor"><path d="M4 16c0 .88.39 1.67 1 2.22V20a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h8v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/></svg>
        </div>
        <div>
          <h1 className="text-white font-bold tracking-wide text-lg leading-tight">ALERTO</h1>
          <p className="text-xs text-slate-400">Admin Control</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1.5">
        <Link href="/dashboard" className="flex items-center gap-3 bg-slate-400/20 text-white px-4 py-2.5 rounded-lg text-sm font-medium">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
          Dashboard
        </Link>
        <Link href="#" className="flex items-center gap-3 text-slate-400 hover:text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          Users
        </Link>
        <Link href="#" className="flex items-center gap-3 text-slate-400 hover:text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
          Devices
        </Link>
        <Link href="#" className="flex items-center gap-3 text-slate-400 hover:text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          Alarms
        </Link>
      </nav>

      <div className="p-6">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-white">Mira Medilo</span>
          <span className="text-xs text-slate-500">System Admin</span>
        </div>
      </div>
    </aside>
  );
}
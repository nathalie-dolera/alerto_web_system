"use client";

export function UsersTable() {
  const usersList = [
    { id: 1, name: "Mira Medilo", email: "mira.m@alerto.com", role: "System Admin", joinDate: "Oct 12, 2023", status: "Active" },
    { id: 2, name: "fiona.a@alerto.com", email: "", role: "Commuter", joinDate: "Nov 04, 2023", status: "Active" },
    { id: 3, name: "nathalie.d@alerto.com", email: "", role: "Commuter", joinDate: "Jan 15, 2024", status: "Inactive" },
  ];

  return (
    <div className="bg-[#242F41] rounded-xl border border-slate-700/30 overflow-hidden flex flex-col mt-6">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="text-xs font-semibold text-slate-400 bg-[#1B2435]/50 border-b border-slate-700/30">
            <tr>
              <th className="px-6 py-4">NAME</th>
              <th className="px-6 py-4">ROLE</th>
              <th className="px-6 py-4">JOIN DATE</th>
              <th className="px-6 py-4">STATUS</th>
              <th className="px-6 py-4 text-center">MANAGE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/30">
            {usersList.map((user) => (
              <tr key={user.id} className="hover:bg-slate-700/10 transition-colors">
                <td className="px-6 py-4">
                  <div className="text-white font-medium">{user.name}</div>
                  {user.email && <div className="text-xs text-slate-500">{user.email}</div>}
                </td>
                <td className="px-6 py-4">
                  <span className="bg-[#1B2435] border border-slate-700/50 text-slate-300 px-3 py-1 rounded-full text-xs font-medium">
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-400">{user.joinDate}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${user.status === 'Active' ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
                    <span className={user.status === 'Active' ? 'text-emerald-400' : 'text-slate-400'}>{user.status}</span>
                  </div>
                </td>
                <td className="px-6 py-4 flex items-center justify-center gap-3">
                  <button className="text-xs font-medium text-slate-400 hover:text-white transition-colors">
                    {user.status === 'Active' ? 'Disable' : 'Enable'}
                  </button>
                  <button className="text-slate-400 hover:text-rose-400 transition-colors" title="Delete User">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 px-6 border-t border-slate-700/30 flex items-center justify-between bg-[#242F41]">
        <span className="text-sm text-slate-400">Showing 1 to 3 of 124 users</span>
        <div className="flex gap-2">
          <button className="w-8 h-8 flex items-center justify-center rounded bg-[#1B2435] border border-slate-700/50 text-slate-400 hover:text-white"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg></button>
          <button className="w-8 h-8 flex items-center justify-center rounded bg-[#1B2435] border border-slate-700/50 text-slate-400 hover:text-white"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg></button>
        </div>
      </div>
    </div>
  );
}
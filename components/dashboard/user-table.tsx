import React from "react";

export interface UserTableProps {
  users: any[]; 
  currentPage: number;
  pageCount: number;
  currentPageItems: number;
  overallUsers: number;
}

export function UserTable({ 
  users, 
  currentPage, 
  pageCount, 
  overallUsers 
}: UserTableProps) {
  
  const startCount = users && users.length > 0 ? (currentPage - 1) * 10 + 1 : 0;
  const endCount = Math.min(currentPage * 10, overallUsers);

  return (
    <div className="bg-[#242F41] rounded-xl border border-slate-700/30 overflow-hidden flex flex-col mt-6">
      
      <div className="flex items-center justify-between p-6 border-b border-slate-700/30 bg-[#242F41]">
        <h2 className="text-lg font-semibold text-white">User Connection Status</h2>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Search users..." 
            className="bg-[#1B2435] text-sm text-white placeholder-slate-400 rounded-md pl-10 pr-4 py-2 border border-slate-700/50 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="text-xs font-semibold text-slate-400 bg-[#1B2435]/50 border-b border-slate-700/30">
            <tr>
              <th scope="col" className="px-6 py-4">USER NAME</th>
              <th scope="col" className="px-6 py-4">DEVICE ID</th>
              <th scope="col" className="px-6 py-4">CONNECTION STATUS</th>
              <th scope="col" className="px-6 py-4">USER STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/30">
            {users && users.length > 0 ? (
              users.map((user, index) => (
                <tr key={index} className="hover:bg-slate-700/10 transition-colors">
                  <td className="px-6 py-5">
                    <div className="text-white font-medium">{user?.name || "Unknown User"}</div>
                    {user?.email && <div className="text-xs text-slate-500">{user.email}</div>}
                  </td>
                  <td className="px-6 py-5 text-white font-medium">{user?.deviceId || "N/A"}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${user?.connectionStatus === 'Connected' ? 'bg-emerald-400' : 'bg-slate-500'}`}></div>
                      <span className={user?.connectionStatus === 'Connected' ? 'text-emerald-400' : 'text-slate-400'}>
                        {user?.connectionStatus || "Offline"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                      user?.status === 'Active' 
                        ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' 
                        : user?.status === 'Disabled'
                        ? 'border-rose-500/30 text-rose-400 bg-rose-500/10'
                        : 'border-slate-500/30 text-slate-400 bg-slate-500/10'
                    }`}>
                      {user?.status || "Inactive"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-16 text-center text-slate-500">
                  No commuters found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 px-6 border-t border-slate-700/30 flex items-center justify-between bg-[#242F41]">
        <span className="text-sm text-slate-400">
          Showing {startCount} to {endCount} of {overallUsers} users
        </span>
        
        <div className="flex gap-2">
          <button className="w-8 h-8 flex items-center justify-center rounded bg-[#1B2435] border border-slate-700/50 text-slate-400 hover:text-white transition-colors cursor-pointer">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded bg-[#1B2435] border border-slate-700/50 text-slate-400 hover:text-white transition-colors cursor-pointer">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      </div>

    </div>
  );
}
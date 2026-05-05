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
  
  return (
    <div className="w-full bg-[#1e2330] rounded-lg border border-slate-700/50 overflow-hidden">
      
      {/* Table Header & Search */}
      <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
        <h2 className="text-lg font-semibold text-white">User Connection Status</h2>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Search users..." 
            className="bg-[#151a23] text-sm text-white placeholder-slate-400 rounded-md pl-10 pr-4 py-2 border border-slate-700/50 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-400">
          <thead className="text-xs uppercase bg-[#1e2330] border-b border-slate-700/50 text-slate-300 font-semibold">
            <tr>
              <th scope="col" className="px-6 py-4">USER NAME</th>
              <th scope="col" className="px-6 py-4">DEVICE ID</th>
              <th scope="col" className="px-6 py-4">CONNECTION STATUS</th>
              <th scope="col" className="px-6 py-4">USER STATUS</th>
              <th scope="col" className="px-6 py-4">LAST ACTIVE</th>
            </tr>
          </thead>
          <tbody>
            {users && users.length > 0 ? (
              users.map((user, index) => (
                <tr key={index} className="border-b border-slate-700/50 bg-[#1e2330] hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-white font-medium">{user?.name || "Unknown User"}</div>
                    {user?.email && <div className="text-xs text-slate-500">{user.email}</div>}
                  </td>
                  <td className="px-6 py-4">{user?.deviceId || "N/A"}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${user?.connectionStatus === 'Connected' ? 'bg-emerald-500' : 'bg-slate-500'}`}></div>
                      {user?.connectionStatus || "Offline"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user?.status === 'Active' 
                        ? 'bg-emerald-500/10 text-emerald-500' 
                        : user?.status === 'Disabled'
                        ? 'bg-red-500/10 text-red-500'
                        : 'bg-slate-500/10 text-slate-400'
                    }`}>
                      {user?.status || "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4">{user?.lastActive || user?.joinDate || "N/A"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  No commuters found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#1e2330]">
        
        {/* Your Exact Requested Format */}
        <div className="text-sm text-slate-400">
          {currentPage}/{pageCount} of {overallUsers} users
        </div>
        
        <div className="flex gap-2">
          <button className="p-2 rounded bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
            &lt;
          </button>
          <button className="p-2 rounded bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
            &gt;
          </button>
        </div>
      </div>

    </div>
  );
}
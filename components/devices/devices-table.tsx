"use client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DevicesTable({ devices }: { devices: any[] }) {

  return (
    <div className="bg-[#242F41] rounded-xl border border-slate-700/30 overflow-hidden flex flex-col mt-6">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="text-xs font-semibold text-slate-400 bg-[#1B2435]/50 border-b border-slate-700/30">
            <tr>
              <th className="px-6 py-4">ACCOUNT</th>
              <th className="px-6 py-4">DEVICE ID</th>
              <th className="px-6 py-4">LAST PING</th>
              <th className="px-6 py-4">BATTERY LEVEL</th>
              <th className="px-6 py-4">CONNECTION</th>
              <th className="px-6 py-4 text-center print:hidden">MANAGE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/30">
            {devices.map((dev) => (
              <tr key={dev.id} className="hover:bg-slate-700/10 transition-colors">
                <td className="px-6 py-5 text-white font-medium">{dev.account}</td>
                <td className="px-6 py-5">
                  <span className="bg-[#1B2435] border border-slate-700/50 text-slate-300 px-3 py-1 rounded text-xs font-medium">
                    {dev.deviceId}
                  </span>
                </td>
                <td className="px-6 py-5 text-slate-400">{dev.lastPing}</td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className={`h-full ${dev.batColor}`} style={{ width: `${dev.battery}%` }}></div>
                    </div>
                    <span className="text-white font-medium w-8">{dev.battery}%</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${dev.status === 'Connected' ? 'bg-emerald-400' :
                        dev.status === 'Low Power' ? 'bg-orange-400' : 'bg-slate-500'
                      }`}></span>
                    <span className={
                      dev.status === 'Connected' ? 'text-emerald-400' :
                        dev.status === 'Low Power' ? 'text-orange-400' : 'text-slate-400'
                    }>{dev.status}</span>
                  </div>
                </td>
                <td className="px-6 py-5 flex items-center justify-center gap-4 print:hidden">
                  <button className="text-xs font-medium text-slate-400 hover:text-white transition-colors" title="Rename Device">
                    Rename
                  </button>
                  <button className="text-slate-400 hover:text-rose-400 transition-colors" title="Delete Device">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 px-6 border-t border-slate-700/30 flex items-center justify-between bg-[#242F41] print:hidden">
        <span className="text-sm text-slate-400">Showing 1 to 5 of 1,284 devices</span>
        <div className="flex gap-2">
          <button className="w-8 h-8 flex items-center justify-center rounded bg-[#1B2435] border border-slate-700/50 text-slate-400 hover:text-white"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg></button>
          <button className="w-8 h-8 flex items-center justify-center rounded bg-[#1B2435] border border-slate-700/50 text-slate-400 hover:text-white"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg></button>
        </div>
      </div>
    </div>
  );
}
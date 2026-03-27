"use client";

export function AlarmsTable() {
  const alarmsList = [
    { id: "#AL-9021", initials: "ND", name: "Nathalie Dolera", time: "10:45 AM, Oct 24, 2023", status: "Pending", avatarBg: "bg-blue-900", avatarText: "text-blue-400" },
    { id: "#AL-9020", initials: "FA", name: "Fiona Antonio", time: "09:12 AM, Oct 24, 2023", status: "Triggered", avatarBg: "bg-indigo-900", avatarText: "text-indigo-400" },
    { id: "#AL-9019", initials: "JJ", name: "Justine Jomoc", time: "08:30 PM, Oct 23, 2023", status: "Triggered", avatarBg: "bg-blue-900", avatarText: "text-blue-400" },
    { id: "#AL-9018", initials: "JM", name: "Joseph Magno", time: "04:15 PM, Oct 23, 2023", status: "Pending", avatarBg: "bg-sky-900", avatarText: "text-sky-400" },
    { id: "#AL-9017", initials: "JA", name: "James Alvarez", time: "02:00 PM, Oct 23, 2023", status: "Triggered", avatarBg: "bg-indigo-900", avatarText: "text-indigo-400" },
  ];

  return (
    <div className="bg-[#242F41] rounded-xl border border-slate-700/30 overflow-hidden flex flex-col mt-6">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="text-xs font-semibold text-slate-400 bg-[#1B2435]/50 border-b border-slate-700/30">
            <tr>
              <th className="px-6 py-4">ALARM ID</th>
              <th className="px-6 py-4">USER</th>
              <th className="px-6 py-4">TIME TRIGGERED</th>
              <th className="px-6 py-4">ALARM STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/30">
            {alarmsList.map((alarm, index) => (
              <tr key={index} className="hover:bg-slate-700/10 transition-colors">
                <td className="px-6 py-5 text-white font-medium">{alarm.id}</td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${alarm.avatarBg} ${alarm.avatarText}`}>
                      {alarm.initials}
                    </div>
                    <span className="text-slate-300">{alarm.name}</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-slate-400">{alarm.time}</td>
                <td className="px-6 py-5">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium ${
                    alarm.status === 'Pending' 
                      ? 'border-orange-500/30 text-orange-400 bg-orange-500/10' 
                      : 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${alarm.status === 'Pending' ? 'bg-orange-400' : 'bg-emerald-400'}`}></span>
                    {alarm.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 px-6 border-t border-slate-700/30 flex items-center justify-between bg-[#242F41]">
        <span className="text-sm text-slate-400">Showing 5 of 1,248 alarms</span>
        <div className="flex gap-2">
          <button className="w-8 h-8 flex items-center justify-center rounded bg-[#1B2435] border border-slate-700/50 text-slate-400 hover:text-white transition-colors"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg></button>
          <button className="w-8 h-8 flex items-center justify-center rounded bg-[#1B2435] border border-slate-700/50 text-slate-400 hover:text-white transition-colors"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg></button>
        </div>
      </div>
    </div>
  );
}
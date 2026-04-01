"use client";

import { downloadDashboardReport, downloadCSV } from "@/lib/exportUtils";

interface ExportButtonProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stats?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  users?: any[];
  filename: string;
  label?: string;
}

export function ExportButton({ data, stats, users, filename, label = "Export Data" }: ExportButtonProps) {
  const handleExport = () => {
    if (stats && users) {
      downloadDashboardReport(stats, users, filename);
    } else if (data) {
      downloadCSV(data, filename);
    }
  };

  return (
    <button 
      onClick={handleExport}
      className="flex items-center gap-2 bg-[#242F41] border border-slate-700/50 hover:bg-slate-700/50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      {label}
    </button>
  );
}

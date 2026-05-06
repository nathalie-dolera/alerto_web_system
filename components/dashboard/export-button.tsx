"use client";

import { downloadDashboardReport, downloadCSV } from "@/lib/exportUtils";
import { useState, useRef, useEffect } from "react";

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
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const handleCSVExport = () => {
    if (stats && users) {
      downloadDashboardReport(stats, users, filename);
    } else if (data) {
      downloadCSV(data, filename);
    }
    setIsOpen(false);
  };

  const handlePDFExport = () => {
    window.print();
    setIsOpen(false);
  };

  return (
    <div className="relative print:hidden" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-[#242F41] border border-slate-700/50 hover:bg-slate-700/50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        {label}
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[#1B2435] border border-slate-700/50 rounded-lg shadow-xl overflow-hidden z-50">
          <button
            onClick={handleCSVExport}
            className="w-full text-left px-4 py-3 text-sm text-slate-200 hover:bg-slate-700/50 hover:text-white transition-colors"
          >
            Export as .CSV
          </button>
          <button
            onClick={handlePDFExport}
            className="w-full text-left px-4 py-3 text-sm text-slate-200 hover:bg-slate-700/50 hover:text-white transition-colors border-t border-slate-700/50"
          >
            Export as .PDF
          </button>
        </div>
      )}
    </div>
  );
}

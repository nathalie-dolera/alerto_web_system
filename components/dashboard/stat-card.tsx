import Link from 'next/link';

interface StatCardProps {
  title: string;
  value: string;
  type: "users" | "devices" | "alarms" | "registeredUsers";
  href: string;
}

export function StatCard({ title, value, type, href }: StatCardProps) {
  const getIconConfig = () => {
    switch (type) {
      case "users":
        return {
          bg: "bg-blue-500/10",
          text: "text-blue-400",
          icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        };
      case "registeredUsers":
        return {
          bg: "bg-purple-500/10",
          text: "text-purple-400",
          icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        };
      case "devices":
        return {
          bg: "bg-orange-500/10",
          text: "text-orange-400",
          icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
        };
      case "alarms":
        return {
          bg: "bg-red-500/10",
          text: "text-red-400",
          icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
        };
    }
  };

  const config = getIconConfig();

  return (
    <Link href={href} className="block transition-transform hover:scale-[1.02] hover:-translate-y-1 duration-200">
      <div className="bg-[#242F41] rounded-xl p-6 shadow-sm border border-slate-700/30 h-full">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${config.bg} ${config.text}`}>
          {config.icon}
        </div>
        <p className="text-sm text-slate-400 font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-white">{value}</h3>
      </div>
    </Link>
  );
}
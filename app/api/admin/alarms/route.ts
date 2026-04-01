export const runtime = 'edge';
import { NextResponse } from 'next/server';

export async function GET() {
  const alarmsList = [
    { id: "#AL-9021", initials: "ND", name: "Nathalie Dolera", time: "10:45 AM, Oct 24, 2023", status: "Pending", avatarBg: "bg-blue-900", avatarText: "text-blue-400" },
    { id: "#AL-9020", initials: "FA", name: "Fiona Antonio", time: "09:12 AM, Oct 24, 2023", status: "Triggered", avatarBg: "bg-indigo-900", avatarText: "text-indigo-400" },
    { id: "#AL-9019", initials: "JJ", name: "Justine Jomoc", time: "08:30 PM, Oct 23, 2023", status: "Triggered", avatarBg: "bg-blue-900", avatarText: "text-blue-400" },
    { id: "#AL-9018", initials: "JM", name: "Joseph Magno", time: "04:15 PM, Oct 23, 2023", status: "Pending", avatarBg: "bg-sky-900", avatarText: "text-sky-400" },
    { id: "#AL-9017", initials: "JA", name: "James Alvarez", time: "02:00 PM, Oct 23, 2023", status: "Triggered", avatarBg: "bg-indigo-900", avatarText: "text-indigo-400" },
  ];
  return NextResponse.json({ alarms: alarmsList });
}

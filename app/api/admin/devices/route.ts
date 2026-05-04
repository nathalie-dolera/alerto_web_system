export const runtime = 'edge';
import { NextResponse } from 'next/server';

export async function GET() {
  const devicesList = [
    {
      id: 1,
      account: "mira.m@alerto.com",
      deviceId: "DEV-9021",
      lastPing: "2 mins ago",
      battery: 85,
      batColor: "bg-emerald-400",
      status: "Connected" 
    },
    {
      id: 2,
      account: "nathalie.d@alerto.com",
      deviceId: "DEV-4432",
      lastPing: "5 mins ago",
      battery: 42,
      batColor: "bg-orange-400",
      status: "Connected" 
    },
    {
      id: 3,
      account: "fiona.a@alerto.com",
      deviceId: "DEV-1120",
      lastPing: "1 hour ago",
      battery: 15,
      batColor: "bg-blue-500",
      status: "Low Power" 
    },
    {
      id: 4,
      account: "justine.j@alerto.com",
      deviceId: "DEV-8876",
      lastPing: "12 mins ago",
      battery: 100,
      batColor: "bg-emerald-400",
      status: "Connected" 
    },
    {
      id: 5,
      account: "joseph.m@alerto.com",
      deviceId: "DEV-5541",
      lastPing: "3 days ago",
      battery: 0,
      batColor: "bg-slate-600",
      status: "Offline" 
    },
  ];
  return NextResponse.json({
    devices: devicesList 
  });
}

export type UserConnection = {
  id: string;
  email: string;
  deviceId: string;
  status: "Connected" | "Disconnected";
  lastActive: string;
};

export type DashboardStats = {
  activeUsers: string;
  registeredUsers: string;
  connectedDevices: string;
  alarmsTriggered: string;
};

export type DashboardData = {
  stats: DashboardStats;
  users: UserConnection[];
};

export async function getDashboardData(): Promise<DashboardData> {
  return {
    stats: {
      activeUsers: "12,840",
      registeredUsers: "25,120",
      connectedDevices: "4,210",
      alarmsTriggered: "15",
    },
    users: [
      { id: "1", email: "nathdolera@example.com", deviceId: "DEV-8821", status: "Connected", lastActive: "2 mins ago" },
      { id: "2", email: "fionaantonio@example.com", deviceId: "DEV-4412", status: "Disconnected", lastActive: "1 hour ago" },
      { id: "3", email: "justinejomoc@example.com", deviceId: "DEV-9901", status: "Connected", lastActive: "Just now" },
      { id: "4", email: "miramae@example.com", deviceId: "DEV-1123", status: "Connected", lastActive: "15 mins ago" },
    ],
  };
}
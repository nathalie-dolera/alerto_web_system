import { prisma } from "@/lib/prisma";

export type UserConnection = {
  id: string;
  email: string;
  deviceId: string;
  status: "Connected" | "Disconnected";
  userStatus: string;
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
  try {
    const activeUsersCount = await prisma.user.count({
      where: { isOnline: true }
    });

    const registeredUsersCount = await prisma.user.count();

    const connectedDevicesCount = await prisma.user.count({
      where: { isOnline: true }
    });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const alarmsTriggeredCount = await prisma.userAlert.count({
      where: {
        createdAt: {
          gte: startOfToday
        }
      }
    });

    const activeUsers = await prisma.user.findMany({
      where: { isOnline: true },
      select: {
        id: true,
        email: true,
        deviceId: true,
        isOnline: true,
        status: true,
        lastActive: true,
      },
      orderBy: { lastActive: 'desc' },
      take: 50,
    });

    const formatLastActive = (date: Date | null) => {
      if (!date) return "Never";
      const diffMs = new Date().getTime() - date.getTime();
      const diffMins = Math.round(diffMs / 60000);
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins} mins ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    };

    const formattedUsers: UserConnection[] = activeUsers.map((user: any) => ({
      id: user.id,
      email: user.email,
      deviceId: user.deviceId || "N/A",
      status: user.isOnline ? "Connected" : "Disconnected",
      userStatus: user.status || "Unknown",
      lastActive: formatLastActive(user.lastActive),
    }));

    return {
      stats: {
        activeUsers: activeUsersCount.toLocaleString(),
        registeredUsers: registeredUsersCount.toLocaleString(),
        connectedDevices: connectedDevicesCount.toLocaleString(),
        alarmsTriggered: alarmsTriggeredCount.toLocaleString(),
      },
      users: formattedUsers,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return {
      stats: {
        activeUsers: "0",
        registeredUsers: "0",
        connectedDevices: "0",
        alarmsTriggered: "0",
      },
      users: [],
    };
  }
}
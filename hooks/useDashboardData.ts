import { prisma } from "@/lib/prisma";

export type UserConnection = {
  id: string;
  name: string;
  email: string;
  deviceId: string;
  connectionStatus: "Connected" | "Offline";
  status: string;
  role: string;
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

const HEARTBEAT_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes for Bluetooth/live heartbeat
const RECENT_TRIP_WINDOW_MS = 10 * 60 * 1000; // 10 minutes - recent trip means commute was just active

export async function getDashboardData(): Promise<DashboardData> {
  try {
    const now = Date.now();
    const recentTripThreshold = new Date(now - RECENT_TRIP_WINDOW_MS);
    const recentAlertThreshold = new Date(now - 15 * 60 * 1000);

    const [allUsersFromDb, recentTrips, recentAlerts] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          deviceId: true,
          isOnline: true,
          status: true,
          lastActive: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.trip.findMany({
        where: { date: { gte: recentTripThreshold } },
        select: { userId: true },
      }),
      prisma.userAlert.findMany({
        where: { createdAt: { gte: recentAlertThreshold } },
        select: { userId: true },
      }),
    ]);

    const recentTripUserIds = new Set(recentTrips.map(t => t.userId));
    const recentAlertUserIds = new Set(recentAlerts.map(a => a.userId).filter(Boolean) as string[]);

    const usersWithRealtimeStatus = allUsersFromDb.map((user) => {
      // If user is marked isOnline=false, they are immediately Offline/Inactive
      if (!user.isOnline) {
        return {
          ...user,
          isActuallyActive: false,
        };
      }

      // If user is isOnline=true, verify lastActive is within 5 minutes
      const isFresh = user.lastActive 
        ? (now - new Date(user.lastActive).getTime() <= HEARTBEAT_THRESHOLD_MS)
        : true;

      return {
        ...user,
        isActuallyActive: isFresh,
      };
    });

    const activeUsersCount = usersWithRealtimeStatus.filter(u => u.isActuallyActive).length;
    const registeredUsersCount = usersWithRealtimeStatus.length;
    const connectedDevicesCount = usersWithRealtimeStatus.filter(u => u.isActuallyActive && Boolean(u.deviceId)).length;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const alarmsTriggeredCount = await prisma.userAlert.count({
      where: { createdAt: { gte: startOfToday } }
    });

    const formatLastActive = (date: Date | null) => {
      if (!date) return "Never";
      const diffMs = now - date.getTime();
      const diffMins = Math.round(diffMs / 60000);
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins} mins ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    };

    const formattedUsers: UserConnection[] = usersWithRealtimeStatus.map((user) => {
      let displayStatus = "Active";
      if (user.status === "Inactive") {
        displayStatus = "Disabled";
      } else {
        displayStatus = user.isActuallyActive ? "Active" : "Inactive";
      }

      return {
        id: user.id,
        name: user.name || user.email.split('@')[0],
        email: user.email,
        deviceId: user.deviceId || "N/A",
        connectionStatus: user.isActuallyActive ? "Connected" : "Offline",
        status: displayStatus,
        role: "Commuter",
        lastActive: formatLastActive(user.lastActive),
      };
    });

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
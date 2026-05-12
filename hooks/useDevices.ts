import { useState, useEffect } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDevices() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [devices, setDevices] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalDevices: 0, activeNodes: 0, lowBattery: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDevices() {
      try {
        const res = await fetch('/api/admin/devices');
        if (res.ok) {
          const data = await res.json();
          setDevices(data.devices || []);
          if (data.stats) {
            setStats(data.stats);
          }
        }
      } catch (err) {
        console.error("Failed to fetch devices", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDevices();
  }, []);

  return { devices, stats, loading };
}

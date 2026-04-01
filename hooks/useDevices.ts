import { useState, useEffect } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDevices() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDevices() {
      try {
        const res = await fetch('/api/admin/devices');
        if (res.ok) {
          const data = await res.json();
          setDevices(data.devices || []);
        }
      } catch (err) {
        console.error("Failed to fetch devices", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDevices();
  }, []);

  return { devices, loading };
}

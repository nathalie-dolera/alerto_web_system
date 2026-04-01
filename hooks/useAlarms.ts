import { useState, useEffect } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useAlarms() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [alarms, setAlarms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAlarms() {
      try {
        const res = await fetch('/api/admin/alarms');
        if (res.ok) {
          const data = await res.json();
          setAlarms(data.alarms || []);
        }
      } catch (err) {
        console.error("Failed to fetch alarms", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAlarms();
  }, []);

  return { alarms, loading };
}

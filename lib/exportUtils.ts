export function downloadCSV(data: any[], filename: string) {
  if (!data || !data.length) return;

  const headers = Object.keys(data[0]);
  const csvRows = [];

  // Add Headers
  csvRows.push(headers.join(','));

  // Add Data
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header] !== undefined && row[header] !== null ? String(row[header]) : '';
      return `"${val.replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], {
    type: 'text/csv;charset=utf-8;' 
  });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadDashboardReport(stats: any, users: any[], filename: string) {
  let csvString = "DASHBOARD STATS\n";
  csvString += 'Metric,Value\n';
  csvString += `"Active Users","${stats?.activeUsers || 0}"\n`;
  csvString += `"Registered Users","${stats?.registeredUsers || 0}"\n`;
  csvString += `"Connected Devices","${stats?.connectedDevices || 0}"\n`;
  csvString += `"Alarms Triggered","${stats?.alarmsTriggered || 0}"\n`;

  csvString += '\nUSER CONNECTIONS\n';
  if (users && users.length > 0) {
    const headers = Object.keys(users[0]);
    csvString += headers.join(',') + '\n';
    
    for (const row of users) {
      const values = headers.map(header => {
        const val = row[header] !== undefined && row[header] !== null ? String(row[header]) : '';
        return `"${val.replace(/"/g, '""')}"`;
      });
      csvString += values.join(',') + '\n';
    }
  }

  const blob = new Blob([csvString], {
    type: 'text/csv;charset=utf-8;' 
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

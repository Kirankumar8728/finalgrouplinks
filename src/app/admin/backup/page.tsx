'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function AdminBackupPage() {
  const [loading, setLoading] = useState(false);

  const downloadBackup = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/backup?full=true');
      if (!response.ok) throw new Error('Backup failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${new Date().toISOString()}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Backup downloaded successfully');
    } catch (error) {
      toast.error('Failed to download backup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Backup Management</h1>
      <button 
        onClick={downloadBackup}
        disabled={loading}
        className="px-4 py-2 bg-emerald-600 text-white rounded disabled:bg-gray-400"
      >
        {loading ? 'Generating...' : 'Generate and Download Full Backup'}
      </button>
    </div>
  );
}

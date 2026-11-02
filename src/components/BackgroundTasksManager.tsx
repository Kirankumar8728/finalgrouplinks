'use client';
import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, RotateCcw, RefreshCw } from 'lucide-react';
import { getAdminAuthHeaders } from '@/src/utils/adminAuth';

export const BackgroundTasksManager = () => {
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/admin/background-import/status', {
        headers: getAdminAuthHeaders(),
      });
      const data = await res.json();
      setJob(data);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (action: 'pause' | 'resume' | 'cancel' | 'clear') => {
    await fetch('/api/admin/background-import/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAdminAuthHeaders() },
      body: JSON.stringify({ action }),
    });
    fetchStatus();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Background Tasks</h2>
      {job && (
        <div className="bg-slate-900 p-4 rounded-lg">
          <p>Status: {job.status}</p>
          <p>Processed: {job.processed} / {job.total}</p>
          <div className="flex gap-2 mt-4">
            <button onClick={() => handleAction('pause')} className="p-2 bg-amber-600 rounded"><Pause size={16} /></button>
            <button onClick={() => handleAction('resume')} className="p-2 bg-green-600 rounded"><Play size={16} /></button>
            <button onClick={() => handleAction('cancel')} className="p-2 bg-rose-600 rounded"><Square size={16} /></button>
            <button onClick={() => handleAction('clear')} className="p-2 bg-slate-600 rounded"><RotateCcw size={16} /></button>
            <button onClick={fetchStatus} className="p-2 bg-indigo-600 rounded"><RefreshCw size={16} /></button>
          </div>
        </div>
      )}
    </div>
  );
};

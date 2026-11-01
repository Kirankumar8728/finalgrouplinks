'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setLoading(false);
      });
  }, []);

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (res.ok) {
      toast.success('Settings saved successfully');
    } else {
      toast.error('Failed to save settings');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Settings</h1>
      <form onSubmit={saveSettings} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Site Title</label>
          <input
            type="text"
            value={settings.siteTitle}
            onChange={e => setSettings({...settings, siteTitle: e.target.value})}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Detail Title Template</label>
          <input
            type="text"
            value={settings.detailTitleTemplate}
            onChange={e => setSettings({...settings, detailTitleTemplate: e.target.value})}
            className="w-full p-2 border rounded"
          />
          <p className="text-xs text-slate-500">Variables: (Group Title), (Group Category), (Group Tags), (Site Title), (Group Platform), (Group Description)</p>
        </div>
        <div>
          <label className="block text-sm font-medium">Detail Description Template</label>
          <input
            type="text"
            value={settings.detailDescriptionTemplate}
            onChange={e => setSettings({...settings, detailDescriptionTemplate: e.target.value})}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Minimum Description Words</label>
          <input
            type="number"
            value={settings.minDescriptionWords}
            onChange={e => setSettings({...settings, minDescriptionWords: parseInt(e.target.value)})}
            className="w-full p-2 border rounded"
          />
        </div>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save Settings</button>
      </form>
    </div>
  );
}

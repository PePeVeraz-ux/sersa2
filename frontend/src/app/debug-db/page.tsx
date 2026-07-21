'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function DebugDB() {
  const { token } = useAuth();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!token) return;
    apiFetch<any[]>('/requests/my-requests', { token })
      .then(setData)
      .catch(err => setData({ error: err.message }));
  }, [token]);

  return (
    <div className="p-8 font-mono text-xs whitespace-pre bg-slate-900 text-green-400 min-h-screen overflow-auto">
      <h1 className="text-xl font-bold mb-4 text-white">Debug appointments / my-requests</h1>
      {data ? JSON.stringify(data, null, 2) : 'Loading...'}
    </div>
  );
}

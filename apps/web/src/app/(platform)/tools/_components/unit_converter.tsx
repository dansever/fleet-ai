'use client';

import { api } from '@/services/api-client';
import { useState } from 'react';

export default function UnitConverter() {
  const [q, setQ] = useState('2.3 USD/USG to USD/L');
  const [res, setRes] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const onConvert = async () => {
    try {
      setLoading(true);
      setRes(null);
      const r = await api.post('/api/convert', {
        input: q,
      });
      const data = await r.data;
      setRes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Fuel/Contract Unit & Currency Converter</h2>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        style={{ width: 420, padding: 8 }}
        placeholder="e.g. 50,000 L to USG"
      />
      <button onClick={onConvert} disabled={loading} style={{ marginLeft: 8 }}>
        {loading ? 'Converting...' : 'Convert'}
      </button>
      <pre style={{ marginTop: 16 }}>{res ? JSON.stringify(res, null, 2) : null}</pre>
    </div>
  );
}

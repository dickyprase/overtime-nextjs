'use client';
import { useEffect, useState } from 'react';

export default function ApiDocsPage() {
  const [spec, setSpec] = useState(null);

  useEffect(() => {
    fetch('/api/docs').then(r => r.json()).then(setSpec).catch(console.error);
  }, []);

  if (!spec) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa', fontFamily: "'Inter', sans-serif" }}>
      <p style={{ color: '#64748b' }}>Loading API Documentation...</p>
    </div>
  );

  const tagGroups = {};
  spec.tags.forEach(t => { tagGroups[t.name] = { description: t.description, paths: [] }; });
  Object.entries(spec.paths).forEach(([path, methods]) => {
    Object.entries(methods).forEach(([method, details]) => {
      const tag = details.tags?.[0] || 'Other';
      if (!tagGroups[tag]) tagGroups[tag] = { description: '', paths: [] };
      tagGroups[tag].paths.push({ path, method: method.toUpperCase(), ...details });
    });
  });

  const methodColors = { GET: '#22c55e', POST: '#3b82f6', PUT: '#f59e0b', DELETE: '#ef4444' };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', fontFamily: "'Inter', sans-serif", color: '#e2e8f0' }}>
      {/* Header */}
      <div style={{ background: 'rgba(30,41,59,0.95)', borderBottom: '1px solid #334155', padding: '24px 32px', backdropFilter: 'blur(20px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, background: 'linear-gradient(135deg, #60a5fa, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {spec.info.title}
            </h1>
            <p style={{ color: '#94a3b8', marginTop: 4 }}>{spec.info.description}</p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ background: '#1e40af', color: '#93c5fd', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>v{spec.info.version}</span>
            <a href="/login" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', padding: '8px 20px', borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Login →</a>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px' }}>
        {/* Server Info */}
        <div style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid #334155', borderRadius: 16, padding: 20, marginBottom: 32, backdropFilter: 'blur(10px)' }}>
          <p style={{ fontSize: 12, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', fontWeight: 600, letterSpacing: 1 }}>Server</p>
          <code style={{ color: '#60a5fa', fontSize: 14, background: 'rgba(59,130,246,0.15)', padding: '4px 10px', borderRadius: 6 }}>{spec.servers[0].url}</code>
          <span style={{ color: '#64748b', marginLeft: 12, fontSize: 13 }}>{spec.servers[0].description}</span>
        </div>

        {/* Auth Info */}
        <div style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)', borderRadius: 16, padding: 20, marginBottom: 32 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#fbbf24', marginBottom: 8 }}>🔐 Authentication</p>
          <p style={{ fontSize: 13, color: '#94a3b8' }}>Gunakan <code style={{ color: '#fbbf24', background: 'rgba(234,179,8,0.15)', padding: '2px 6px', borderRadius: 4 }}>POST /api/login</code> untuk mendapatkan session cookie. Cookie otomatis dikirim di setiap request.</p>
        </div>

        {/* Endpoints by Tag */}
        {Object.entries(tagGroups).map(([tag, group]) => (
          <div key={tag} style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9' }}>{tag}</h2>
              <span style={{ fontSize: 12, color: '#64748b', background: '#1e293b', padding: '2px 10px', borderRadius: 20 }}>{group.paths.length}</span>
            </div>
            {group.description && <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 12, marginTop: -8 }}>{group.description}</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {group.paths.map((ep, i) => (
                <div key={i} style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid #334155', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', transition: 'all 0.2s', cursor: 'default' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#475569'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.transform = 'translateX(0)'; }}>
                  <span style={{ background: methodColors[ep.method] || '#64748b', color: 'white', fontWeight: 700, fontSize: 11, padding: '4px 10px', borderRadius: 6, minWidth: 56, textAlign: 'center', fontFamily: 'monospace' }}>{ep.method}</span>
                  <code style={{ color: '#e2e8f0', fontSize: 14, fontFamily: 'monospace', flex: 1, minWidth: 200 }}>{ep.path}</code>
                  <span style={{ color: '#94a3b8', fontSize: 13 }}>{ep.summary}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '40px 0 20px', borderTop: '1px solid #334155', marginTop: 40, color: '#64748b', fontSize: 13 }}>
          Overtime Management System API • Next.js 14+ • {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}

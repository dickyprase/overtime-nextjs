'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [tab, setTab] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [error, setError] = useState('');
  const [regError, setRegError] = useState('');
  const [companyName, setCompanyName] = useState('Employee Overtime Management');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/me').then(r => r.ok ? r.json() : null).then(u => { if (u) router.push('/dashboard'); });
    fetch('/api/config').then(r => r.json()).then(c => { if (c.companyName) setCompanyName(c.companyName); }).catch(() => {});
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault(); setError('');
    try {
      const res = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
      if (res.ok) { router.push('/dashboard'); } else { const d = await res.json(); setError(d.error || 'Login gagal'); }
    } catch { setError('Koneksi gagal'); }
  };

  const handleRegister = async (e) => {
    e.preventDefault(); setRegError('');
    try {
      const res = await fetch('/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: regName, username: regUsername, password: regPassword }) });
      if (res.ok) { router.push('/dashboard'); } else { const d = await res.json(); setRegError(d.error || 'Registrasi gagal'); }
    } catch { setRegError('Koneksi gagal'); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f0f7ff 0%, #e0f2fe 50%, #ecfeff 100%)', padding: '1rem', overflow: 'hidden', position: 'relative', fontFamily: "'Inter', sans-serif" }}>
      {/* Floating shapes */}
      <div style={{ position: 'absolute', width: 384, height: 384, borderRadius: '50%', background: '#93c5fd', filter: 'blur(60px)', opacity: 0.6, top: -80, left: -80, animation: 'float 8s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', width: 288, height: 288, borderRadius: '50%', background: '#67e8f9', filter: 'blur(60px)', opacity: 0.6, top: '50%', right: -40, animation: 'float 8s ease-in-out infinite 2s' }} />
      <div style={{ position: 'absolute', width: 320, height: 320, borderRadius: '50%', background: '#7dd3fc', filter: 'blur(60px)', opacity: 0.6, bottom: -80, left: '33%', animation: 'float 8s ease-in-out infinite 4s' }} />

      <style>{`
        @keyframes float { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-20px) rotate(5deg); } }
        .input-field:focus { transform: translateY(-2px); box-shadow: 0 10px 40px -10px rgba(59,130,246,0.4); }
      `}</style>

      <div style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 24, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', padding: '2rem 3rem', width: '100%', maxWidth: 420, position: 'relative', zIndex: 10 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 10px 25px -5px rgba(59,130,246,0.4)' }}>
            <svg width="32" height="32" fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b' }}>Sistem Lembur</h1>
          <p style={{ color: '#64748b', marginTop: 4 }}>{companyName}</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', marginBottom: 24, background: '#f1f5f9', borderRadius: 12, padding: 4 }}>
          <button onClick={() => setTab('login')} style={{ flex: 1, padding: '10px 0', borderRadius: 10, fontSize: 14, fontWeight: 500, border: 'none', cursor: 'pointer', transition: 'all 0.3s', background: tab === 'login' ? 'white' : 'transparent', boxShadow: tab === 'login' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', color: tab === 'login' ? '#1e293b' : '#64748b' }}>Masuk</button>
          <button onClick={() => setTab('register')} style={{ flex: 1, padding: '10px 0', borderRadius: 10, fontSize: 14, fontWeight: 500, border: 'none', cursor: 'pointer', transition: 'all 0.3s', background: tab === 'register' ? 'white' : 'transparent', boxShadow: tab === 'register' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', color: tab === 'register' ? '#1e293b' : '#64748b' }}>Daftar</button>
        </div>

        {/* Login Form */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 8 }}>Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} required placeholder="Masukkan username"
                style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #e2e8f0', outline: 'none', fontSize: 14, transition: 'all 0.3s' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 8 }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Masukkan password"
                style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #e2e8f0', outline: 'none', fontSize: 14, transition: 'all 0.3s' }} />
            </div>
            {error && <div style={{ color: '#ef4444', fontSize: 14, textAlign: 'center', padding: 8, background: '#fef2f2', borderRadius: 8 }}>{error}</div>}
            <button type="submit" style={{ width: '100%', padding: '14px 0', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', fontWeight: 600, fontSize: 16, cursor: 'pointer', transition: 'all 0.3s' }}>Masuk</button>
          </form>
        )}

        {/* Register Form */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 8 }}>Nama Lengkap</label>
              <input type="text" value={regName} onChange={e => setRegName(e.target.value)} required placeholder="Masukkan nama lengkap"
                style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #e2e8f0', outline: 'none', fontSize: 14, transition: 'all 0.3s' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 8 }}>Username</label>
              <input type="text" value={regUsername} onChange={e => setRegUsername(e.target.value)} required placeholder="Username untuk login"
                style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #e2e8f0', outline: 'none', fontSize: 14, transition: 'all 0.3s' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 8 }}>Password</label>
              <input type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} required placeholder="Buat password (min 3 karakter)"
                style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #e2e8f0', outline: 'none', fontSize: 14, transition: 'all 0.3s' }} />
            </div>
            {regError && <div style={{ color: '#ef4444', fontSize: 14, textAlign: 'center', padding: 8, background: '#fef2f2', borderRadius: 8 }}>{regError}</div>}
            <button type="submit" style={{ width: '100%', padding: '14px 0', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', fontWeight: 600, fontSize: 16, cursor: 'pointer', transition: 'all 0.3s' }}>Daftar</button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: 32, paddingTop: 24, borderTop: '1px solid #f1f5f9' }}>
          <p style={{ color: '#94a3b8', fontSize: 14 }}>⏱️ Sistem Manajemen Lembur</p>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, QrCode, Activity } from 'lucide-react';

export default function PatientLoginKiosk() {
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;
    
    setIsLoading(true);
    // In real app, we might ping the server to verify the token exists first.
    // For now, we redirect to their dynamic portal safely using native browser routing.
    setTimeout(() => {
      window.location.href = `/patient/${token.trim().toLowerCase()}`;
    }, 500);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(16px)',
        padding: '3rem 2.5rem',
        borderRadius: '24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.05)',
        border: '1px solid rgba(255,255,255,0.4)',
        width: '100%',
        maxWidth: '420px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem'
      }}>
        
        {/* Platinum Medical Logo */}
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          boxShadow: '0 10px 20px rgba(37,99,235,0.2)'
        }}>
          <Activity size={32} />
        </div>

        <div style={{textAlign: 'center'}}>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: '#0f172a',
            margin: '0 0 0.5rem 0',
            letterSpacing: '-1px'
          }}>Patient Portal</h1>
          <p style={{
            color: '#64748b',
            margin: 0,
            fontSize: '0.95rem',
            lineHeight: 1.5
          }}>Enter the 6-character token from your<br/>prescription ticket to view your live queue.</p>
        </div>

        <form onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8'
            }}>
              <QrCode size={20} />
            </div>
            <input
              type="text"
              placeholder="e.g. A9F3B1"
              value={token}
              onChange={(e) => setToken(e.target.value.toUpperCase())}
              style={{
                width: '100%',
                padding: '1rem 1rem 1rem 3rem',
                fontSize: '1.1rem',
                fontWeight: 600,
                letterSpacing: '2px',
                color: '#0f172a',
                background: '#f8fafc',
                border: '2px solid #e2e8f0',
                borderRadius: '16px',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          <button 
            type="submit"
            disabled={!token.trim() || isLoading}
            style={{
              width: '100%',
              padding: '1rem',
              background: token.trim() ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' : '#cbd5e1',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              fontSize: '1.05rem',
              fontWeight: 600,
              cursor: token.trim() && !isLoading ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s',
              boxShadow: token.trim() ? '0 10px 20px rgba(37,99,235,0.2)' : 'none'
            }}
          >
            {isLoading ? 'Locating File...' : 'View My Tests'}
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </form>

        <p style={{
          fontSize: '0.8rem',
          color: '#94a3b8',
          margin: 0,
          textAlign: 'center'
        }}>
          Having trouble? Secure your token from the main reception desk.
        </p>

      </div>
    </div>
  );
}

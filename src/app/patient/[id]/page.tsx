'use client';

import { useState, useEffect } from 'react';
import { Patient } from '@/lib/types';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Clock, 
  Info, 
  Send, 
  Bot, 
  User, 
  BrainCircuit, 
  ChevronRight,
  AlertCircle,
  MapPin,
  CalendarClock
} from 'lucide-react';

export default function PatientPortal() {
  const params = useParams();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<{ role: 'user' | 'agent', text: string, reasoning?: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/patient/${params.id}`)
      .then(res => res.json())
      .then(data => setPatient(data));
  }, [params.id]);

  const sendMessage = async () => {
    if (!message.trim()) return;
    
    setLoading(true);
    const newChat = [...chat, { role: 'user' as const, text: message }];
    setChat(newChat);
    setMessage('');

    const res = await fetch('/api/agent', {
      method: 'POST',
      body: JSON.stringify({ patientId: params.id, message })
    });
    const data = await res.json();

    setChat([...newChat, { role: 'agent' as const, text: data.message, reasoning: data.reasoning }]);
    setLoading(false);
    
    const pRes = await fetch(`/api/patient/${params.id}`);
    const pData = await pRes.json();
    setPatient(pData);
  };

  if (!patient) return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        style={{ border: '4px solid var(--p1)', borderTopColor: 'transparent', borderRadius: '50%', width: '40px', height: '40px' }}
      />
    </div>
  );

  return (
    <main className="container" style={{ maxWidth: '1200px' }}>
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="header" 
        style={{ textAlign: 'left', alignItems: 'flex-start' }}
      >
        <div className="status-dot-container" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', background: 'white', padding: '0.5rem 1.25rem', borderRadius: '100px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
          <span className="status-dot"></span>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', letterSpacing: '0.05em' }}>LIVE SESSION ACTIVE</span>
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginBottom: '0.5rem' }}>{patient.name}</h1>
        <p className="sub-header">Patient Diagnostic Portal • Medical ID: #{patient.id}</p>
      </motion.header>

      <div className="responsive-grid">
        {/* Status Section */}
        <section style={{ display: 'grid', gap: '2rem' }}>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card" 
            style={{ padding: '2.5rem', borderLeft: '8px solid var(--p1)' }}
          >
            <span className="label-mini">Current Station & Location</span>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Activity size={32} style={{ color: 'var(--p1)' }} />
              {patient.currentTest || 'COMPLETED'}
            </div>
            
            {/* Proactive Wayfinding */}
            {(patient as any).location && (
              <div style={{ marginBottom: '1.25rem', color: '#64748b', fontWeight: 600, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <MapPin size={18} style={{ color: 'var(--p1)' }} />
                Proceed to: {(patient as any).location}
              </div>
            )}

            <div style={{ background: 'var(--p1)', color: 'white', display: 'inline-flex', gap: '0.5rem', alignItems: 'center', padding: '0.5rem 1rem', borderRadius: '12px', fontSize: '0.875rem', fontWeight: 800 }}>
              <Clock size={16} />
              EST. WAIT: {patient.estimatedWaitTime} MIN
            </div>
          </motion.div>

          {/* Adaptive Scheduling Alert */}
          {(patient as any).adaptive_scheduling_needed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '1.5rem', borderRadius: '20px', color: '#991b1b', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}
            >
              <CalendarClock size={24} style={{ color: '#dc2626', flexShrink: 0 }} />
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: 800, fontSize: '1rem' }}>High Wait Time Detected</h3>
                <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', fontWeight: 500 }}>Your station is currently experiencing heavy load. You do not need to wait here.</p>
                <button 
                  onClick={() => { setMessage('I would like to reserve a later time.'); sendMessage(); }}
                  style={{ background: '#dc2626', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>
                  Reserve Later Time
                </button>
              </div>
            </motion.div>
          )}

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              <Info size={20} style={{ color: 'var(--p1)' }} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0 }}>Medical Instructions</h2>
            </div>
            {(patient as any).instructions?.length > 0 ? (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {(patient as any).instructions.map((inst: string, i: number) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + (i * 0.1) }}
                    key={i} 
                    style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'white', padding: '1.25rem', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 4px 6px rgba(0,0,0,0.01)' }}
                  >
                    <div style={{ minWidth: '32px', height: '32px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--p1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.875rem' }}>
                      {i + 1}
                    </div>
                    <p style={{ fontWeight: 600, fontSize: '0.95rem', margin: 0 }}>{inst}</p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', background: '#f8fafc', borderRadius: '20px' }}>
                <AlertCircle size={24} style={{ margin: '0 auto 0.5rem', opacity: 0.3 }} />
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>No specific instructions for this station.</p>
              </div>
            )}
          </motion.div>
        </section>

        {/* AI Agent Section */}
        <motion.section 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card" 
          style={{ display: 'flex', flexDirection: 'column', height: '700px', padding: '0', overflow: 'hidden' }}
        >
          <div style={{ padding: '2rem', borderBottom: '1px solid rgba(0,0,0,0.05)', background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(10px)', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: 'var(--p1)', color: 'white', padding: '0.75rem', borderRadius: '16px' }}>
                <Bot size={24} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0 }}>Hospital Assistant</h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.02em' }}>POWERED BY SMARTQUEUE AI • ACTIVE</p>
              </div>
            </div>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <AnimatePresence>
              {chat.length === 0 && (
                <div style={{ textAlign: 'center', marginTop: '4rem', opacity: 0.5 }}>
                  <BrainCircuit size={48} style={{ margin: '0 auto 1rem' }} />
                  <p style={{ fontWeight: 600 }}>I'm here to help with your diagnostic journey.</p>
                </div>
              )}
              {chat.map((c, i) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  key={i} 
                  style={{ alignSelf: c.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}
                >
                  <div style={{ display: 'flex', gap: '0.75rem', flexDirection: c.role === 'user' ? 'row-reverse' : 'row' }}>
                    <div style={{ minWidth: '32px', height: '32px', borderRadius: '50%', background: c.role === 'user' ? 'white' : 'var(--p1)', color: c.role === 'user' ? 'var(--p1)' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                      {c.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className={c.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-agent'}>
                      {c.text}
                    </div>
                  </div>
                  {c.reasoning && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      style={{ 
                        fontSize: '0.7rem', 
                        marginTop: '0.75rem', 
                        color: 'var(--p1)',
                        background: 'rgba(99, 102, 241, 0.05)',
                        padding: '0.6rem 1rem',
                        borderRadius: '100px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontWeight: 700,
                        marginLeft: '2.5rem'
                      }}
                    >
                      <BrainCircuit size={12} />
                      AI THINKING: {c.reasoning}
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {loading && (
              <div style={{ alignSelf: 'flex-start', background: 'white', padding: '1rem 1.5rem', borderRadius: '24px', display: 'flex', gap: '0.5rem', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
                <span className="status-dot" style={{ width: '8px', height: '8px' }}></span>
                <span className="status-dot" style={{ width: '8px', height: '8px', animationDelay: '0.2s' }}></span>
                <span className="status-dot" style={{ width: '8px', height: '8px', animationDelay: '0.4s' }}></span>
              </div>
            )}
          </div>
          
          <div style={{ padding: '2rem', background: '#f8fafc', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input 
                className="input-luxury" 
                placeholder="Ask about your station, wait time..." 
                value={message}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                onChange={e => setMessage(e.target.value)}
                style={{ background: 'white', borderRadius: '100px', fontSize: '1rem' }}
              />
              <button 
                className="btn-premium" 
                onClick={sendMessage} 
                disabled={loading || !message.trim()}
                style={{ borderRadius: '50%', width: '56px', height: '56px', padding: 0, minWidth: '56px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {loading ? <Clock size={20} /> : <Send size={20} />}
                </div>
              </button>
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  );
}

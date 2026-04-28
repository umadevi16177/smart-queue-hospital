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
  CalendarClock,
  Sparkles,
  LogOut,
  CheckCircle2
} from 'lucide-react';

export default function PatientPortal() {
  const params = useParams();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<{ role: 'user' | 'agent', text: string, reasoning?: string, tool?: string }[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [showSurvey, setShowSurvey] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [surveySubmitted, setSurveySubmitted] = useState(false);

  // PLATINUM REAL-TIME SYNC
  useEffect(() => {
    const fetchData = () => {
      fetch(`/api/patient/${params.id}`)
        .then(res => res.json())
        .then(data => setPatient(data));
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [params.id]);

  const submitSurvey = async () => {
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient_id: params.id, rating, comments: feedback })
      });
      setSurveySubmitted(true);
      setTimeout(() => window.location.href='/patient', 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;
    
    // Voice-enabled IVR logic
    const speak = (text: string) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    };

    setLoading(true);
    const newChat = [...chat, { role: 'user' as const, text: message }];
    setChat(newChat);
    setMessage('');

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient_id: params.id, message })
      });
      const data = await res.json();
      setChat([...newChat, { role: 'agent' as const, text: data.message, reasoning: data.reasoning, tool: data.tool_used }]);
      speak(data.message);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  if (!patient) return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ border: '4px solid var(--platinum-indigo)', borderTopColor: 'transparent', borderRadius: '50%', width: '40px', height: '40px' }} />
    </div>
  );

  return (
    <main className="container" style={{ maxWidth: '1400px', padding: '3rem' }}>
      <div className="mesh-bg"></div>

      <motion.header 
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4rem' }}
      >
        <div>
          <div className="status-pill" style={{ marginBottom: '1.5rem' }}>
            <span className="pulse-emerald"></span>
            PLATINUM CONNECTED • LIVE SESSION
          </div>
          <h1 style={{ fontSize: '5rem', fontWeight: 900, letterSpacing: '-4px', marginBottom: '1rem' }} className="text-gradient">
            {patient.name}
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Medical Identification: <span style={{ color: 'var(--platinum-indigo)' }}>#{patient.id.toUpperCase()}</span>
          </p>
        </div>
        <button onClick={() => setShowSurvey(true)} className="btn-premium" style={{ background: '#fff', color: '#000', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <LogOut size={18} />
          Safe Release
        </button>
      </motion.header>

      <div className="platinum-grid">
        <div style={{ display: 'grid', gap: '2.5rem' }}>
          {/* Main Status */}
          <motion.section 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card"
            style={{ borderLeft: '12px solid var(--platinum-indigo)', position: 'relative', overflow: 'hidden' }}
          >
            <Sparkles style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: 'var(--platinum-indigo)', opacity: 0.2 }} size={48} />
            <span style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--platinum-indigo)', letterSpacing: '0.1em' }} >Active Station</span>
            <h2 style={{ fontSize: '3.5rem', fontWeight: 900, margin: '0.5rem 0 1.5rem 0', color: 'var(--platinum-dark)' }}>
              {(patient as any).current_test || 'JOURNEY COMPLETE'}
            </h2>
            
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(79, 70, 229, 0.1)', padding: '0.75rem 1.25rem', borderRadius: '16px', color: 'var(--platinum-indigo)', fontWeight: 900 }}>
                <Activity size={20} />
                SEQ #{ (patient as any).queue_position || '-' }
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem 1.25rem', borderRadius: '16px', color: 'var(--platinum-emerald)', fontWeight: 700 }}>
                <Clock size={20} />
                {(patient as any).estimated_wait_time} MIN WAIT
              </div>
            </div>

            {/* DIGITAL FLOOR PLAN MOCKUP */}
            <div style={{ marginBottom: '2rem', padding: '2rem', background: '#f8fafc', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
               <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#64748b', marginBottom: '1rem', textTransform: 'uppercase' }}>Digital Floor Plan</div>
               <div style={{ height: '150px', background: '#fff', borderRadius: '12px', border: '2px dashed #cbd5e1', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', padding: '4px' }}>
                  {['Wing A', 'Wing B', 'Wing C', 'Wing D'].map(wing => (
                    <div key={wing} style={{ 
                      background: (patient as any).location?.includes(wing) ? 'rgba(79, 70, 229, 0.1)' : '#f1f5f9',
                      border: (patient as any).location?.includes(wing) ? '2px solid var(--platinum-indigo)' : 'none',
                      borderRadius: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.6rem',
                      fontWeight: 800,
                      color: (patient as any).location?.includes(wing) ? 'var(--platinum-indigo)' : '#64748b'
                    }}>
                       {wing}
                       {(patient as any).location?.includes(wing) && <MapPin size={12} style={{ marginTop: '4px' }} />}
                    </div>
                  ))}
               </div>
            </div>

            {(patient as any).instructions && (
              <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', gap: '1rem' }}>
                <div style={{ color: 'var(--platinum-indigo)' }}> <Info size={24} /> </div>
                <div>
                   <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.25rem' }}>AI Wayfinding Protocol</div>
                   <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500, lineHeight: 1.5 }}>
                     {(patient as any).instructions}
                   </div>
                </div>
              </div>
            )}
          </motion.section>

          {/* Journey Path */}
          <motion.section initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass-card">
            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ChevronRight size={24} style={{ color: 'var(--platinum-indigo)' }} />
              Prescribed Roadmap
            </h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {(patient as any).requested_tests?.map((test: string, i: number) => {
                const isCurrent = test === (patient as any).current_test;
                const isDone = (patient as any).completed_tests?.includes(test);
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem 2rem', background: isCurrent ? '#fff' : 'rgba(0,0,0,0.01)', borderRadius: '24px', border: isCurrent ? '2px solid var(--platinum-indigo)' : '1px solid rgba(0,0,0,0.05)', opacity: isDone ? 0.6 : 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{ padding: '0.3rem 0.6rem', background: '#f1f5f9', borderRadius: '8px', fontSize: '0.6rem', fontWeight: 900, color: '#64748b' }}> #{i + 1} </div>
                        <span style={{ fontWeight: 800, color: isCurrent ? 'var(--platinum-indigo)' : 'var(--platinum-dark)', fontSize: '1.1rem' }}>{test}</span>
                      </div>
                      {isDone ? <div style={{ color: 'var(--platinum-emerald)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 900, fontSize: '0.7rem' }}> <CheckCircle2 size={14} /> VERIFIED </div> : <div style={{ padding: '0.25rem 0.75rem', borderRadius: '100px', fontSize: '0.65rem', fontWeight: 900, background: isCurrent ? 'var(--platinum-indigo)' : '#e2e8f0', color: isCurrent ? '#fff' : '#64748b' }}> {isCurrent ? 'NEXT STATION' : 'IN QUEUE'} </div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.section>
        </div>

        {/* AGENTIC CONCIERGE */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} style={{ display: 'flex', flexDirection: 'column', height: '800px' }} className="glass-card" >
           <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', background: 'var(--platinum-indigo)', borderRadius: '16px', color: 'white' }}><Bot size={28} /></div>
            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 900 }}>Platinum Concierge</h3>
              <p style={{ fontSize: '0.7rem', color: 'var(--platinum-emerald)', fontWeight: 800, letterSpacing: '0.05em' }}>AGENTIC AI SYSTEM ACTIVE</p>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingRight: '1rem' }}>
            {chat.map((c, i) => (
              <div key={i} style={{ alignSelf: c.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '90%' }}>
                <div className={c.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-agent'}>{c.text}</div>
                {c.reasoning && <div style={{ fontSize: '0.6rem', color: 'var(--platinum-indigo)', marginTop: '0.4rem', fontWeight: 700 }}>{c.reasoning}</div>}
              </div>
            ))}
            {loading && <div style={{ opacity: 0.5 }}>Concierge is thinking...</div>}
          </div>
          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
            <input value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Ask the concierge..." style={{ flex: 1, padding: '1rem 1.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)', outline: 'none', background: 'white' }} />
            <button onClick={sendMessage} className="btn-premium" style={{ width: '56px', height: '56px', padding: 0, borderRadius: '50%' }}><Send size={24} /></button>
          </div>
        </motion.div>
      </div>

      {/* RELEASE SURVEY MODAL */}
      <AnimatePresence>
        {showSurvey && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
             <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ maxWidth: '450px', width: '100%', padding: '3rem', textAlign: 'center' }}>
                {!surveySubmitted ? (
                  <>
                    <Sparkles style={{ margin: '0 auto 1.5rem', color: 'var(--platinum-indigo)' }} size={48} />
                    <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '1rem' }}>Rate Your Experience</h2>
                    <p style={{ color: '#64748b', marginBottom: '2rem', fontWeight: 600 }}>Thank you for using SmartQueue AI. How was your diagnostic journey today?</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                       {[1,2,3,4,5].map(star => (
                         <button key={star} onClick={() => setRating(star)} style={{ fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', opacity: star <= rating ? 1 : 0.2 }}>⭐️</button>
                       ))}
                    </div>
                    <textarea value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Any specific comments for the clinical team?" style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '2rem', height: '100px', outline: 'none' }} />
                    <button onClick={submitSurvey} className="btn-premium" style={{ width: '100%', padding: '1.25rem' }}>Submit Feedback</button>
                    <button onClick={() => setShowSurvey(false)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.8rem', marginTop: '1rem', cursor: 'pointer', fontWeight: 700 }}>Continue Session</button>
                  </>
                ) : (
                  <div style={{ padding: '2rem' }}>
                     <div style={{ width: '60px', height: '60px', background: 'var(--platinum-emerald)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'white' }}> <CheckCircle2 size={32} /> </div>
                     <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Feedback Received</h3>
                     <p style={{ color: '#64748b', fontWeight: 600 }}>Thank you for helping us optimize healthcare transparency.</p>
                  </div>
                )}
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}

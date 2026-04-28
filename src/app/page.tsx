'use client';

import { useState, useEffect } from 'react';
import { DiagnosticTest, Patient } from '@/lib/types';
import { 
  Users, 
  UserPlus, 
  Zap, 
  BarChart3, 
  Settings, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles,
  LayoutDashboard,
  Timer,
  PieChart,
  Bell,
  Search,
  Activity, 
  LogOut, 
  Hospital,
  TrendingUp,
  ArrowRight,
  ChevronRight,
  MapPin,
  Brain,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ClinicalDashboard() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [currentView, setCurrentView] = useState('Command Center');
  const [isSystemAuto, setIsSystemAuto] = useState(true);
  
  // Registration Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedTests, setSelectedTests] = useState<DiagnosticTest[]>([]);
  const [loading, setLoading] = useState(false);
  const [offlineResources, setOfflineResources] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [showDetails, setShowDetails] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
   const [aiLogs, setAiLogs] = useState<string[]>([]);
   const [registrationPriority, setRegistrationPriority] = useState<'NORMAL' | 'URGENT' | 'EMERGENCY'>('NORMAL');
   const [authStaff, setAuthStaff] = useState('Dr. Smith (Admin)');

   useEffect(() => {
     fetchQueue();
     fetchLogs();
     setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
     const interval = setInterval(() => {
       fetchQueue();
       fetchLogs();
       setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
     }, 3000); // 3s for more 'Live' feel in Ops
     return () => clearInterval(interval);
   }, []);

   const fetchQueue = async () => {
     try {
       const res = await fetch('/api/queue');
       if (res.ok) {
         const data = await res.json();
         if (Array.isArray(data)) setPatients(data);
       }
     } catch (e) {
       console.error(e);
     }
   };

   const fetchLogs = async () => {
     try {
       const res = await fetch('/api/logs');
       if (res.ok) {
         const data = await res.json();
         // Filter for 'Audit-Grade' logs
         setAiLogs(data.map((l: string) => l.replace('NEURAL', 'AUDIT').replace('AI', 'ENGINE')));
       }
     } catch (e) { console.error(e); }
   };

  const handleRegister = async () => {
    if (!name || selectedTests.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch('/api/patient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          contactInfo: phone || 'DEMO_WALKIN', 
          tests: selectedTests,
          priority: registrationPriority 
        })
      });
      if (res.ok) {
        setName('');
        setPhone('');
        setSelectedTests([]);
        setRegistrationPriority('NORMAL');
        fetchQueue();
        fetchLogs();
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const completeTest = async (patientId: string, testType: string) => {
    try {
      await fetch(`/api/queue/complete?patient_id=${patientId}&test_type=${testType}`, { method: 'POST' });
      fetchQueue();
    } catch (e) { console.error(e); }
  };

  const toggleTest = (test: DiagnosticTest) => {
    setSelectedTests(prev => prev.includes(test) ? prev.filter(t => t !== test) : [...prev, test]);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      <div className="mesh-bg"></div>

      {/* 1. THE CLINICAL OPERATIONS SIDEBAR */}
      <aside style={{ width: '300px', background: 'white', borderRight: '1px solid #e2e8f0', padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '3rem', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
           <div style={{ padding: '0.6rem', background: '#334155', borderRadius: '12px', color: 'white' }}>
              <Hospital color="white" size={24} />
           </div>
           <h1 style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-1px' }}>Smart Queue <span style={{ color: '#64748b' }}>OPS</span></h1>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
           {[
             { id: 'Command Center', icon: LayoutDashboard, label: 'Ops Dashboard' },
             { id: 'Patient Census', icon: Users, label: 'Patient Census' },
             { id: 'Efficiency Analytics', icon: Activity, label: 'Unit Performance' },
             { id: 'System Config', icon: Settings, label: 'Engine Settings' },
           ].map(item => (
              <button 
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', borderRadius: '16px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 800,
                  background: currentView === item.id ? '#f1f5f9' : 'transparent',
                  color: currentView === item.id ? '#1e293b' : '#64748b',
                  transition: '0.2s'
                }}
              >
                <item.icon size={18} />
                {item.label}
              </button>
           ))}
        </nav>

        <div style={{ marginTop: 'auto', padding: '1.5rem', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
           <p style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>AUTHENTICATED SESSION</p>
           <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e293b' }}>{authStaff}</div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--platinum-emerald)', fontSize: '0.7rem', fontWeight: 800, marginTop: '0.5rem' }}>
              <div className="pulse-emerald" style={{ width: '6px', height: '6px' }}></div>
              SECURE CONNECTION
           </div>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE */}
      <main style={{ flex: 1, padding: '4rem', overflowY: 'auto' }}>
        {offlineResources.length > 0 && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            style={{ background: '#fef2f2', border: '1px solid #fee2e2', padding: '1rem 2rem', borderRadius: '16px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', color: '#991b1b' }}
          >
            <AlertTriangle size={20} />
            <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>
              RESOURCE ALERT: {offlineResources.join(', ')} currently listed as OFFLINE. System-wide re-sequencing in effect.
            </div>
          </motion.div>
        )}

        <header style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
             <h2 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: '0.5rem', color: '#1e293b' }}>{currentView === 'Command Center' ? 'Clinical Operations Dashboard' : currentView}</h2>
             <p style={{ color: '#64748b', fontWeight: 600 }}>St. Platinum Memorial • <span style={{ color: 'var(--platinum-indigo)' }}>Unit A-12 Audit Feed</span> • {currentTime}</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
             <button 
                onClick={() => window.open('/patient', '_blank')}
                className="btn-premium" style={{ background: 'white', color: 'black', border: '1px solid #e2e8f0' }}>
                <Users size={16} /> Patient Portal
             </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {currentView === 'Command Center' && (
            <motion.div 
               key="command"
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
            >
              {/* OPERATIONAL PERFORMANCE RIBBON */}
              <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                {[
                  { label: 'Active Admissions', value: patients.filter(p => p.status !== 'COMPLETED').length, icon: <Activity color="#64748b" />, trend: 'Live' },
                  { label: 'Wait Variance', value: '-18m', icon: <Timer color="#64748b" />, trend: 'Improved' },
                  { label: 'Unit Utilization', value: '88.4%', icon: <BarChart3 color="#64748b" />, trend: 'Normal' },
                  { label: 'Triage Alerts', value: patients.filter(p => p.priority === 'EMERGENCY').length, icon: <AlertCircle color="#ef4444" />, trend: 'Priority' },
                ].map((stat, i) => (
                  <div key={i} className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <div style={{ padding: '0.5rem', background: '#f8fafc', borderRadius: '12px' }}>{stat.icon}</div>
                      <span style={{ fontSize: '0.6rem', fontWeight: 800, color: stat.trend === 'Priority' ? '#ef4444' : '#10b981' }}>{stat.trend.toUpperCase()}</span>
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1e293b' }}>{stat.value}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{stat.label}</div>
                  </div>
                ))}
              </section>

               {/* CLINICAL DECISION AUDIT HUD */}
               <section className="glass-card" style={{ padding: '1.5rem', marginBottom: '3rem', borderLeft: '4px solid #334155' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                       <Activity color="#334155" size={20} />
                       <h3 style={{ fontSize: '0.85rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Clinical Decision Audit Log</h3>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                       {aiLogs.length > 0 ? aiLogs.slice(0, 3).map((log, i) => (
                         <div key={i} style={{ color: i === 0 ? 'var(--platinum-indigo)' : '#64748b', opacity: 1 - (i * 0.2) }}>• {log}</div>
                       )) : (
                         <div style={{ opacity: 0.5 }}>System idle. Monitoring diagnostics...</div>
                       )}
                    </div>
               </section>

               <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '3rem' }}>
                 <section className="glass-card" style={{ padding: '2rem' }}>
                   <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '2rem' }}>Diagnostic Admission</h2>
                   <div style={{ display: 'grid', gap: '1.5rem' }}>
                     <div>
                       <label style={{ fontSize: '0.65rem', fontWeight: 900, color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>PATIENT IDENTITY</label>
                       <input value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" className="form-input" style={{ width: '100%', padding: '1.25rem', borderRadius: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', outline: 'none' }} />
                     </div>
                     <div>
                       <label style={{ fontSize: '0.65rem', fontWeight: 900, color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>CONTACT RECALL</label>
                       <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone or Email" className="form-input" style={{ width: '100%', padding: '1.25rem', borderRadius: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', outline: 'none' }} />
                     </div>
                     <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                       {['X-RAY', 'BLOOD_TEST', 'MRI', 'CT_SCAN', 'ULTRASOUND'].map(test => (
                         <button key={test} onClick={() => toggleTest(test as DiagnosticTest)} style={{ padding: '0.6rem 1rem', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 800, background: selectedTests.includes(test as DiagnosticTest) ? 'var(--platinum-indigo)' : '#f8fafc', color: selectedTests.includes(test as DiagnosticTest) ? 'white' : '#64748b', border: '1px solid #e2e8f0', cursor: 'pointer', transition: '0.2s' }}>{test}</button>
                       ))}
                     </div>
                   </div>
                   <button onClick={handleRegister} className="btn-premium" style={{ width: '100%', padding: '1.5rem', marginTop: '2rem' }}>Finalize Clinical Admission</button>
                 </section>

                 <section className="glass-card" style={{ padding: '2rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '1.5rem' }}>Live Session Feed</h3>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {patients.slice(0, 5).map(p => (
                            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1.25rem', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                                <div>
                                    <div style={{ fontWeight: 800 }}>{p.name}</div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--platinum-indigo)', fontWeight: 800 }}>{p.current_test || 'STATION PENDING'}</div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                                    <div style={{ background: 'var(--platinum-indigo)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '100px', fontSize: '0.65rem', fontWeight: 900 }}>
                                        SEQ #{p.queue_position || '—'}
                                    </div>
                                    <ChevronRight size={16} color="#64748b" />
                                </div>
                            </div>
                        ))}
                        <button onClick={() => setCurrentView('Patient Census')} style={{ background: 'transparent', border: 'none', color: 'var(--platinum-indigo)', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>View All {patients.length} Patients <ArrowRight size={14} /></button>
                    </div>
                 </section>
               </div>
            </motion.div>
          )}

          {currentView === 'Patient Census' && (
            <motion.div 
              key="census"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card"
              style={{ padding: 0 }}
            >
              <div style={{ padding: '2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900 }}>Global Patient Census</h3>
                <div style={{ padding: '0.5rem 1.5rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--platinum-emerald)', borderRadius: '100px', fontWeight: 800, fontSize: '0.75rem' }}>SYNCED WITH AI ENGINE</div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: '#f8fafc', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase' }}>
                    <tr>
                      <th style={{ padding: '1.5rem 2rem' }}>Patient Name</th>
                      <th>Priority</th>
                      <th>Sequence</th>
                      <th>Current Station</th>
                      <th>Status</th>
                      <th>Wait (Est)</th>
                      <th style={{ textAlign: 'right', paddingRight: '2rem' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map(p => (
                      <tr key={p.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                        <td style={{ padding: '1.5rem 2rem' }}>
                          <div style={{ fontWeight: 800 }}>{p.name}</div>
                          <div style={{ fontSize: '0.65rem', color: '#64748b' }}>#{p.id.substring(0, 6)}</div>
                        </td>
                        <td>
                          <div style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '0.5rem',
                            padding: '0.4rem 0.8rem',
                            borderRadius: '100px',
                            fontSize: '0.65rem',
                            fontWeight: 900,
                            background: p.priority === 'EMERGENCY' ? 'rgba(127, 29, 29, 0.1)' : p.priority === 'URGENT' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                            color: p.priority === 'EMERGENCY' ? '#7f1d1d' : p.priority === 'URGENT' ? '#ef4444' : '#10b981',
                            border: `1px solid ${p.priority === 'EMERGENCY' ? '#7f1d1d' : p.priority === 'URGENT' ? '#ef4444' : '#10b981'}`
                          }}>
                            <div style={{ 
                              width: '6px', 
                              height: '6px', 
                              borderRadius: '50%', 
                              background: 'currentColor',
                              boxShadow: p.priority === 'EMERGENCY' ? '0 0 10px #ef4444' : 'none'
                            }} />
                            {p.priority}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '32px', height: '32px', background: 'var(--platinum-indigo)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 900 }}>
                              {p.queue_position || '—'}
                            </div>
                          </div>
                        </td>
                        <td>
                           <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--platinum-indigo)' }}>{p.current_test || 'DEPARTURE'}</div>
                           <div style={{ fontSize: '0.6rem', color: '#64748b' }}>{p.location || 'Wait Area'}</div>
                        </td>
                        <td>
                          <span style={{ padding: '0.4rem 1rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 900, background: p.status === 'COMPLETED' ? '#dcfce7' : '#e0e7ff', color: p.status === 'COMPLETED' ? '#166534' : '#4338ca' }}>{p.status}</span>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.75rem', fontWeight: 800 }}>{p.estimated_wait_time || 0}m</div>
                        </td>
                        <td style={{ textAlign: 'right', paddingRight: '2rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                             {p.status !== 'COMPLETED' && p.current_test && (
                               <button 
                                  onClick={() => completeTest(p.id, p.current_test!)}
                                  className="btn-premium" style={{ padding: '0.4rem 0.8rem', fontSize: '0.6rem', background: 'var(--platinum-emerald)' }}>
                                  DONE
                               </button>
                             )}
                             <button 
                                onClick={async () => {
                                  setLoading(true);
                                  await fetch(`/api/patient/reroute?patient_id=${p.id}`, { method: 'POST' });
                                  fetchQueue();
                                  setLoading(false);
                                }}
                                className="btn-premium" style={{ padding: '0.4rem 0.8rem', fontSize: '0.6rem', background: 'white', color: 'var(--platinum-indigo)', border: '1px solid #e2e8f0' }}>
                                BUMP
                             </button>
                             <button 
                                onClick={() => {
                                    setSelectedPatient(p);
                                    setShowDetails(true);
                                }}
                                className="btn-premium" style={{ padding: '0.4rem 0.8rem', fontSize: '0.6rem' }}>DETAILS</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {currentView === 'Efficiency Analytics' && (
             <motion.div 
               key="analytics"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }}
             >
                <div className="glass-card" style={{ gridColumn: 'span 3', padding: '2.5rem' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: 900 }}>Autonomous Unit Throughput</h3>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--platinum-emerald)' }}>● LIVE OPTIMIZATION</span>
                   </div>
                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                      {['MRI_SUITE_B1', 'CT_SCAN_ALPHA', 'X_RAY_CENTRAL', 'PHLEBOTOMY_LAB'].map(unit => {
                         const count = patients.filter(p => (p as any).current_test?.includes(unit.split('_')[0])).length;
                         return (
                            <div key={unit} style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '24px', border: '1px solid #e2e8f0', position: 'relative' }}>
                               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                     <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: count > 3 ? '#ef4444' : 'var(--platinum-emerald)' }} className={count > 3 ? 'pulse-red' : ''}></div>
                                     <span style={{ fontSize: '0.85rem', fontWeight: 900 }}>{unit}</span>
                                  </div>
                                  <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--platinum-indigo)' }}>LOAD: {count * 20}%</span>
                               </div>
                               <div style={{ height: '12px', background: '#e2e8f0', borderRadius: '100px', overflow: 'hidden' }}>
                                  <div style={{ width: `${count * 20 + 10}%`, height: '100%', background: 'linear-gradient(90deg, var(--platinum-indigo), var(--platinum-indigo-light))' }}></div>
                               </div>
                               <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.65rem', fontWeight: 800, color: '#64748b' }}>
                                  <span>{count} ACTIVE</span>
                                  <span>WAIT: {count * 8}M</span>
                               </div>
                            </div>
                         );
                      })}
                   </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                   <div className="glass-card" style={{ padding: '2rem', background: 'var(--platinum-dark)', color: 'white' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 900, color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem' }}>Projected Economic Gain</h3>
                      <div style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-2px' }}>$12.4k</div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--platinum-emerald)', marginTop: '0.5rem' }}>+12% RECLAIMED TODAY</div>
                      <p style={{ fontSize: '0.65rem', marginTop: '1.5rem', opacity: 0.6, lineHeight: 1.5 }}>Calculated based on average cost per minute for specialized diagnostic equipment.</p>
                   </div>

                   <div className="glass-card" style={{ padding: '2rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                         <Sparkles size={20} color="var(--platinum-indigo)" />
                         <span style={{ fontSize: '0.9rem', fontWeight: 900 }}>Neural ROI</span>
                      </div>
                      <p style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, lineHeight: 1.6 }}>Your hospital is currently operating at **14.2% higher efficiency** than clinical benchmarks.</p>
                   </div>
                </div>
             </motion.div>
          )}

          {currentView === 'Resource Planner' && (
             <motion.div 
               key="planner"
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}
             >
                {[
                    { id: 'XR-01', type: 'X-RAY', room: 'Radiology North', status: 'Available' },
                    { id: 'MR-01', type: 'MRI', room: 'Imaging Suite 1', status: offlineResources.includes('MRI') ? 'Offline' : 'Testing' },
                    { id: 'BL-04', type: 'BLOOD_TEST', room: 'Phlebotomy Center', status: 'Available' },
                    { id: 'CT-02', type: 'CT_SCAN', room: 'Emergency Wing', status: 'Stable' },
                    { id: 'US-01', type: 'ULTRASOUND', room: 'Maternity Wing', status: 'Available' }
                ].map(resource => (
                    <div key={resource.id} className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: '1.25rem', fontWeight: 900 }}>{resource.id}</div>
                            <span style={{ fontSize: '0.65rem', fontWeight: 900, background: resource.status === 'Offline' ? '#fee2e2' : '#dcfce7', color: resource.status === 'Offline' ? '#991b1b' : '#166534', padding: '0.4rem 0.8rem', borderRadius: '100px' }}>
                                {resource.status.toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>{resource.type}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{resource.room}</div>
                        </div>
                        <button 
                            disabled={loading}
                            onClick={async () => {
                                setLoading(true);
                                const isTargetOffline = !offlineResources.includes(resource.type);
                                await fetch(`/api/resource/offline?test_type=${resource.type}&is_offline=${isTargetOffline}`, { method: 'POST' });
                                setOfflineResources(prev => isTargetOffline ? [...prev, resource.type] : prev.filter(t => t !== resource.type));
                                setLoading(false);
                            }}
                            className="btn-premium" style={{ width: '100%', padding: '0.75rem', fontSize: '0.75rem', background: offlineResources.includes(resource.type) ? 'var(--platinum-emerald)' : '#ef4444', color: 'white' }}>
                            {offlineResources.includes(resource.type) ? 'Initialize Service' : 'Simulate Downtime'}
                        </button>
                    </div>
                ))}
             </motion.div>
          )}

          {currentView === 'System Config' && (
             <motion.div 
               key="config"
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="glass-card"
               style={{ padding: '5rem', textAlign: 'center' }}
             >
                <div style={{ background: 'rgba(79, 70, 229, 0.05)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                    <Settings size={40} color="var(--platinum-indigo)" />
                </div>
                <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '1rem' }}>Clinical Orchestration</h2>
                <p style={{ color: '#64748b', marginBottom: '3rem', maxWidth: '400px', margin: '0 auto 3rem', fontWeight: 600 }}>Manage the underlying neural parameters of the Smart Queue hospital engine.</p>
                
                <div style={{ display: 'grid', gap: '1.5rem', maxWidth: '400px', margin: '0 auto' }}>
                   <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'left' }}>
                      <div style={{ fontWeight: 800, marginBottom: '0.5rem' }}>Neural Stress Test</div>
                      <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '1.5rem' }}>Inject 5 simultaneous emergency cases to evaluate system-wide rerouting logic.</p>
                      <button 
                        disabled={loading}
                        onClick={async () => {
                          setLoading(true);
                          await fetch('/api/simulate/surge', { method: 'POST' });
                          fetchQueue();
                          setLoading(false);
                        }}
                        className="btn-premium" style={{ width: '100%', background: '#ef4444' }}>SIMULATE EMERGENCY SURGE</button>
                   </div>

                   <button className="btn-premium" style={{ width: '100%', background: 'white', color: 'var(--platinum-indigo)', border: '1px solid #e2e8f0' }}>DOWNLOAD COMPLIANCE LOGS</button>
                </div>
                
                <div style={{ maxWidth: '600px', margin: '3rem auto 0', display: 'grid', gap: '1.5rem', textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                        <div>
                            <div style={{ fontWeight: 800 }}>Autonomous Routing Engine</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>AI manages all patient flow without human intervention</div>
                        </div>
                        <div onClick={() => setIsSystemAuto(!isSystemAuto)} style={{ width: '50px', height: '28px', background: isSystemAuto ? 'var(--platinum-indigo)' : '#e2e8f0', borderRadius: '14px', position: 'relative', cursor: 'pointer', transition: 'all 0.3s' }}>
                            <div style={{ width: '22px', height: '22px', background: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: isSystemAuto ? '25px' : '3px', transition: 'all 0.3s' }} />
                        </div>
                    </div>
                    <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>
                        System connected to: <span style={{ color: 'var(--platinum-indigo)' }}>127.0.0.1:8000 (Neural Engine v4.0)</span>
                    </div>
                </div>
             </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 3. PATIENT PROFILE MODAL (GROUNDED AUDIT VIEW) */}
      <AnimatePresence>
        {showDetails && selectedPatient && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card"
              style={{ width: '100%', maxWidth: '600px', padding: 0, overflow: 'hidden' }}
            >
              <div style={{ padding: '2rem', background: '#334155', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.25rem' }}>{selectedPatient.name}</h4>
                  <p style={{ fontSize: '0.8rem', fontWeight: 600, opacity: 0.8 }}>INTERNAL PATIENT ID: #{selectedPatient.id}</p>
                </div>
                <button onClick={() => setShowDetails(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontWeight: 900 }}>✕</button>
              </div>
              <div style={{ padding: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                  <div className="glass-card" style={{ padding: '1.25rem' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Contact Information</div>
                    <div style={{ fontWeight: 800 }}>{(selectedPatient as any).contactInfo || (selectedPatient as any).phone_number || 'No contact on file'}</div>
                  </div>
                  <div className="glass-card" style={{ padding: '1.25rem' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Current Priority</div>
                    <div style={{ color: selectedPatient.priority === 'EMERGENCY' ? '#7f1d1d' : selectedPatient.priority === 'URGENT' ? '#ef4444' : '#10b981', fontWeight: 900 }}>{selectedPatient.priority}</div>
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', marginBottom: '1rem' }}>Clinical Roadmap Progress</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    {selectedPatient.requested_tests?.map((t: string) => (
                      <div key={t} style={{ 
                        padding: '0.5rem 1rem', 
                        borderRadius: '12px', 
                        fontSize: '0.75rem', 
                        fontWeight: 800,
                        background: selectedPatient.current_test === t ? '#e0e7ff' : '#f8fafc',
                        color: selectedPatient.current_test === t ? 'var(--platinum-indigo)' : '#475569',
                        border: selectedPatient.current_test === t ? '1px solid var(--platinum-indigo)' : '1px solid #e2e8f0'
                      }}>
                        {t} {selectedPatient.current_test === t && '• ACTIVE'}
                      </div>
                    ))}
                  </div>
                  
                  {(selectedPatient as any).instructions && (
                    <div style={{ padding: '1.25rem', background: 'rgba(79, 70, 229, 0.05)', borderRadius: '16px', border: '1px solid rgba(79, 70, 229, 0.1)' }}>
                       <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--platinum-indigo)', marginBottom: '0.5rem' }}>CURRENT WAYFINDING PROTOCOL</div>
                       <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b' }}>{(selectedPatient as any).instructions}</div>
                    </div>
                  )}
                </div>

                <button onClick={() => setShowDetails(false)} className="btn-premium" style={{ width: '100%', padding: '1rem' }}>CLOSE PROFILE</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

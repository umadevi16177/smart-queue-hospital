'use client';

import { useState, useEffect } from 'react';
import { DiagnosticTest, Patient } from '@/lib/types';
import { Clock } from 'lucide-react';

export default function ClinicalDashboard() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isSystemAuto, setIsSystemAuto] = useState(true);
  
  // Registration Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedTests, setSelectedTests] = useState<DiagnosticTest[]>([]);
  const [loading, setLoading] = useState(false);
  const [offlineResources, setOfflineResources] = useState<string[]>([]);

  // Time State
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(() => {
      fetchQueue();
      setCurrentTime(new Date().toLocaleTimeString());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchQueue = async () => {
    try {
      const res = await fetch('/api/queue');
      // Simulated response if endpoint doesn't return list natively yet
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setPatients(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRegister = async () => {
    if (!name || !phone || selectedTests.length === 0) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/patient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, contactInfo: phone, tests: selectedTests })
      });
      if (res.ok) {
        setName('');
        setPhone('');
        setSelectedTests([]);
        fetchQueue();
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const toggleTest = (test: DiagnosticTest) => {
    if (selectedTests.includes(test)) {
      setSelectedTests(selectedTests.filter(t => t !== test));
    } else {
      setSelectedTests([...selectedTests, test]);
    }
  };

  const toggleUrgency = async (id: string, currentPriority: string) => {
    // In a real app, this would hit an API.
    // For now we optimistically update the state.
    setPatients(patients.map(p => 
      p.id === id ? { ...p, priority: currentPriority === 'URGENT' ? 'NORMAL' : 'URGENT' } : p
    ));
  };

  const nowServing = patients.length > 0 
    ? patients.reduce((prev, current) => (prev.priority === 'URGENT' ? prev : current))
    : null;

  const toggleOffline = async (testType: string) => {
    const willBeOffline = !offlineResources.includes(testType);
    try {
      const res = await fetch(`/api/resource/offline?test_type=${testType}&is_offline=${willBeOffline}`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setOfflineResources(data.offline_resources);
        fetchQueue(); // Refresh queue to show re-routing
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="dashboard-layout">
      {/* 1. HEADER */}
      <header className="header">
        <div className="header-title">SmartQueue</div>
        
        <div className="header-controls">
          <div className="system-mode">
            <span style={{color: '#9ca3af', fontWeight: 500}}>{currentTime}</span>
          </div>

          <div className={`system-mode ${isSystemAuto ? 'mode-auto' : 'mode-manual'}`}>
            <div className="mode-dot"></div>
            System Mode: {isSystemAuto ? 'AUTO' : 'MANUAL'}
          </div>

          <button 
            className="btn-danger"
            onClick={() => setIsSystemAuto(!isSystemAuto)}
          >
            Manual Override
          </button>
        </div>
      </header>

      <div className="main-content">
        {/* 2. LEFT PANEL */}
        <section className="left-panel">
          <h2 className="panel-title">Patient Registration</h2>
          
          <div className="form-group">
            <label className="form-label">Patient Name</label>
            <input 
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jane Doe"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input 
              className="form-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +1 555-0123"
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{marginTop: '1rem'}}>Select Tests</label>
            <div className="test-grid">
              {['X-RAY', 'BLOOD_TEST', 'MRI', 'CT_SCAN', 'ULTRASOUND'].map((test) => (
                <button
                  key={test}
                  className="test-btn"
                  data-selected={selectedTests.includes(test as DiagnosticTest)}
                  onClick={() => toggleTest(test as DiagnosticTest)}
                >
                  {test.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <button 
            className="btn-primary"
            onClick={handleRegister}
            disabled={loading || !name || selectedTests.length === 0}
          >
            {loading ? 'Registering...' : 'Register Patient'}
          </button>
        </section>

        {/* 3. RIGHT PANEL */}
        <section className="right-panel">
          <div className="top-banner">
            {nowServing ? `Now Serving: Token #${nowServing.id.substring(0, 6).toUpperCase()}` : 'No Patients in Queue'}
          </div>

          <div style={{ background: '#f8fafc', padding: '1rem 2rem', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--text-muted)' }}>RESOURCE STATUS:</span>
            {['X-RAY', 'BLOOD_TEST', 'MRI', 'CT_SCAN', 'ULTRASOUND'].map(test => (
              <button 
                key={test}
                onClick={() => toggleOffline(test)}
                style={{
                  padding: '0.25rem 0.75rem', borderRadius: '4px', border: '1px solid', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                  background: offlineResources.includes(test) ? 'var(--urgent-red-bg)' : 'var(--system-green-bg)',
                  borderColor: offlineResources.includes(test) ? 'var(--urgent-red)' : 'var(--system-green)',
                  color: offlineResources.includes(test) ? 'var(--urgent-red)' : 'var(--system-green)'
                }}
              >
                {test.replace('_', ' ')}: {offlineResources.includes(test) ? 'OFFLINE' : 'ONLINE'}
              </button>
            ))}
          </div>

          <div className="queue-container">
            <table className="queue-table">
              <thead>
                <tr>
                  <th>Token Number</th>
                  <th>Patient Name</th>
                  <th>Test Type</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Est. Wait</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{textAlign: 'center', padding: '3rem', color: '#6b7280'}}>
                      Queue is currently empty.
                    </td>
                  </tr>
                ) : (
                  patients.map((p) => (
                    <tr key={p.id} className={p.priority === 'URGENT' ? 'row-urgent' : ''}>
                      <td className="token-number">#{p.id.substring(0, 6).toUpperCase()}</td>
                      <td>{p.name}</td>
                      <td>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '0.25rem'}}>
                          {p.requiredTests.map(t => (
                            <span key={t} style={{fontSize: '0.9rem'}}>{t.replace('_', ' ')}</span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${
                          p.status === 'WAITING' ? 'badge-waiting' : 
                          p.status === 'TESTING' ? 'badge-progress' : 'badge-completed'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${p.priority === 'URGENT' ? 'badge-urgent' : 'badge-normal'}`}>
                          {p.priority}
                        </span>
                      </td>
                      <td>{p.estimatedWaitTime} min</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn-action urgent-toggle"
                            onClick={() => toggleUrgency(p.id, p.priority)}
                          >
                            Mark {p.priority === 'URGENT' ? 'Normal' : 'Urgent'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useAxios from '../hooks/useAxios';
import '../App.css';

const CaseDetails = () => {
  const { id } = useParams(); // Get Case ID from URL
  const api = useAxios();
  
  const [caseData, setCaseData] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [witnesses, setWitnesses] = useState([]);
  const [seizures, setSeizures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);

  // --- 1. FETCH EVERYTHING ---
  useEffect(() => {
    const fetchFullDossier = async () => {
      try {
        // Run all requests in parallel for speed
        const [caseRes, eviRes, witRes, seizRes] = await Promise.all([
          api.get(`/cases/${id}`),
          api.get(`/evidencelogs/${id}`), // Ensure this route exists in backend
          api.get(`/witnesses/${id}`),    // Ensure this route exists
          api.get(`/seizures/${id}`)      // Ensure this route exists
        ]);

        const rawCase = caseRes.data.data;
        const cleanCase = Array.isArray(rawCase) ? rawCase[0] : rawCase;
        
        console.log("✅ FIXED CASE OBJECT:", cleanCase); // Verify this in console
        setCaseData(cleanCase);
        setEvidence(eviRes.data.data);
        setWitnesses(witRes.data.data);
        setSeizures(seizRes.data.data);

      } catch (error) {
        console.error("Error loading dossier:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFullDossier();
  }, [id]);

  // --- 2. UPDATE STATUS HANDLER ---
  const handleStatusUpdate = async (newStatus) => {
    setStatusUpdating(true);
    try {
      await api.patch(`/cases/${id}`, { caseStatus: newStatus });
      // Update local state to reflect change immediately
      setCaseData({ ...caseData, caseStatus: newStatus });
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Status update failed.");
    } finally {
      setStatusUpdating(false);
    }
  };
  console.log("🔍 DEBUG CASE DATA:", caseData);

  if (loading) return <div className="loading-screen">Loading Dossier...</div>;
  if (!caseData) return <div className="error-screen">Case Not Found</div>;

  return (
    <div className="page-container">
      
      {/* --- HEADER & STATUS CONTROL --- */}
      <div className="dossier-header">
        <div>
          <h1>{caseData.caseNumber}: {caseData.caseTitle}</h1>
          <p className="sub-text">Created: {caseData.createdAt ? new Date(caseData.createdAt).toLocaleDateString() : 'N/A'}</p>
        </div>

        <div className="date-info" style={{ marginTop: '10px', color: '#64748b' }}>
            {/* 1. OPENING DATE (Always Fixed) */}
            <span style={{ marginRight: '20px' }}>
              📅 <strong>Opened:</strong> {caseData.createdAt ? new Date(caseData.createdAt).toLocaleDateString() : 'N/A'}
            </span>

            {/* 2. CLOSING DATE LOGIC */}
            {caseData.caseStatus === 'Closed' ? (
              // IF CLOSED: Use 'updatedAt' as the closing date
              <span style={{ color: '#ef4444' }}>
                🏁 <strong>Closed:</strong> {caseData.updatedAt ? new Date(caseData.updatedAt).toLocaleDateString() : 'N/A'}
              </span>
            ) : (
              // IF OPEN/PENDING: Show it is active
              <span style={{ color: '#10b981' }}>
                ⏳ <strong>Active Investigation</strong>
                {/* Optional: Show last activity */}
                <span style={{ fontSize: '0.8em', color: '#94a3b8', marginLeft: '10px' }}>
                   (Last Activity: {caseData.updatedAt ? new Date(caseData.updatedAt).toLocaleDateString() : 'N/A'})
                </span>
              </span>
            )}

        </div>
        
        <div className="status-control">
          <label>Investigation Status:</label>
          <select 
            value={caseData.caseStatus} 
            onChange={(e) => handleStatusUpdate(e.target.value)}
            disabled={statusUpdating}
            className={`status-select ${caseData.caseStatus}`}
          >
            <option value="Open">🟢 Open</option>
            <option value="Closed">🔴 Closed</option>
            <option value="Pending">🟡 Pending Court</option>
          </select>
        </div>
      </div>

      <div className="dossier-grid">
        
        {/* --- LEFT COLUMN: DETAILS & PEOPLE --- */}
        <div className="dossier-left">
          <div className="detail-card">
            <h3>📝 Incident Description</h3>
            <p>{caseData.caseDescription}</p>
          </div>

          <div className="detail-card">
            <h3>👥 Witnesses ({witnesses.length})</h3>
            {witnesses.map(w => (
              <div key={w._id} className="item-row">
                <strong>{w.witnessName}</strong>
                <span className="text-muted">{w.witnessContact?.phone}</span>
                <p className="sm-text">"{w.statement}"</p>
              </div>
            ))}
            {witnesses.length === 0 && <p className="text-muted">No witnesses recorded.</p>}
          </div>

          <div className="detail-card">
            <h3>📦 Seized Items ({seizures.length})</h3>
            {seizures.map(s => (
              <div key={s._id} className="item-row">
                <strong>{s.quantity}x {s.itemDescription}</strong>
                <div className="sm-text">Found at: {s.locationSeized}</div>
                <div className="sm-text">By: {s.seizedBy}</div>
              </div>
            ))}
             {seizures.length === 0 && <p className="text-muted">No seizures recorded.</p>}
          </div>
        </div>

        {/* --- RIGHT COLUMN: EVIDENCE & QR CODES --- */}
        <div className="dossier-right">
          <h3>🗂 Evidence Locker</h3>
          <div className="evidence-grid">
            {evidence.map(e => (
              <div key={e._id} className="evidence-card">
                <div className="qr-container">
                  {/* DISPLAY QR CODE HERE */}
                  <img src={e.qrCode} alt="Evidence QR" className="qr-img" />
                </div>
                <div className="evidence-info">
                  <span className="badge">{e.evidenceType}</span>
                  <h4>{e.description}</h4>
                  <p className="sm-text">Logged by: {e.loggedBy}</p>
                  <a href={`http://localhost:8000/${e.documentPath}`} target="_blank" rel="noreferrer" className="link-btn">
                    View File
                  </a>
                </div>
              </div>
            ))}
             {evidence.length === 0 && <p className="text-muted">No evidence logged.</p>}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CaseDetails;
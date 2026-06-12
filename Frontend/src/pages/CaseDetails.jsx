import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useAxios from '../hooks/useAxios';

const CaseDetails = () => {
  const { id } = useParams();
  const api = useAxios();

  const [caseData, setCaseData] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [witnesses, setWitnesses] = useState([]);
  const [seizures, setSeizures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    const fetchFullDossier = async () => {
      try {
        const [caseRes, eviRes, witRes, seizRes] = await Promise.all([
          api.get(`/cases/${id}`),
          api.get(`/evidencelogs/${id}`),
          api.get(`/witnesses/${id}`),
          api.get(`/seizures/${id}`),
        ]);

        const rawCase = caseRes.data.data;
        const cleanCase = Array.isArray(rawCase) ? rawCase[0] : rawCase;

        setCaseData(cleanCase);
        setEvidence(eviRes.data.data || []);
        setWitnesses(witRes.data.data || []);
        setSeizures(seizRes.data.data || []);
      } catch (error) {
        console.error('Error loading dossier:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFullDossier();
  }, [api, id]);

  const handleStatusUpdate = async (newStatus) => {
    setStatusUpdating(true);
    try {
      await api.patch(`/cases/${id}`, { caseStatus: newStatus });
      setCaseData((currentCase) => ({ ...currentCase, caseStatus: newStatus }));
    } catch (error) {
      console.error('Failed to update status', error);
      alert('Status update failed.');
    } finally {
      setStatusUpdating(false);
    }
  };

  if (loading) return <div className="loading-screen">Loading Dossier...</div>;
  if (!caseData) return <div className="error-screen">Case Not Found</div>;

  return (
    <div className="page-shell">
      <div className="page-container">
        <div className="dossier-header">
          <div>
            <h1>
              {caseData.caseNumber}: {caseData.caseTitle}
            </h1>
            <p className="sm-text">
              Created: {caseData.createdAt ? new Date(caseData.createdAt).toLocaleDateString() : 'N/A'}
            </p>

            <div className="dossier-meta-row">
              <span>
                <strong>Opened:</strong>{' '}
                {caseData.createdAt ? new Date(caseData.createdAt).toLocaleDateString() : 'N/A'}
              </span>

              {caseData.caseStatus === 'Closed' ? (
                <span>
                  <strong>Closed:</strong>{' '}
                  {caseData.updatedAt ? new Date(caseData.updatedAt).toLocaleDateString() : 'N/A'}
                </span>
              ) : (
                <span>
                  <strong>Active Investigation</strong>
                  <span>
                    {' '}
                    Last Activity: {caseData.updatedAt ? new Date(caseData.updatedAt).toLocaleDateString() : 'N/A'}
                  </span>
                </span>
              )}
            </div>
          </div>

          <div className="dossier-status-control">
            <label>Investigation Status</label>
            <select
              value={caseData.caseStatus || 'Open'}
              onChange={(event) => handleStatusUpdate(event.target.value)}
              disabled={statusUpdating}
              className={`status-select ${caseData.caseStatus || 'Open'}`}
            >
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
              <option value="Pending">Pending Court</option>
            </select>
          </div>
        </div>

        <div className="dossier-grid">
          <div className="dossier-left">
            <div className="detail-card">
              <h3>Incident Description</h3>
              <p>{caseData.caseDescription}</p>
            </div>

            <div className="detail-card">
              <h3>Witnesses ({witnesses.length})</h3>
              {witnesses.map((witness) => (
                <div key={witness._id} className="item-row">
                  <strong>{witness.witnessName}</strong>
                  <span className="text-muted">{witness.witnessContact?.phone}</span>
                  <p className="sm-text">"{witness.statement}"</p>
                </div>
              ))}
              {witnesses.length === 0 && <p className="text-muted">No witnesses recorded.</p>}
            </div>

            <div className="detail-card">
              <h3>Seized Items ({seizures.length})</h3>
              {seizures.map((seizure) => (
                <div key={seizure._id} className="item-row">
                  <strong>
                    {seizure.quantity}x {seizure.itemDescription}
                  </strong>
                  <div className="sm-text">Found at: {seizure.locationSeized}</div>
                  <div className="sm-text">By: {seizure.seizedBy}</div>
                </div>
              ))}
              {seizures.length === 0 && <p className="text-muted">No seizures recorded.</p>}
            </div>
          </div>

          <div className="dossier-right">
            <div className="dossier-evidence-panel">
              <h3>Evidence Locker</h3>
              <div className="evidence-grid">
                {evidence.map((evidenceItem) => (
                  <div key={evidenceItem._id} className="evidence-card">
                    <div className="qr-container">
                      <img src={evidenceItem.qrCode} alt="Evidence QR" className="qr-img" />
                    </div>
                    <div className="evidence-info">
                      <span className="badge">{evidenceItem.evidenceType}</span>
                      <h4>{evidenceItem.description}</h4>
                      <p className="sm-text">Logged by: {evidenceItem.loggedBy}</p>
                      <a
                        href={`http://localhost:8000/${evidenceItem.documentPath}`}
                        target="_blank"
                        rel="noreferrer"
                        className="link-btn"
                      >
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
      </div>
    </div>
  );
};

export default CaseDetails;

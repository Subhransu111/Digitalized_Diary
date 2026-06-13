import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import useAxios from '../hooks/useAxios';
import AICaseAssistant from '../components/AICaseAssistant';

const CreateCase = () => {
  const api = useAxios();
  const navigate = useNavigate();
  const { user } = useAuth0();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [caseData, setCaseData] = useState({
    caseNumber: '',
    caseTitle: '',
    caseDescription: '',
  });

  const [witnesses, setWitnesses] = useState([{ witnessName: '', phone: '', email: '', address: '', statement: '' }]);

  const [seizures, setSeizures] = useState([
    { itemDescription: '', quantity: 1, locationSeized: '', seizedBy: '' },
  ]);

  const [evidenceLogs, setEvidenceLogs] = useState([
    { evidenceType: 'Forensic Report', description: '', file: null },
  ]);

  const [facts, setFacts] = useState([{ factDescription: '', factType: 'Observation' }]);
  const [evidenceFiles, setEvidenceFiles] = useState([]);

  const normalizeWitnesses = (items) =>
    items.map((witness) => ({
      witnessName: witness.witnessName || '',
      phone: witness.phone || '',
      email: witness.email || '',
      address: witness.address || '',
      statement: witness.statement || '',
    }));

  const normalizeSeizures = (items) =>
    items.map((seizure) => ({
      itemDescription: seizure.itemDescription || '',
      quantity: Number(seizure.quantity) || 1,
      locationSeized: seizure.locationSeized || '',
      seizedBy: seizure.seizedBy || '',
    }));

  const normalizeFacts = (items) =>
    items.map((fact) => ({
      factDescription: fact.factDescription || '',
      factType: ['Observation', 'Digital Trace', 'Suspect Action'].includes(fact.factType)
        ? fact.factType
        : 'Observation',
    }));

  const handleDetailsExtracted = (extracted) => {
    setCaseData((previousData) => ({
      ...previousData,
      caseNumber: extracted.caseNumber || previousData.caseNumber,
      caseTitle: extracted.caseTitle || previousData.caseTitle,
      caseDescription: extracted.caseDescription || previousData.caseDescription,
    }));

    if (Array.isArray(extracted.witnesses) && extracted.witnesses.length) {
      setWitnesses(normalizeWitnesses(extracted.witnesses));
    }

    if (Array.isArray(extracted.seizures) && extracted.seizures.length) {
      setSeizures(normalizeSeizures(extracted.seizures));
    }

    if (Array.isArray(extracted.facts) && extracted.facts.length) {
      setFacts(normalizeFacts(extracted.facts));
    }

    setMessage({ type: 'success', text: 'AI extraction completed. Review the fields before submitting.' });
  };

  const handleGenericChange = (index, event, state, setState) => {
    const newData = [...state];
    newData[index][event.target.name] = event.target.value;
    setState(newData);
  };

  const handleFileChange = (index, event) => {
    const newLogs = [...evidenceLogs];
    newLogs[index].file = event.target.files[0];
    setEvidenceLogs(newLogs);
  };

  const handleCaseEvidenceChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    const combinedFiles = [...evidenceFiles, ...selectedFiles];

    if (combinedFiles.length > 5) {
      setMessage({ type: 'error', text: 'A case can include up to 5 evidence files.' });
      setEvidenceFiles(combinedFiles.slice(0, 5));
    } else {
      setEvidenceFiles(combinedFiles);
    }

    event.target.value = '';
  };

  const removeCaseEvidenceFile = (index) => {
    setEvidenceFiles((currentFiles) => currentFiles.filter((_, fileIndex) => fileIndex !== index));
  };

  const addRow = (state, setState, emptyObj) => setState([...state, emptyObj]);
  const removeRow = (index, state, setState) => setState(state.filter((_, itemIndex) => itemIndex !== index));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      console.log('Running security pre-checks...');

      for (const log of evidenceLogs) {
        if (log.file) {
          const validationData = new FormData();
          validationData.append('evidenceFile', log.file);

          try {
            await api.post('/evidencelogs/validate', validationData, {
              headers: { 'Content-Type': 'multipart/form-data' },
            });
          } catch {
            throw new Error(`Security Risk: '${log.file.name}' is not allowed.`);
          }
        }
      }

      console.log('Creating case...');
      const caseFormData = new FormData();
      caseFormData.append('caseNumber', caseData.caseNumber);
      caseFormData.append('caseTitle', caseData.caseTitle);
      caseFormData.append('caseDescription', caseData.caseDescription);
      caseFormData.append('createdBy', user?.name || 'Officer');
      evidenceFiles.forEach((file) => {
        caseFormData.append('evidenceFiles', file);
      });

      const caseResponse = await api.post('/cases', caseFormData);
      if (!caseResponse.data.success) throw new Error('Failed to create base case');

      const newCaseId = caseResponse.data.data._id;
      console.log('Case created:', newCaseId);

      const promises = [];

      witnesses.forEach((witness) => {
        if (witness.witnessName) {
          const witnessPayload = {
            caseId: newCaseId,
            witnessName: witness.witnessName,
            statement: witness.statement,
            witnessContact: {
              phone: witness.phone,
              email: witness.email,
              address: witness.address,
            },
          };

          promises.push(api.post('/witnesses', witnessPayload));
        }
      });

      seizures.forEach((seizure) => {
        if (seizure.itemDescription) {
          promises.push(
            api.post('/seizures', {
              caseId: newCaseId,
              itemDescription: seizure.itemDescription,
              quantity: Number(seizure.quantity),
              locationSeized: seizure.locationSeized,
              seizedBy: seizure.seizedBy,
            }),
          );
        }
      });

      evidenceLogs.forEach((log) => {
        if (log.description && log.file) {
          const formData = new FormData();
          formData.append('caseId', newCaseId);
          formData.append('caseTitle', caseData.caseTitle);
          formData.append('evidenceType', log.evidenceType);
          formData.append('description', log.description);
          formData.append('evidenceFile', log.file);
          formData.append('loggedBy', user?.name || 'Officer');

          promises.push(
            api.post('/evidencelogs', formData, {
              headers: { 'Content-Type': 'multipart/form-data' },
            }),
          );
        }
      });

      facts.forEach((fact) => {
        if (fact.factDescription) promises.push(api.post('/casefacts', { ...fact, caseId: newCaseId }));
      });

      await Promise.all(promises);

      setMessage({ type: 'success', text: 'Full Case Profile Created Successfully!' });
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error) {
      console.error('Full Error:', error);
      const serverMsg = error.response?.data?.error || error.response?.data?.message || error.message;
      setMessage({ type: 'error', text: `Failed: ${serverMsg}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-container">
        <h1 className="page-title">New Case Profile</h1>

        <AICaseAssistant onDetailsExtracted={handleDetailsExtracted} api={api} />

        <div className="create-case-card">
          <div className="create-case-stepper">
            <div className="create-case-step active">
              <div className="create-case-step-circle">1</div>
              <span>Details</span>
            </div>
            <div className="create-case-step-line" />
            <div className="create-case-step active">
              <div className="create-case-step-circle">2</div>
              <span>People</span>
            </div>
            <div className="create-case-step-line" />
            <div className="create-case-step active">
              <div className="create-case-step-circle">3</div>
              <span>Evidence</span>
            </div>
          </div>

          <div className="create-case-header">
            <h2>Please fill in the case information</h2>
            <p>Complete all sections to generate a full case profile.</p>
          </div>

          {message.text && <div className={`form-alert ${message.type}`}>{message.text}</div>}

          <form onSubmit={handleSubmit}>
            <div className="create-case-section">
              <h3 className="create-case-section-title">Case Details</h3>
              <div className="create-case-row">
                <div className="create-case-input-group create-case-flex-1">
                  <label>Case Number</label>
                  <input
                    name="caseNumber"
                    value={caseData.caseNumber}
                    onChange={(event) => setCaseData({ ...caseData, [event.target.name]: event.target.value })}
                    placeholder="e.g. CYB-2025-001"
                    required
                  />
                </div>
                <div className="create-case-input-group create-case-flex-2">
                  <label>Case Title</label>
                  <input
                    name="caseTitle"
                    value={caseData.caseTitle}
                    onChange={(event) => setCaseData({ ...caseData, [event.target.name]: event.target.value })}
                    placeholder="Enter official case title"
                    required
                  />
                </div>
              </div>
              <div className="create-case-input-group">
                <label>Case Description</label>
                <textarea
                  name="caseDescription"
                  value={caseData.caseDescription}
                  onChange={(event) => setCaseData({ ...caseData, [event.target.name]: event.target.value })}
                  placeholder="Describe the incident..."
                  required
                  rows="4"
                />
              </div>
            </div>

            <div className="create-case-section">
              <div className="create-case-section-header">
                <h3 className="create-case-section-title">Witnesses</h3>
                <button
                  type="button"
                  onClick={() =>
                    addRow(witnesses, setWitnesses, {
                      witnessName: '',
                      phone: '',
                      email: '',
                      address: '',
                      statement: '',
                    })
                  }
                  className="create-case-add-btn"
                >
                  + Add Witness
                </button>
              </div>

              {witnesses.map((witness, index) => (
                <div key={index} className="witness-row-box">
                  <div className="create-case-row">
                    <div className="create-case-input-group create-case-flex-1">
                      <input
                        name="witnessName"
                        value={witness.witnessName}
                        onChange={(event) => handleGenericChange(index, event, witnesses, setWitnesses)}
                        placeholder="Full Name"
                      />
                    </div>
                    <div className="create-case-input-group create-case-flex-1">
                      <input
                        name="phone"
                        value={witness.phone}
                        onChange={(event) => handleGenericChange(index, event, witnesses, setWitnesses)}
                        placeholder="Phone Number"
                      />
                    </div>
                    <div className="create-case-input-group create-case-flex-1">
                      <input
                        name="email"
                        value={witness.email}
                        onChange={(event) => handleGenericChange(index, event, witnesses, setWitnesses)}
                        placeholder="Email Address"
                      />
                    </div>
                  </div>

                  <div className="create-case-row">
                    <div className="create-case-input-group create-case-flex-1">
                      <input
                        name="address"
                        value={witness.address}
                        onChange={(event) => handleGenericChange(index, event, witnesses, setWitnesses)}
                        placeholder="Physical Address"
                      />
                    </div>
                    <div className="create-case-input-group create-case-flex-2">
                      <input
                        name="statement"
                        value={witness.statement}
                        onChange={(event) => handleGenericChange(index, event, witnesses, setWitnesses)}
                        placeholder="Witness Statement"
                      />
                    </div>

                    {witnesses.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRow(index, witnesses, setWitnesses)}
                        className="create-case-remove-btn"
                        aria-label="Remove witness"
                      >
                        x
                      </button>
                    )}
                  </div>

                  {index < witnesses.length - 1 && <hr className="witness-divider-line" />}
                </div>
              ))}
            </div>

            <div className="create-case-section">
              <div className="create-case-section-header">
                <h3 className="create-case-section-title">Seizures</h3>
                <button
                  type="button"
                  onClick={() =>
                    addRow(seizures, setSeizures, {
                      itemDescription: '',
                      quantity: 1,
                      locationSeized: '',
                      seizedBy: '',
                    })
                  }
                  className="create-case-add-btn"
                >
                  + Add Item
                </button>
              </div>

              {seizures.map((seizure, index) => (
                <div key={index} className="create-case-dynamic-row">
                  <div className="create-case-input-group create-case-flex-2">
                    <input
                      name="itemDescription"
                      value={seizure.itemDescription}
                      onChange={(event) => handleGenericChange(index, event, seizures, setSeizures)}
                      placeholder="Item Description"
                    />
                  </div>
                  <div className="create-case-input-group create-case-quantity-field">
                    <input
                      type="number"
                      name="quantity"
                      value={seizure.quantity}
                      onChange={(event) => handleGenericChange(index, event, seizures, setSeizures)}
                      placeholder="Qty"
                      min="1"
                    />
                  </div>
                  <div className="create-case-input-group create-case-flex-1">
                    <input
                      name="locationSeized"
                      value={seizure.locationSeized}
                      onChange={(event) => handleGenericChange(index, event, seizures, setSeizures)}
                      placeholder="Location"
                    />
                  </div>
                  <div className="create-case-input-group create-case-flex-1">
                    <input
                      name="seizedBy"
                      value={seizure.seizedBy}
                      onChange={(event) => handleGenericChange(index, event, seizures, setSeizures)}
                      placeholder="Officer"
                    />
                  </div>
                  {seizures.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRow(index, seizures, setSeizures)}
                      className="create-case-remove-btn"
                      aria-label="Remove seizure"
                    >
                      x
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="create-case-section">
              <div className="create-case-section-header">
                <h3 className="create-case-section-title">Case Evidence Files</h3>
                <label className="create-case-add-btn create-case-upload-label">
                  + Select Files
                  <input
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.webp,.pdf,.mp3,.wav,.mp4,.avi,.mov"
                    onChange={handleCaseEvidenceChange}
                  />
                </label>
              </div>

              {evidenceFiles.length > 0 ? (
                <div className="case-evidence-file-list">
                  {evidenceFiles.map((file, index) => (
                    <div key={`${file.name}-${file.lastModified}`} className="case-evidence-file-chip">
                      <span>{file.name}</span>
                      <button type="button" onClick={() => removeCaseEvidenceFile(index)} aria-label="Remove file">
                        x
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="case-evidence-empty">No case evidence files selected.</div>
              )}
            </div>

            <div className="create-case-section">
              <div className="create-case-section-header">
                <h3 className="create-case-section-title">Evidence Logs</h3>
                <button
                  type="button"
                  onClick={() =>
                    addRow(evidenceLogs, setEvidenceLogs, {
                      evidenceType: 'Forensic Report',
                      description: '',
                      file: null,
                    })
                  }
                  className="create-case-add-btn"
                >
                  + Add File
                </button>
              </div>

              {evidenceLogs.map((log, index) => (
                <div key={index} className="create-case-dynamic-row">
                  <div className="create-case-input-group create-case-flex-1">
                    <select
                      name="evidenceType"
                      value={log.evidenceType}
                      onChange={(event) => handleGenericChange(index, event, evidenceLogs, setEvidenceLogs)}
                    >
                      <option>Forensic Report</option>
                      <option>CCTV Footage</option>
                      <option>Call Records</option>
                    </select>
                  </div>
                  <div className="create-case-input-group create-case-flex-2">
                    <input
                      name="description"
                      value={log.description}
                      onChange={(event) => handleGenericChange(index, event, evidenceLogs, setEvidenceLogs)}
                      placeholder="File Description"
                    />
                  </div>
                  <div className="create-case-input-group create-case-flex-1">
                    <input
                      type="file"
                      onChange={(event) => handleFileChange(index, event)}
                      className="create-case-file-input"
                    />
                  </div>
                  {evidenceLogs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRow(index, evidenceLogs, setEvidenceLogs)}
                      className="create-case-remove-btn"
                      aria-label="Remove evidence log"
                    >
                      x
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="create-case-section">
              <div className="create-case-section-header">
                <h3 className="create-case-section-title">Key Facts</h3>
                <button
                  type="button"
                  onClick={() => addRow(facts, setFacts, { factDescription: '', factType: 'Observation' })}
                  className="create-case-add-btn"
                >
                  + Add Fact
                </button>
              </div>

              {facts.map((fact, index) => (
                <div key={index} className="create-case-dynamic-row">
                  <div className="create-case-input-group create-case-flex-1">
                    <select
                      name="factType"
                      value={fact.factType}
                      onChange={(event) => handleGenericChange(index, event, facts, setFacts)}
                    >
                      <option>Observation</option>
                      <option>Digital Trace</option>
                      <option>Suspect Action</option>
                    </select>
                  </div>
                  <div className="create-case-input-group create-case-flex-2">
                    <input
                      name="factDescription"
                      value={fact.factDescription}
                      onChange={(event) => handleGenericChange(index, event, facts, setFacts)}
                      placeholder="Fact Description"
                    />
                  </div>
                  {facts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRow(index, facts, setFacts)}
                      className="create-case-remove-btn"
                      aria-label="Remove fact"
                    >
                      x
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button type="submit" className="create-case-submit-btn" disabled={loading}>
              {loading ? 'Processing...' : 'Submit Complete Case'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCase;

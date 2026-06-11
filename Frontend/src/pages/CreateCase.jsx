import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import useAxios from '../hooks/useAxios';
import '../App.css';

const CreateCase = () => {
  const api = useAxios();
  const navigate = useNavigate();
  const { user } = useAuth0(); // Get logged-in user info
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // --- 1. STATE MANAGEMENT ---
  const [caseData, setCaseData] = useState({
    caseNumber: '', caseTitle: '', caseDescription: ''
  });

  const [witnesses, setWitnesses] = useState([
    { witnessName: '', phone: '',email: '', address: '', statement: '' }
  ]);

  // FIXED: Names now match Seizure.js Model exactly
  const [seizures, setSeizures] = useState([
    { itemDescription: '', quantity: 1, locationSeized: '', seizedBy: '' }
  ]);

  const [evidenceLogs, setEvidenceLogs] = useState([
    { evidenceType: 'Forensic Report', description: '', file: null }
  ]);

  const [facts, setFacts] = useState([
    { factDescription: '', factType: 'Observation' }
  ]);

  // --- 2. HANDLERS ---
  const handleGenericChange = (index, e, state, setState) => {
    const newData = [...state];
    newData[index][e.target.name] = e.target.value;
    setState(newData);
  };

  const handleFileChange = (index, e) => {
    const newLogs = [...evidenceLogs];
    newLogs[index].file = e.target.files[0];
    setEvidenceLogs(newLogs);
  };

  const addRow = (state, setState, emptyObj) => setState([...state, emptyObj]);
  const removeRow = (index, state, setState) => setState(state.filter((_, i) => i !== index));

  // --- 3. SUBMIT LOGIC ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
        console.log("🔒 Running Security Pre-Checks...");
      
      // We check the files while they are still just in React State (Temporary)
      for (const log of evidenceLogs) {
        if (log.file) {
          const validationData = new FormData();
          validationData.append('evidenceFile', log.file);

          try {
            
            await api.post('/evidencelogs/validate', validationData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });
          } catch {
            // IF UNSAFE: We throw an error immediately.
            // Result: The code below never runs. NO data goes to the DB.
            throw new Error(`Security Risk: '${log.file.name}' is not allowed.`);
          }
        }
      }
      
      console.log("Creating Case...");
      const caseResponse = await api.post('/cases', caseData);
      if (!caseResponse.data.success) throw new Error("Failed to create base case");
      
      const newCaseId = caseResponse.data.data._id;
      console.log("Case Created:", newCaseId);

      const promises = [];

      // Step B: Witnesses
      witnesses.forEach(w => {
        if (w.witnessName) {
            const witnesspayload = {
                caseId: newCaseId,
                witnessName: w.witnessName,
                statement: w.statement,
                witnessContact: { // <--- This creates the Object structure
              phone: w.phone,
              email: w.email,
              address: w.address
            }
        };
         promises.push(api.post('/witnesses', witnesspayload));
    }
      });

      // Step C: Seizures (Fixed Field Names)
      seizures.forEach(s => {
        if (s.itemDescription) {
          promises.push(api.post('/seizures', {
            caseId: newCaseId,
            itemDescription: s.itemDescription,
            quantity: Number(s.quantity), // Ensure number
            locationSeized: s.locationSeized,
            seizedBy: s.seizedBy
          }));
        }
      });

      // Step D: Evidence Logs (Fixed User Name & File)
      evidenceLogs.forEach(log => {
        if (log.description && log.file) {
          const formData = new FormData();
          formData.append('caseId', newCaseId);
          formData.append('caseTitle', caseData.caseTitle);
          formData.append('evidenceType', log.evidenceType);
          formData.append('description', log.description);
          formData.append('evidenceFile', log.file); // Must match backend 'upload.single()'
          formData.append('loggedBy', user?.name || 'Officer'); // Send User Name
          
          promises.push(api.post('/evidencelogs', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          }));
        }
      });

      // Step E: Facts
      facts.forEach(f => {
        if (f.factDescription) promises.push(api.post('/casefacts', { ...f, caseId: newCaseId }));
      });

      await Promise.all(promises);

      setMessage({ type: 'success', text: 'Full Case Profile Created Successfully!' });
      setTimeout(() => navigate('/dashboard'), 2000);

    } catch (error) {
      console.error("Full Error:", error);
      const serverMsg = error.response?.data?.error || error.response?.data?.message || error.message;
      setMessage({ type: 'error', text: `Failed: ${serverMsg}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page-container">
      <div className="form-card wide-card">
        
        {/* Stepper */}
        <div className="stepper-container">
          <div className="step active"><div className="step-circle">1</div><span>Details</span></div>
          <div className="step-line"></div>
          <div className="step active"><div className="step-circle">2</div><span>People</span></div>
          <div className="step-line"></div>
          <div className="step active"><div className="step-circle">3</div><span>Evidence</span></div>
        </div>

        <div className="form-header">
          <h2>Please fill in the case information</h2>
          <p>Complete all sections to generate a full case profile.</p>
        </div>

        {message.text && <div className={`alert ${message.type}`}>{message.text}</div>}

        <form onSubmit={handleSubmit}>
          
          {/* 1. Case Details */}
          <div className="clean-section">
            <h3 className="section-title">Case Details</h3>
            <div className="row">
              <div className="input-group flex-1">
                <label>Case Number</label>
                <input name="caseNumber" value={caseData.caseNumber} onChange={(e) => setCaseData({...caseData, [e.target.name]: e.target.value})} placeholder="e.g. CYB-2025-001" required />
              </div>
              <div className="input-group flex-2">
                <label>Case Title</label>
                <input name="caseTitle" value={caseData.caseTitle} onChange={(e) => setCaseData({...caseData, [e.target.name]: e.target.value})} placeholder="Enter official case title" required />
              </div>
            </div>
            <div className="input-group">
              <label>Case Description</label>
              <textarea name="caseDescription" value={caseData.caseDescription} onChange={(e) => setCaseData({...caseData, [e.target.name]: e.target.value})} placeholder="Describe the incident..." required rows="4"></textarea>
            </div>
          </div>

          {/* --- Section 2: Witnesses (EXPANDED) --- */}
          <div className="clean-section">
            <div className="section-header-clean">
              <h3 className="section-title">Witnesses</h3>
              <button type="button" onClick={() => addRow(witnesses, setWitnesses, {witnessName:'', phone:'', email:'', address:'', statement:''})} className="clean-add-btn">+ Add Witness</button>
            </div>
            {witnesses.map((w, index) => (
              <div key={index} className="witness-card-row"> {/* New CSS Class below */}
                
                {/* Row 1: Basic Info */}
                <div className="row">
                  <div className="input-group flex-1">
                    <input name="witnessName" value={w.witnessName} onChange={(e) => handleGenericChange(index, e, witnesses, setWitnesses)} placeholder="Full Name" />
                  </div>
                  <div className="input-group flex-1">
                    <input name="phone" value={w.phone} onChange={(e) => handleGenericChange(index, e, witnesses, setWitnesses)} placeholder="Phone Number" />
                  </div>
                  <div className="input-group flex-1">
                    <input name="email" value={w.email} onChange={(e) => handleGenericChange(index, e, witnesses, setWitnesses)} placeholder="Email Address" />
                  </div>
                </div>

                {/* Row 2: Address & Statement */}
                <div className="row">
                  <div className="input-group flex-1">
                    <input name="address" value={w.address} onChange={(e) => handleGenericChange(index, e, witnesses, setWitnesses)} placeholder="Physical Address" />
                  </div>
                  <div className="input-group flex-2">
                    <input name="statement" value={w.statement} onChange={(e) => handleGenericChange(index, e, witnesses, setWitnesses)} placeholder="Witness Statement" />
                  </div>
                  
                  {/* Remove Button */}
                  {witnesses.length > 1 && (
                    <button type="button" onClick={() => removeRow(index, witnesses, setWitnesses)} className="clean-remove-btn">×</button>
                  )}
                </div>
                
                {/* Visual Separator for multiple witnesses */}
                {index < witnesses.length - 1 && <hr className="witness-divider"/>}
              </div>
            ))}
          </div>

          {/* 3. Seizures (FIXED FIELDS) */}
          <div className="clean-section">
            <div className="section-header-clean">
              <h3 className="section-title">Seizures</h3>
              <button type="button" onClick={() => addRow(seizures, setSeizures, {itemDescription:'', quantity:1, locationSeized:'', seizedBy:''})} className="clean-add-btn">+ Add Item</button>
            </div>
            {seizures.map((s, index) => (
              <div key={index} className="row dynamic-row">
                <div className="input-group flex-2">
                  <input name="itemDescription" value={s.itemDescription} onChange={(e) => handleGenericChange(index, e, seizures, setSeizures)} placeholder="Item Description" />
                </div>
                <div className="input-group" style={{width:'80px'}}>
                  <input type="number" name="quantity" value={s.quantity} onChange={(e) => handleGenericChange(index, e, seizures, setSeizures)} placeholder="Qty" min="1" />
                </div>
                <div className="input-group flex-1">
                  <input name="locationSeized" value={s.locationSeized} onChange={(e) => handleGenericChange(index, e, seizures, setSeizures)} placeholder="Location" />
                </div>
                <div className="input-group flex-1">
                  <input name="seizedBy" value={s.seizedBy} onChange={(e) => handleGenericChange(index, e, seizures, setSeizures)} placeholder="Officer" />
                </div>
                {seizures.length > 1 && <button type="button" onClick={() => removeRow(index, seizures, setSeizures)} className="clean-remove-btn">×</button>}
              </div>
            ))}
          </div>

          {/* 4. Evidence Uploads */}
          <div className="clean-section">
            <div className="section-header-clean">
              <h3 className="section-title">Evidence Uploads</h3>
              <button type="button" onClick={() => addRow(evidenceLogs, setEvidenceLogs, {evidenceType:'Forensic Report', description:'', file:null})} className="clean-add-btn">+ Add File</button>
            </div>
            {evidenceLogs.map((log, index) => (
              <div key={index} className="row dynamic-row">
                 <div className="input-group flex-1">
                  <select name="evidenceType" value={log.evidenceType} onChange={(e) => handleGenericChange(index, e, evidenceLogs, setEvidenceLogs)}>
                    <option>Forensic Report</option>
                    <option>CCTV Footage</option>
                    <option>Call Records</option>
                  </select>
                </div>
                <div className="input-group flex-2">
                  <input name="description" value={log.description} onChange={(e) => handleGenericChange(index, e, evidenceLogs, setEvidenceLogs)} placeholder="File Description" />
                </div>
                <div className="input-group flex-1">
                   <input type="file" onChange={(e) => handleFileChange(index, e)} className="file-input" />
                </div>
                {evidenceLogs.length > 1 && <button type="button" onClick={() => removeRow(index, evidenceLogs, setEvidenceLogs)} className="clean-remove-btn">×</button>}
              </div>
            ))}
          </div>

          {/* 5. Key Facts */}
          <div className="clean-section">
            <div className="section-header-clean">
              <h3 className="section-title">Key Facts</h3>
              <button type="button" onClick={() => addRow(facts, setFacts, {factDescription:'', factType:'Observation'})} className="clean-add-btn">+ Add Fact</button>
            </div>
            {facts.map((f, index) => (
              <div key={index} className="row dynamic-row">
                <div className="input-group flex-1">
                  <select name="factType" value={f.factType} onChange={(e) => handleGenericChange(index, e, facts, setFacts)}>
                    <option>Observation</option>
                    <option>Digital Trace</option>
                    <option>Suspect Action</option>
                  </select>
                </div>
                <div className="input-group flex-2">
                  <input name="factDescription" value={f.factDescription} onChange={(e) => handleGenericChange(index, e, facts, setFacts)} placeholder="Fact Description" />
                </div>
                {facts.length > 1 && <button type="button" onClick={() => removeRow(index, facts, setFacts)} className="clean-remove-btn">×</button>}
              </div>
            ))}
          </div>

          <button type="submit" className="clean-submit-btn" disabled={loading}>
            {loading ? 'Processing...' : 'Submit Complete Case'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCase;

import React, { useEffect, useRef, useState } from 'react';

const AICaseAssistant = ({ onDetailsExtracted, api }) => {
  const [caseText, setCaseText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startSpeechRecognition = () => {
    setError('');

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Voice input is not supported in this browser. Please type the case details.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event);
        setError(
          event.error === 'not-allowed'
            ? 'Microphone access denied. Please grant permission in browser settings.'
            : `Voice capture error: ${event.error}`,
        );
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .slice(event.resultIndex)
          .map((result) => result[0]?.transcript || '')
          .join(' ')
          .trim();

        if (transcript) {
          setCaseText((previousText) => `${previousText}${previousText ? ' ' : ''}${transcript}`);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (speechError) {
      console.error(speechError);
      setError('Failed to initialize voice input.');
      setIsRecording(false);
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleExtract = async () => {
    if (caseText.trim().length < 20) {
      setError('Please enter at least 20 characters of narrative text.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/cases/extract', { caseText });

      if (response.data.success && response.data.data) {
        onDetailsExtracted(response.data.data);
      } else {
        throw new Error(response.data.message || 'Details extraction failed.');
      }
    } catch (extractError) {
      console.error(extractError);
      setError(extractError.response?.data?.message || extractError.message || 'Failed to extract case details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-assistant-card">
      <div className="ai-assistant-header">
        <h2>AI Case Assistant</h2>
        <p>Dictate or type the initial narration, then review the extracted case profile before submitting.</p>
      </div>

      <div className="ai-assistant-body">
        <textarea
          value={caseText}
          onChange={(event) => setCaseText(event.target.value)}
          placeholder="Describe the incident details, witnesses, seized items, and key observations."
          rows="5"
          className="ai-assistant-textarea"
          disabled={loading}
        />

        {error && <div className="ai-assistant-error-box">{error}</div>}

        <div className="ai-assistant-controls">
          <div className="voice-buttons-group">
            {!isRecording ? (
              <button type="button" onClick={startSpeechRecognition} className="btn-voice start-rec" disabled={loading}>
                Start Dictation
              </button>
            ) : (
              <button type="button" onClick={stopSpeechRecognition} className="btn-voice stop-rec">
                Stop Recording
              </button>
            )}
          </div>

          <div className="action-buttons-group">
            <button
              type="button"
              onClick={() => setCaseText('')}
              className="btn-secondary"
              disabled={loading || !caseText}
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleExtract}
              className="btn-primary extract-glow-btn"
              disabled={loading || !caseText.trim()}
            >
              {loading ? 'Extracting...' : 'Extract Case Details'}
            </button>
          </div>
        </div>
      </div>

      <div className="ai-assistant-footer-warning">Review all AI-filled fields before submitting.</div>
    </div>
  );
};

export default AICaseAssistant;

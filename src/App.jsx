import React, { useState, useEffect } from 'react';
import logo from './logo.png';
import './App.css';
import block01 from '../tonesig_blocks/block01.json';
import block02 from '../tonesig_blocks/block02.json';
import block03 from '../tonesig_blocks/block03.json';
import block04 from '../tonesig_blocks/block04.json';
import block05 from '../tonesig_blocks/block05.json';
import block06 from '../tonesig_blocks/block06.json';
import block07 from '../tonesig_blocks/block07.json';
import block08 from '../tonesig_blocks/block08.json';
import block09 from '../tonesig_blocks/block09.json';
import block10 from '../tonesig_blocks/block10.json';

const allBlocks = [
  ...block01, ...block02, ...block03, ...block04, ...block05,
  ...block06, ...block07, ...block08, ...block09, ...block10
];

function App() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [history, setHistory] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

const toneHueMap = {
  10: 220,  // Calm / Blue
  11: 280,  // Uncertainty / Purple
  12: 330,  // Irony / Pink
  13: 0,    // Directive / Red
  14: 30,   // Mild Rejection / Orange
  15: 0,    // Firm Rejection / Crimson
  16: 50,   // Support / Gold
  17: 100,  // Protection / Green
  18: 170,  // Excitement / Teal
  19: 190   // Bittersweet / Cyan
};

const getToneColor = (toneSig) => {
  const match = toneSig.match(/¡(\d+)\.(\d+)/);
  if (!match) return '#999';
  const base = parseInt(match[1], 10);
  const detail = parseInt(match[2], 10);
  const hue = toneHueMap[base] ?? 220;
  const lightness = 85 - (detail % 100) * 0.5;
  return `hsl(${hue}, 70%, ${lightness}%)`;
};

  useEffect(() => {
    if (input.trim() === '') {
      setSuggestions([]);
      return;
    }

    const normalized = input.toLowerCase().replace(/\s+/g, '');
    const matches = allBlocks
      .map((item) => {
        const cleanText = item.sentence.toLowerCase().replace(/\s+/g, '');
        let score = 0;
        for (let i = 0; i < Math.min(cleanText.length, normalized.length); i++) {
          if (cleanText[i] === normalized[i]) score++;
          else break;
        }
        return { ...item, matchScore: score };
      })
      .filter((item) => item.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3);

    setSuggestions(matches);
  }, [input]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setTimeout(() => {
      const normalized = input.toLowerCase().replace(/\s+/g, '');
      const match = allBlocks.find(
        (item) => item.sentence.toLowerCase().replace(/\s+/g, '') === normalized
      );
      if (match) {
        setResult(`Match found: ${match.sentence} [${match.toneSig}]`);
        setHistory((prev) => [...prev, match]);
      } else {
        setResult('No exact match. Try refining your input.');
      }
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <img src={logo} className="app-logo" alt="logo" />
        <h2 className="app-title">ToneS¡g! Emotional Match</h2>
      </header>
      <form onSubmit={handleSubmit}>
        <input
          className="form-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a sentence..."
        />
        <div className="form-hint">
          Tip: input is normalized (case/space), and we’ll suggest the closest match if no exact match.
        </div>
        <button className="form-button" type="submit" disabled={isLoading}>
          {isLoading ? <span className="spinner"></span> : 'Match ToneS¡g!'}
        </button>
      </form>

      {error && <div className="error-banner">{error}</div>}

      {suggestions.length > 0 && (
        <div className="suggestion">
          <strong>Close Suggestions:</strong>
          <ul>
            {suggestions.map((s, idx) => (
              <li key={idx} className="suggestion-match">
                {s.sentence}{' '}
                <span style={{ color: getToneColor(s.toneSig) }}>
                  [{s.toneSig}]
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="results">{result}</div>

      {history.length > 0 && (
        <div className="history">
          <h4>History</h4>
          {history.map((h, idx) => (
            <div key={idx} className="history-item">
              {h.sentence}{' '}
              <span style={{ color: getToneColor(h.toneSig) }}>
                [{h.toneSig}]
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="footer">
        Built with ❤️ from the PUTMAN Model project. Tone suggestions powered by local data.
      </div>
    </div>
  );
}

export default App;
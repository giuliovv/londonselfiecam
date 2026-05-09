import { useState } from 'react';
import { useGeolocation } from './hooks/useGeolocation';
import { useTflCams } from './hooks/useTflCams';
import { CamCard, CamThumb } from './components/CamCard';
import './App.css';

export default function App() {
  const geo = useGeolocation();
  const { cams, loading: camsLoading, error: camsError, fetchNearest, getProp } = useTflCams();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [started, setStarted] = useState(false);

  const loading = geo.loading || camsLoading;
  const error = geo.error || camsError;

  async function handleFind() {
    setStarted(true);
    setSelectedIdx(0);
    try {
      const loc = await geo.request();
      await fetchNearest(loc.lat, loc.lon);
    } catch {
      // errors stored in hook state
    }
  }

  const selected = cams[selectedIdx] ?? null;
  const nearby = cams.slice(1, 6);

  return (
    <div className="app">
      <header className="app-header">
        <h1>London Selfie Cam</h1>
        <p className="subtitle">Find the nearest TFL jam cam to you</p>
      </header>

      <button className="find-btn" onClick={handleFind} disabled={loading}>
        {loading ? 'Locating…' : started ? '📍 Update location' : '📍 Find nearest cam'}
      </button>

      {error && <p className="error-msg">{error}</p>}

      {selected && (
        <>
          <CamCard cam={selected} getProp={getProp} />

          {nearby.length > 0 && (
            <section className="nearby-section">
              <h2 className="nearby-heading">Also nearby</h2>
              {nearby.map((cam, i) => (
                <CamThumb
                  key={cam.id}
                  cam={cam}
                  getProp={getProp}
                  onClick={() => setSelectedIdx(i + 1)}
                />
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
}

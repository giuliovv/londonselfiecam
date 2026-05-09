import { useEffect, useMemo, useState } from 'react';
import './styles.css';
import { useTflCams } from './hooks/useTflCams';
import { useGeolocation } from './hooks/useGeolocation';
import { Splash } from './components/Splash';
import { Statusbar } from './components/Statusbar';
import { Tabbar } from './components/Tabbar';
import { Landing } from './screens/Landing';
import { MapScreen } from './screens/MapScreen';
import { CamViewer } from './screens/CamViewer';
import { SnapResult } from './screens/SnapResult';
import { Planner } from './screens/Planner';
import { Feed } from './screens/Feed';
import { Me } from './screens/Me';

export default function App() {
  const { cams, loading, error, byId, nearestTo } = useTflCams();
  const geo = useGeolocation();

  const [splash, setSplash] = useState(true);
  const [tab, setTab] = useState('live');
  const [openCamId, setOpenCamId] = useState(null);
  const [snap, setSnap] = useState(null);
  const [activeRoute, setActiveRoute] = useState(null);

  // Auto-request geolocation once on mount so cams can sort by proximity
  useEffect(() => {
    geo.request().catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Splash for ~1.7s, but at least until first cams load
  useEffect(() => {
    const min = 1700;
    const start = Date.now();
    let cancelled = false;
    const poll = () => {
      if (cancelled) return;
      const elapsed = Date.now() - start;
      if (elapsed >= min && (!loading || error)) {
        setSplash(false);
      } else {
        setTimeout(poll, 120);
      }
    };
    poll();
    return () => {
      cancelled = true;
    };
  }, [loading, error]);

  // Sort cams: prefer those nearest the user when geolocation is granted.
  const sortedCams = useMemo(() => {
    if (geo.location) {
      return nearestTo(geo.location.lat, geo.location.lon, cams.length);
    }
    return cams;
  }, [cams, geo.location, nearestTo]);

  const openCam = (id) => setOpenCamId(id);
  const closeCam = () => setOpenCamId(null);
  const onSnap = (s) => {
    setSnap(s);
    setOpenCamId(null);
  };

  const camForViewer = openCamId
    ? byId(openCamId) || sortedCams.find((c) => c.id === openCamId) || sortedCams[0]
    : null;

  if (openCamId) {
    return (
      <div className="app-shell">
        <div className="phone">
          <Splash show={splash} camCount={cams.length} />
          <CamViewer cam={camForViewer} onBack={closeCam} onSnap={onSnap} />
        </div>
      </div>
    );
  }
  if (snap) {
    return (
      <div className="app-shell">
        <div className="phone">
          <SnapResult
            snap={snap}
            onDone={() => setSnap(null)}
            onShare={() => setSnap(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="phone">
        <Splash show={splash} camCount={cams.length} />

        <Statusbar />

        <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
          {error && (
            <div className="err">
              TFL FEED ERROR · {error}
              <br />
              (cams may be empty until network recovers)
            </div>
          )}

          {tab === 'live' && (
            <Landing cams={sortedCams} onEnter={() => setTab('map')} onPickCam={openCam} />
          )}
          {tab === 'map' && <MapScreen cams={sortedCams} onOpenCam={openCam} userLoc={geo.location} />}
          {tab === 'feed' && <Feed cams={sortedCams} onOpenCam={openCam} />}
          {tab === 'plan' && (
            <Planner
              cams={sortedCams}
              activeRoute={activeRoute}
              onStartRoute={setActiveRoute}
              onSnap={onSnap}
            />
          )}
          {tab === 'me' && <Me cams={sortedCams} onOpenCam={openCam} />}
        </div>

        <button
          className="tab-snap"
          onClick={() => sortedCams[0] && openCam(sortedCams[0].id)}
        >
          SNAP
        </button>

        <Tabbar tab={tab} onChange={setTab} />

        {tab === 'live' && (
          <button className="stream-chip" onClick={() => setTab('feed')}>
            ↗ THE STREAM
          </button>
        )}
      </div>
    </div>
  );
}

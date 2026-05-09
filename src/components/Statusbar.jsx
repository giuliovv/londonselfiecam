import { useTickingTime } from '../hooks/useTickingTime';
import { IconBars, IconWifi, IconBattery } from './Icons';

export function Statusbar() {
  const time = useTickingTime();
  const hhmm = time.slice(0, 5);
  return (
    <div className="statusbar">
      <span>{hhmm}</span>
      <span className="hud" style={{ fontSize: 11, opacity: 0.7 }}>
        ● LSC.live
      </span>
      <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
        <IconBars />
        <IconWifi />
        <IconBattery />
      </span>
    </div>
  );
}

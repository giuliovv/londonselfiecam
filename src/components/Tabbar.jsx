import { IconLive, IconMap, IconPlan, IconMe } from './Icons';

function TabBtn({ active, onClick, label, icon }) {
  return (
    <button onClick={onClick} className={active ? 'active' : ''}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

export function Tabbar({ tab, onChange }) {
  return (
    <div className="tabbar">
      <TabBtn active={tab === 'live'} onClick={() => onChange('live')} label="LIVE" icon={<IconLive />} />
      <TabBtn active={tab === 'map'} onClick={() => onChange('map')} label="MAP" icon={<IconMap />} />
      <div />
      <TabBtn active={tab === 'plan'} onClick={() => onChange('plan')} label="PLAN" icon={<IconPlan />} />
      <TabBtn active={tab === 'me'} onClick={() => onChange('me')} label="ME" icon={<IconMe />} />
    </div>
  );
}

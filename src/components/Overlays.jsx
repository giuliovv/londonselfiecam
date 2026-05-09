export function Scanlines() {
  return <div className="scanlines" />;
}
export function Grain() {
  return <div className="grain" />;
}
export function Vignette() {
  return <div className="crt-vignette" />;
}
export function Brackets({ color, size = 22, weight = 2 }) {
  const c = color || 'var(--ink)';
  const corner = (pos) => ({ position: 'absolute', width: size, height: size, ...pos });
  return (
    <>
      <div
        style={{
          ...corner({ top: 8, left: 8 }),
          borderTop: `${weight}px solid ${c}`,
          borderLeft: `${weight}px solid ${c}`,
        }}
      />
      <div
        style={{
          ...corner({ top: 8, right: 8 }),
          borderTop: `${weight}px solid ${c}`,
          borderRight: `${weight}px solid ${c}`,
        }}
      />
      <div
        style={{
          ...corner({ bottom: 8, left: 8 }),
          borderBottom: `${weight}px solid ${c}`,
          borderLeft: `${weight}px solid ${c}`,
        }}
      />
      <div
        style={{
          ...corner({ bottom: 8, right: 8 }),
          borderBottom: `${weight}px solid ${c}`,
          borderRight: `${weight}px solid ${c}`,
        }}
      />
    </>
  );
}

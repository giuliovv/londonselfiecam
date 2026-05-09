import { useState, useEffect } from 'react';

export function formatTime(d) {
  const z = (n) => String(n).padStart(2, '0');
  return `${z(d.getHours())}:${z(d.getMinutes())}:${z(d.getSeconds())}`;
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
export function formatDate(d) {
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function useTickingTime(intervalMs = 1000) {
  const [t, setT] = useState(() => formatTime(new Date()));
  useEffect(() => {
    const id = setInterval(() => setT(formatTime(new Date())), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return t;
}

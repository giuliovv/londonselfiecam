import { useState, useEffect } from 'react';
import { initAuth } from '../lib/auth';

export function useAuth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    return initAuth(setUser);
  }, []);

  return user;
}

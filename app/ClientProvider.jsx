'use client';

import { useEffect } from 'react';
import { Provider } from './context/context';

/**
 * Wraps the server‐rendered layout so that context (and its client hooks)
 * only run on the client. Also handles chunk load errors that may occur
 * on initial load when dev server is still compiling.
 */
export default function ClientProvider({ children }) {
  useEffect(() => {
    const handleChunkError = (e) => {
      if (e?.message?.includes('Loading chunk')) {
        console.warn('Chunk load failed. Reloading...');
        window.location.reload();
      }
    };

    window.addEventListener('error', handleChunkError);

    return () => {
      window.removeEventListener('error', handleChunkError);
    };
  }, []);

  return <Provider>{children}</Provider>;
}

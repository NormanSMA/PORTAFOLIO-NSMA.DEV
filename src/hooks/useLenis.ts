import { useEffect } from 'react';
import { startSmoothScroll } from '../lib/scroll';

export function useLenis() {
  useEffect(() => startSmoothScroll(), []);
}

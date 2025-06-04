import { useEffect, useState } from 'react';

import { useIntersection } from '@mantine/hooks';

interface UseSmartLoadingOptions {
  threshold?: number;
  rootMargin?: string;
  timeThreshold?: number; // Time in milliseconds to wait before loading
}

export function useSmartLoading(options: UseSmartLoadingOptions = {}) {
  const {
    threshold = 0.1,
    rootMargin = '100px',
    timeThreshold = 5000 // Default 5 seconds
  } = options;

  const [shouldLoad, setShouldLoad] = useState(false);
  const { ref, entry } = useIntersection({
    threshold,
    rootMargin
  });

  useEffect(() => {
    // If component is intersecting, load immediately
    if (entry?.isIntersecting) {
      setShouldLoad(true);
      return;
    }

    // If not intersecting, start a timer
    const timer: NodeJS.Timeout = setTimeout(() => {
      setShouldLoad(true);
    }, timeThreshold);

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [entry?.isIntersecting, timeThreshold]);

  return { ref, shouldLoad };
}

// createEmotionCache.js
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';

// Dynamically import stylis-plugin-rtl only when needed
export default async function createEmotionCache(direction = 'ltr') {
  if (direction === 'rtl') {
    const rtlPlugin = (await import('stylis-plugin-rtl')).default;
    return createCache({
      key: 'mui-rtl',
      stylisPlugins: [prefixer, rtlPlugin],
    });
  }

  // LTR fallback
  return createCache({
    key: 'mui-ltr',
    stylisPlugins: [prefixer],
  });
}

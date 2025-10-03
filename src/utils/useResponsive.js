import { useMemo } from 'react';
import { Platform, useWindowDimensions } from 'react-native';

export function useResponsive() {
  const { width } = useWindowDimensions();

  const isWeb = Platform.OS === 'web';

  const breakpoint = useMemo(() => {
    if (width >= 1280) return 'xl';
    if (width >= 1024) return 'lg';
    if (width >= 768) return 'md';
    if (width >= 480) return 'sm';
    return 'xs';
  }, [width]);

  const scale = useMemo(() => {
    switch (breakpoint) {
      case 'xl':
        return 1.2;
      case 'lg':
        return 1.1;
      case 'md':
        return 1.0;
      case 'sm':
        return 0.95;
      default:
        return 0.9;
    }
  }, [breakpoint]);

  return { width, isWeb, breakpoint, scale };
}



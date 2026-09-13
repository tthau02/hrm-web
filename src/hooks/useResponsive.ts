import { useState, useEffect } from 'react';

export interface ResponsiveState {
  isMobile: boolean;      // < 640px (or xs: < 576px / sm: < 768px in mobile mode)
  isTablet: boolean;      // 640px - 1023px
  isDesktop: boolean;     // 1024px - 1279px
  isWide: boolean;        // >= 1280px
  screenWidth: number;
}

/**
 * Custom hook to detect screen size and current responsive breakpoint
 * according to DESIGN.md guidelines:
 * - Mobile: < 640px
 * - Tablet: 640px - 1023px
 * - Desktop: 1024px - 1279px
 * - Wide: >= 1280px
 */
export function useResponsive(): ResponsiveState {
  const [windowWidth, setWindowWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timeoutId: number;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setWindowWidth(window.innerWidth);
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  const isMobile = windowWidth < 768; // Under 768px acts as mobile layout (single column / off-canvas nav)
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const isDesktop = windowWidth >= 1024 && windowWidth < 1280;
  const isWide = windowWidth >= 1280;

  return {
    isMobile,
    isTablet,
    isDesktop,
    isWide,
    screenWidth: windowWidth,
  };
}

export default useResponsive;

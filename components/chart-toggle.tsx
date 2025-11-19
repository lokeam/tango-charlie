import ChartDotsIcon from '@/components/ui/icons/ChartDotsIcon';
import ChartColumnIcon from '@/components/ui/icons/ChartColumnIcon';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export function ChartToggle() {
  const pathname = usePathname();
  const [shouldAnimate, setShouldAnimate] = useState(false);

  // Show dots icon when on charts page, column icon otherwise
  const isOnChartsPage = pathname?.includes('/demos/chart');
  const showDotsIcon = isOnChartsPage;

  // Delay animation to avoid competing with Highcharts
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldAnimate(true);
    }, 1500); // Wait for charts to load

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div className="relative flex items-center justify-center">
      <ChartDotsIcon
        className={`size-6 ${
          shouldAnimate
            ? 'transition-all duration-300 ease-in-out'
            : ''
        } ${
          showDotsIcon
            ? 'scale-100 rotate-0 opacity-100'
            : 'scale-0 -rotate-90 opacity-0'
        }`}
      />
      <ChartColumnIcon
        className={`absolute size-6 ${
          shouldAnimate
            ? 'transition-all duration-300 ease-in-out'
            : ''
        } ${
          !showDotsIcon
            ? 'scale-100 rotate-0 opacity-100'
            : 'scale-0 rotate-90 opacity-0'
        }`}
      />
    </div>
  )
};

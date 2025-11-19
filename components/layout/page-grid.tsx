import React from 'react';
import { cn } from '@/components/ui/utils';

interface PageGridProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
  children?: React.ReactNode;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
  };
};

export function PageGrid({
  className,
  children,
  columns = { sm: 2, lg: 4 },
  ...props
}: PageGridProps) {

  // Map numbers to explicit Tailwind classes to avoid purging issues
  const getGridClass = (breakpoint: string, cols?: number) => {
    if (!cols) return '';
    const classMap: Record<string, Record<number, string>> = {
      sm: {
        1: 'sm:grid-cols-1',
        2: 'sm:grid-cols-2',
        3: 'sm:grid-cols-3',
        4: 'sm:grid-cols-4',
      },
      md: {
        1: 'md:grid-cols-1',
        2: 'md:grid-cols-2',
        3: 'md:grid-cols-3',
        4: 'md:grid-cols-4',
      },
      lg: {
        1: 'lg:grid-cols-1',
        2: 'lg:grid-cols-2',
        3: 'lg:grid-cols-3',
        4: 'lg:grid-cols-4',
      },
    };
    return classMap[breakpoint]?.[cols] || '';
  };

  const gridColumns = cn(
    'grid gap-4 grid-cols-1', // Base: single column
    getGridClass('sm', columns.sm),
    getGridClass('md', columns.md),
    getGridClass('lg', columns.lg),
    className,
  );

  return (
    <div className={gridColumns} {...props}>
      { children }
    </div>
  );
}

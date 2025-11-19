import { cn } from '@/components/ui/utils';

type ChartColumnIconProps = {
  className: string;
}

export default function ChartColumnIcon({ className }: ChartColumnIconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round" className={cn("icon icon-tabler icons-tabler-outline icon-tabler-chart-column", className)}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <path d="M4 20h3" />
      <path d="M17 20h3" />
      <path d="M10.5 20h3" />
      <path d="M4 16h3" />
      <path d="M17 16h3" />
      <path d="M10.5 16h3" />
      <path d="M4 12h3" />
      <path d="M17 12h3" />
      <path d="M10.5 12h3" />
      <path d="M4 8h3" />
      <path d="M17 8h3" />
      <path d="M4 4h3" />
    </svg>
  );
};

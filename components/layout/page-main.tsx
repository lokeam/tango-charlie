import React from 'react';
import { cn } from '@/components/ui/utils';

interface PageMainProps extends React.HTMLAttributes<HTMLElement> {
  fixed?: boolean
  ref?: React.Ref<HTMLElement>
}

export function PageMain({
  fixed,
  ...props
}: PageMainProps) {
  return (
    <main
      className={cn(
        'peer-[.header-fixed]/header:mt-16 mx-auto w-full max-w-4xl',
        'px-4 py-16',
        fixed && 'fixed-main flex flex-col grow overflow-hidden '
      )}
      {...props}
    />
  );
}

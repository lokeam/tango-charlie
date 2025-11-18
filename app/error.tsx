'use client';

import { useEffect } from 'react';
import { ErrorPageTwoColTemplate } from '@/components/error/ErrorPageTwoColTemplate';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Ideally log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <ErrorPageTwoColTemplate
      title="Something went wrong!"
      subtext="We encountered an unexpected error. Please try again."
      buttonText="Try again"
      onButtonClick={reset}
    />
  );
}
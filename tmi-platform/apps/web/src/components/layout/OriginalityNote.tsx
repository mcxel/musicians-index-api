// tmi-platform/apps/web/src/components/layout/OriginalityNote.tsx
'use client';

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/20/solid';

// This is a placeholder hook. In a real app, this would come from a user context or SWR/React Query
const useUser = () => ({
  // Replace with actual user data fetching
  user: { role: 'ARTIST', acceptedOriginalityAgreementAt: null },
  isLoading: false,
});

// This is a placeholder mutation hook.
const useAcceptAgreement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const accept = async () => {
    setIsLoading(true);
    // In a real app, you would use fetch or axios to call the API
    console.log('Calling POST /api/users/me/accept-originality');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    // await fetch('/api/users/me/accept-originality', { method: 'POST' });
    setIsLoading(false);
  };
  return { accept, isLoading };
};

export function OriginalityNote() {
  const { user, isLoading: isUserLoading } = useUser();
  const { accept, isLoading: isAccepting } = useAcceptAgreement();
  const [isDismissed, setIsDismissed] = useState(false);

  const handleAccept = async () => {
    await accept();
    setIsDismissed(true);
  };

  // Conditions for showing the note:
  // 1. User is loaded and is an ARTIST.
  // 2. They have NOT accepted the agreement on the backend.
  // 3. The user has NOT dismissed the note in the current session.
  const shouldShow =
    !isUserLoading &&
    user?.role === 'ARTIST' &&
    !user.acceptedOriginalityAgreementAt &&
    !isDismissed;

  if (!shouldShow) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed bottom-0 right-0 z-50 p-4 sm:p-6">
      <div className="pointer-events-auto w-80 rounded-lg bg-yellow-400 p-4 text-black shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-yellow-900">Originality Sticky Note</p>
            <p className="mt-1 text-xs text-yellow-800">
              As an artist, you must agree that all content you submit is your own original work.
              This is a mandatory requirement for participation.
            </p>
          </div>
          <button
            type="button"
            className="ml-2 inline-flex rounded-md p-1 text-yellow-800 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 focus:ring-offset-yellow-400"
            onClick={() => setIsDismissed(true)}
            aria-label="Dismiss"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3">
          <button
            type="button"
            onClick={handleAccept}
            disabled={isAccepting}
            className="w-full rounded-md border border-transparent bg-yellow-800 px-3 py-2 text-xs font-medium text-white hover:bg-yellow-900 focus:outline-none focus:ring-2 focus:ring-yellow-700 focus:ring-offset-2 focus:ring-offset-yellow-400 disabled:opacity-50"
          >
            {isAccepting ? 'Saving...' : 'I Agree and Accept'}
          </button>
        </div>
      </div>
    </div>
  );
}

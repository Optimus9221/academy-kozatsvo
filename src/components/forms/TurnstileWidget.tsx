"use client";

import { Turnstile } from "@marsidev/react-turnstile";

export function TurnstileWidget({
  onSuccess,
}: {
  onSuccess: (token: string) => void;
}) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  if (!siteKey) return null;

  return (
    <div className="flex justify-center">
      <Turnstile siteKey={siteKey} onSuccess={onSuccess} />
    </div>
  );
}

"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-3 text-center">
      <h2 className="text-lg font-semibold">Algo ha fallado</h2>
      <p className="max-w-md text-sm text-muted-foreground">{error.message || "Error desconocido"}</p>
      {error.digest ? (
        <p className="text-xs text-muted-foreground">Digest: {error.digest}</p>
      ) : null}
      <Button type="button" onClick={reset} size="sm">
        Reintentar
      </Button>
    </div>
  );
}

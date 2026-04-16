"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { requestMagicLinkAction } from "./actions";

type Status =
  | { kind: "idle" }
  | { kind: "error"; message: string }
  | { kind: "sent"; email: string };

export function LoginForm({ next, callbackError }: { next: string; callbackError: string | null }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>(
    callbackError ? { kind: "error", message: `No se pudo iniciar sesión: ${callbackError}` } : { kind: "idle" },
  );
  const [pending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const res = await requestMagicLinkAction({ email, next });
      if (res.ok) {
        setStatus({ kind: "sent", email: res.data.email });
      } else {
        setStatus({ kind: "error", message: res.error });
      }
    });
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>N300</CardTitle>
        <CardDescription>Libreta de atleta: entrenamiento, salud y dieta.</CardDescription>
      </CardHeader>
      <CardContent>
        {status.kind === "sent" ? (
          <p className="text-sm">
            Te hemos enviado un enlace de acceso a <strong>{status.email}</strong>. Revisa tu correo y abre
            el enlace en este dispositivo.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-3" noValidate>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                disabled={pending}
              />
            </div>
            {status.kind === "error" ? (
              <p role="alert" className="text-sm text-destructive">
                {status.message}
              </p>
            ) : null}
            <Button type="submit" disabled={pending || email.length === 0}>
              {pending ? "Enviando…" : "Enviar enlace mágico"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

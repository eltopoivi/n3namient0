"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { signInAction } from "./actions";

type Status = { kind: "idle" | "error"; message?: string };

export function LoginForm({
  next,
  callbackError,
  verified,
}: {
  next: string;
  callbackError: string | null;
  verified: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const initial: Status = callbackError
    ? { kind: "error", message: `No se pudo iniciar sesión: ${callbackError}` }
    : { kind: "idle" };
  const [status, setStatus] = useState<Status>(initial);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const res = await signInAction({ email, password });
      if (res.ok) {
        router.push(next);
        router.refresh();
      } else {
        setStatus({ kind: "error", message: res.error });
      }
    });
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Iniciar sesión</CardTitle>
        <CardDescription>Accede a tu libreta de atleta.</CardDescription>
      </CardHeader>
      <CardContent>
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
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={pending}
            />
          </div>
          {verified ? (
            <p className="text-sm text-muted-foreground">
              Cuenta verificada. Inicia sesión para continuar.
            </p>
          ) : null}
          {status.kind === "error" && status.message ? (
            <p role="alert" className="text-sm text-destructive">
              {status.message}
            </p>
          ) : null}
          <Button type="submit" disabled={pending || email.length === 0 || password.length === 0}>
            {pending ? "Entrando…" : "Entrar"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center text-sm text-muted-foreground">
        ¿No tienes cuenta?&nbsp;
        <Link href="/signup" className="font-medium text-foreground underline-offset-4 hover:underline">
          Crear cuenta
        </Link>
      </CardFooter>
    </Card>
  );
}

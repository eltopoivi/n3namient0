"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { signUpAction } from "./actions";

type Status =
  | { kind: "idle" }
  | { kind: "error"; message: string }
  | { kind: "sent"; email: string };

export function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [pending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const res = await signUpAction({ email, password });
      if (!res.ok) {
        setStatus({ kind: "error", message: res.error });
        return;
      }
      if (res.data.requiresConfirmation) {
        setStatus({ kind: "sent", email: res.data.email });
      } else {
        router.push("/");
        router.refresh();
      }
    });
  }

  if (status.kind === "sent") {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Verifica tu correo</CardTitle>
          <CardDescription>
            Te hemos enviado un enlace a <strong>{status.email}</strong>. Ábrelo para activar tu cuenta.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link href="/login" className="text-sm font-medium underline-offset-4 hover:underline">
            Ir a iniciar sesión
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Crear cuenta</CardTitle>
        <CardDescription>Empieza tu libreta de atleta.</CardDescription>
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
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={pending}
            />
            <p className="text-xs text-muted-foreground">Mínimo 8 caracteres.</p>
          </div>
          {status.kind === "error" ? (
            <p role="alert" className="text-sm text-destructive">
              {status.message}
            </p>
          ) : null}
          <Button type="submit" disabled={pending || email.length === 0 || password.length === 0}>
            {pending ? "Creando…" : "Crear cuenta"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?&nbsp;
        <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
          Iniciar sesión
        </Link>
      </CardFooter>
    </Card>
  );
}

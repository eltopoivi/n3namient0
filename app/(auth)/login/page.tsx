import { Wordmark } from "@/components/brand/wordmark";

import { LoginForm } from "./login-form";

export const metadata = {
  title: "Iniciar sesión · N300",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string; error?: string; verified?: string };
}) {
  const next = searchParams.next ?? "/";
  const callbackError = searchParams.error ?? null;
  const verified = searchParams.verified === "1";
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 py-10">
      <Wordmark mark tagline className="items-center text-center text-4xl" />
      <LoginForm next={next} callbackError={callbackError} verified={verified} />
    </main>
  );
}

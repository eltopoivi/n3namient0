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
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <LoginForm next={next} callbackError={callbackError} verified={verified} />
    </main>
  );
}

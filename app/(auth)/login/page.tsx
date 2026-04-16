import { LoginForm } from "./login-form";

export const metadata = {
  title: "Iniciar sesión · N300",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  const next = searchParams.next ?? "/";
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <LoginForm next={next} />
    </main>
  );
}

import { SignupForm } from "./signup-form";

export const metadata = {
  title: "Crear cuenta · N300",
};

export default function SignupPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <SignupForm />
    </main>
  );
}

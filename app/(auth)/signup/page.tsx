import { Wordmark } from "@/components/brand/wordmark";

import { SignupForm } from "./signup-form";

export const metadata = {
  title: "Crear cuenta · N300",
};

export default function SignupPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 py-10">
      <Wordmark mark tagline className="items-center text-center text-4xl" />
      <SignupForm />
    </main>
  );
}

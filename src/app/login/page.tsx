import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = {
  title: "Log in — Chefie",
  description: "Sign in to use voice guidance and AI recipe generation.",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted">
          Loading…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

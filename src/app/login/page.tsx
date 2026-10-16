import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8 bg-gradient-to-b from-slate-50 via-slate-100 to-purple-50/20">
      <Suspense fallback={
        <div className="w-full max-w-md h-96 bg-white rounded-2xl border border-slate-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </main>
  );
}

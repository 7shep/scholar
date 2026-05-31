import * as React from "react";

import { HomePage } from "@/components/home-page";
import { AuthProvider, useAuth } from "@/context/auth-context";
import { Demo } from "./demo";

function AppContent() {
  const { isLoading, signIn, signOut, signUp, user } = useAuth();
  const [authError, setAuthError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  const clearAuthError = React.useCallback(() => {
    setAuthError(null);
  }, []);

  const handleSignIn = React.useCallback(
    async (input: { email: string; password: string }) => {
      try {
        setIsSubmitting(true);
        setAuthError(null);
        await signIn(input);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unable to sign in.";
        setAuthError(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [signIn],
  );

  const handleSignUp = React.useCallback(
    async (input: { email: string; fullName: string; password: string }) => {
      try {
        setIsSubmitting(true);
        setAuthError(null);
        await signUp(input);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unable to create account.";
        setAuthError(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [signUp],
  );

  const handleSignOut = React.useCallback(async () => {
    try {
      setIsSigningOut(true);
      await signOut();
    } finally {
      setIsSigningOut(false);
    }
  }, [signOut]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#060816]">
        <p className="text-sm uppercase tracking-[0.28em] text-cyan-200/80">
          Restoring session...
        </p>
      </main>
    );
  }

  if (user) {
    return (
      <HomePage
        email={user.email}
        isSigningOut={isSigningOut}
        onSignOut={handleSignOut}
      />
    );
  }

  return (
    <Demo
      authError={authError}
      isSubmitting={isSubmitting}
      onClearError={clearAuthError}
      onSignIn={handleSignIn}
      onSignUp={handleSignUp}
    />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

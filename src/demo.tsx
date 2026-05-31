import * as React from "react";

import { SignIn } from "@/components/ui/signIn";
import { SignUp } from "@/components/ui/signUp";

const FADE_DURATION_MS = 220;

type DemoProps = {
  authError: string | null;
  isSubmitting: boolean;
  onClearError: () => void;
  onSignIn: (input: { email: string; password: string }) => Promise<void>;
  onSignUp: (input: {
    email: string;
    fullName: string;
    password: string;
  }) => Promise<void>;
};

const Demo = ({
  authError,
  isSubmitting,
  onClearError,
  onSignIn,
  onSignUp,
}: DemoProps) => {
  const [mode, setMode] = React.useState<"sign-in" | "sign-up">("sign-in");
  const [isVisible, setIsVisible] = React.useState(true);
  const transitionTimerRef = React.useRef<number | null>(null);

  const switchMode = React.useCallback((nextMode: "sign-in" | "sign-up") => {
    if (nextMode === mode) {
      return;
    }

    if (transitionTimerRef.current !== null) {
      window.clearTimeout(transitionTimerRef.current);
    }

    onClearError();
    setIsVisible(false);

    transitionTimerRef.current = window.setTimeout(() => {
      setMode(nextMode);
      setIsVisible(true);
      transitionTimerRef.current = null;
    }, FADE_DURATION_MS);
  }, [mode]);

  React.useEffect(() => {
    return () => {
      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  let content: React.ReactNode;

  if (mode === "sign-up") {
    content = (
      <SignUp
        errorMessage={authError}
        isSubmitting={isSubmitting}
        onClearError={onClearError}
        onSubmit={onSignUp}
        onSwitchToSignIn={() => switchMode("sign-in")}
      />
    );
  } else {
    content = (
      <SignIn
        errorMessage={authError}
        isSubmitting={isSubmitting}
        onClearError={onClearError}
        onSubmit={onSignIn}
        onSwitchToSignUp={() => switchMode("sign-up")}
      />
    );
  }

  return (
    <div
      className={`transition-opacity duration-200 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      style={{ transitionDuration: `${FADE_DURATION_MS}ms` }}
    >
      {content}
    </div>
  );
};

export { Demo };

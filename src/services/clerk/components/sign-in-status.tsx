import { Show } from "@clerk/nextjs";
import { ReactNode, Suspense } from "react";

type AuthStatus = "signed-in" | "signed-out";

export const SignInStatus = ({
  children,
  when = "signed-in",
}: {
  children: ReactNode;
  when?: AuthStatus;
}) => {
  return (
    <Suspense>
      <Show when={when}>{children}</Show>
    </Suspense>
  );
};

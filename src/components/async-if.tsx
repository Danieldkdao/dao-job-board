import { ReactNode, Suspense } from "react";

type AsyncIfProps = {
  condition: () => Promise<boolean>;
  children: ReactNode;
  loadingFallback?: ReactNode;
  otherwise?: ReactNode;
};

export const AsyncIf = ({
  condition,
  children,
  loadingFallback,
  otherwise,
}: AsyncIfProps) => {
  return (
    <Suspense fallback={loadingFallback}>
      <AsyncIfSuspense condition={condition} otherwise={otherwise}>
        {children}
      </AsyncIfSuspense>
    </Suspense>
  );
};

const AsyncIfSuspense = async ({
  condition,
  children,
  otherwise,
}: Omit<AsyncIfProps, "loadingFallback">) => {
  return (await condition()) ? children : otherwise;
};

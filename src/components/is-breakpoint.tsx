"use client";

import { ReactNode, useEffect, useState } from "react";

export const IsBreakpoint = ({
  breakpoint,
  children,
  otherwise,
}: {
  breakpoint: string;
  children: ReactNode;
  otherwise: ReactNode;
}) => {
  const isBreakpoint = useIsBreakpoint(breakpoint);
  return isBreakpoint ? children : otherwise;
};

const useIsBreakpoint = (breakpoint: string) => {
  const [isBreakpoint, setIsBreakpoint] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    const media = window.matchMedia(`(${breakpoint})`);
    media.addEventListener(
      "change",
      (e) => {
        setIsBreakpoint(e.matches);
      },
      { signal: controller.signal },
    );
    setIsBreakpoint(media.matches);

    controller.abort();
  }, [breakpoint]);

  return isBreakpoint;
};

"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  basePath?: string;
}

export function SessionProvider({ children, basePath }: Props) {
  return (
    <NextAuthSessionProvider 
      basePath={basePath}
      refetchInterval={0} // Disable automatic refetching temporarily
      refetchOnWindowFocus={false} // Disable window focus refetching
    >
      {children}
    </NextAuthSessionProvider>
  );
}
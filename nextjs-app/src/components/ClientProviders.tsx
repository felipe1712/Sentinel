"use client";

import React from "react";
import { Providers } from "@/providers";
import { Toaster } from "react-hot-toast";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      {children}
      <Toaster position="top-right" />
    </Providers>
  );
}

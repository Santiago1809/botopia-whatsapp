"use client";

import React from "react";
import { AuthProvider } from "@/lib/auth";
import { ChatProvider } from "@/lib/chatState";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ChatProvider>{children}</ChatProvider>
    </AuthProvider>
  );
}

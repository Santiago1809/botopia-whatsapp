"use client";

import React from "react";
import { AuthProvider } from "@/lib/auth";
import { ChatProvider } from "@/lib/chatState";
import { SocketProvider } from "@/context/SocketContext";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ChatProvider>
        <SocketProvider>{children}</SocketProvider>
      </ChatProvider>
    </AuthProvider>
  );
}

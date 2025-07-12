"use client";

import { WhatsAppProvider } from "@/context/WhatsAppContext";

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WhatsAppProvider>{children}</WhatsAppProvider>;
}

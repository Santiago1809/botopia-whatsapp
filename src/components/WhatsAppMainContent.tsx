"use client";

import { WhatsappNumber } from "@/types/gobal";
import WhatsAppMessageSection from "./WhatsAppMessageSection";

// Define interfaces for our types

interface QRCodes {
  [key: string]: string | null;
}

interface WhatsAppMainContentProps {
  selectedNumber: WhatsappNumber | null;
  qrCodes: QRCodes;
}

export default function WhatsAppMainContent({
  selectedNumber,
  qrCodes,
}: WhatsAppMainContentProps) {
  return selectedNumber ? (
    <div className="flex-1 overflow-auto">
      <WhatsAppMessageSection
        selectedNumber={selectedNumber}
        qrCodes={qrCodes}
      />
    </div>
  ) : (
    <div className="flex-1 flex items-center justify-center overflow-auto">
      <p className="text-gray-500 text-sm sm:text-lg">
        Selecciona un número para comenzar
      </p>
    </div>
  );
}

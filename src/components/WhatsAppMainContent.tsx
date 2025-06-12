"use client";

import { WhatsappNumber } from "@/types/gobal";
import WhatsAppMessageSection from "./WhatsAppMessageSection";
import { Contact, Group } from "@/types/global";

// Define interfaces for our types

interface QRCodes {
  [key: string]: string | null;
}

interface WhatsAppMainContentProps {
  selectedNumber: WhatsappNumber | null;
  qrCodes: QRCodes;
  selectedChat?: Contact | Group | null;
}

export default function WhatsAppMainContent({
  selectedNumber,
  qrCodes,
  selectedChat,
}: WhatsAppMainContentProps) {
  return selectedNumber ? (
    <div className="flex-1 overflow-auto bg-[#e5ded8]">
      <WhatsAppMessageSection
        selectedNumber={selectedNumber}
        qrCodes={qrCodes}
        selectedChat={selectedChat}
      />
    </div>
  ) : (
    <div className="flex-1 flex items-center justify-center overflow-auto bg-[#f5f5f5]">
      <div className="text-center p-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#075e54] flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-white"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <p className="text-gray-500 text-lg font-light">
          Selecciona un número para comenzar
        </p>
      </div>
    </div>
  );
}

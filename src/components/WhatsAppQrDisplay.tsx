import React from 'react';
import Image from 'next/image';

interface WhatsAppQrDisplayProps {
  qrCode: string | null;
  number: string | number;
}

const WhatsAppQrDisplay: React.FC<WhatsAppQrDisplayProps> = ({ qrCode, number }) => {
  if (!qrCode) return null;

  return (
    <div className="flex justify-center items-center p-4">
      <Image 
        src={qrCode} 
        alt={`Código QR para ${number}`}
        width={256}
        height={256}
        className="max-w-full h-auto"
      />
    </div>
  );
};

export default WhatsAppQrDisplay;

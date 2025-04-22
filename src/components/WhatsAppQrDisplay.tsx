interface WhatsAppQrDisplayProps {
  qrCode: string | null;
  number: string | number;
}

export default function WhatsAppQrDisplay({
  qrCode,
  number,
}: WhatsAppQrDisplayProps) {
  if (!qrCode) return null;
  return (
    <img
      src={qrCode}
      alt={`Código QR para ${number}`}
      className="w-full h-full"
    />
  );
}

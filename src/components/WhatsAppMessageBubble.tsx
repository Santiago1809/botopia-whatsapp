interface ChatBubbleProps {
  message: string;
  isMine: boolean;
}

export default function WhatsAppChatBubble({
  message,
  isMine,
}: ChatBubbleProps) {
  return (
    <div
      className={`flex items-center w-full mb-2 ${
        isMine ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`p-3 rounded-lg break-words max-w-prose text-sm font-medium ${
          isMine ? "bg-[#d6bcfa] text-black" : "bg-gray-200 text-black"
        }`}
      >
        {message}
      </div>
    </div>
  );
}

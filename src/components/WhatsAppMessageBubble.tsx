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
      className={`flex items-center space-x-2 w-full mb-2 ${
        isMine ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`p-3 rounded-lg break-words max-w-prose ${
          isMine ? "bg-green-400 text-black text-sm font-medium" : "bg-gray-200"
        }`}
      >
        {message}
      </div>
    </div>
  );
}

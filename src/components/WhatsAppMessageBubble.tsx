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
        className={`p-3 rounded-lg break-words max-w-[75%] text-sm font-medium relative ${
          isMine
            ? "bg-primary/30 text-foreground dark:text-foreground rounded-tr-none mr-2"
            : "bg-muted text-foreground dark:text-foreground rounded-tl-none ml-2"
        }`}
      >
        {message}

        {/* Triángulo para la burbuja (similar a WhatsApp) */}
        <div
          className={`absolute top-0 w-4 ${
            isMine ? "right-0 -mr-2 bg-primary/30" : "left-0 -ml-2 bg-muted"
          }`}
          style={{
            clipPath: isMine
              ? "polygon(100% 0, 0 0, 100% 100%)"
              : "polygon(0 0, 100% 0, 0 100%)",
          }}
        />
      </div>
    </div>
  );
}

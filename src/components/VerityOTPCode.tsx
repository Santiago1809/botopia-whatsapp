import { FormEvent } from "react";
import { Input } from "./ui/input";

interface VerityOTPCodeProps {
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  code: string;
  setCode: (val: string) => void;
  error: string;
  isSubmitting: boolean;
}

export default function VerityOTPCode({
  code,
  error,
  handleSubmit,
  isSubmitting,
  setCode,
}: VerityOTPCodeProps) {
  // Handle paste event to automatically fill all boxes
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      setCode(pastedData);
    }
  };
  return (
    <div className="md:3/5 p-6 sm:p-8 bg-white">
      <div className="mb-6 sm:mb-8">
        {" "}
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
          Verificar código
        </h2>
        <p>
          Ingresa el código de 6 dígitos que llegó a tu correo electrónico para
          continuar con el proceso de recuperación
        </p>
      </div>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
        <div>
          {" "}
          <label
            htmlFor="code"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Código de verificación
          </label>{" "}
          <div className="flex gap-2 justify-between" onPaste={handlePaste}>
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <Input
                key={index}
                id={`code-${index}`}
                type="text"
                maxLength={1}
                value={code[index] || ""}
                onChange={(e) => {
                  // Only allow numbers
                  if (!/^\d*$/.test(e.target.value)) return;

                  const newCode = code.split("");
                  newCode[index] = e.target.value;
                  setCode(newCode.join(""));

                  // Auto focus next input when digit is entered
                  if (e.target.value && index < 5) {
                    const nextInput = document.getElementById(
                      `code-${index + 1}`
                    );
                    if (nextInput) nextInput.focus();
                  }
                }}
                onKeyDown={(e) => {
                  // Handle backspace to go to previous input
                  if (e.key === "Backspace" && !code[index] && index > 0) {
                    const prevInput = document.getElementById(
                      `code-${index - 1}`
                    );
                    if (prevInput) prevInput.focus();
                  }
                }}
                className="w-12 h-12 text-center text-lg font-medium border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                inputMode="numeric"
                pattern="[0-9]"
                required
              />
            ))}
          </div>
        </div>
        <div className="mt-2 sm:mt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 flex items-center justify-center"
          >
            {" "}
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            ) : null}
            {isSubmitting ? "Verificando código..." : "Verificar código"}
          </button>
        </div>
      </form>
    </div>
  );
}

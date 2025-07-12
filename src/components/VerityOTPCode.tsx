import { FormEvent } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface VerityOTPCodeProps {
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  code: string;
  setCode: (val: string) => void;
  error: string;
  isSubmitting: boolean;
  showHeader?: boolean; // Nuevo prop para controlar si mostrar el header
  headerTitle?: string; // Título personalizable del header
  headerDescription?: string; // Descripción personalizable del header
  buttonText?: string; // Texto personalizable del botón
  buttonLoadingText?: string; // Texto personalizable del botón cuando está cargando
}

export default function VerityOTPCode({
  code,
  error,
  handleSubmit,
  isSubmitting,
  setCode,
  showHeader = true, // Por defecto muestra el header
  headerTitle = "Verificar código", // Título por defecto
  headerDescription = "Ingresa el código de 6 dígitos que llegó a tu WhatsApp para continuar con el proceso de verificación", // Descripción por defecto
  buttonText = "Verificar código", // Texto del botón por defecto
  buttonLoadingText = "Verificando código...", // Texto del botón cargando por defecto
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
    <div className="bg-background">
      {showHeader && (
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            {headerTitle}
          </h2>
          <p className="text-muted-foreground">
            {headerDescription}
          </p>
        </div>
      )}
      
      {error && showHeader && (
        <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
          {error}
        </div>
      )}
      
      <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
        <div>
          <Label
            htmlFor="code"
            className="block text-sm font-medium text-foreground mb-1"
          >
            Código de verificación
          </Label>
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
                className="w-12 h-12 text-center text-lg font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
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
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            ) : null}
            {isSubmitting ? buttonLoadingText : buttonText}
          </button>
        </div>
      </form>
    </div>
  );
}

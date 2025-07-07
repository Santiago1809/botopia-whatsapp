import { FormEvent } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface RequestOTPCodeProps {
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  email: string;
  setEmail: (val: string) => void;
  error: string;
  isSubmitting: boolean;
}

export default function RequestOTPCode({
  handleSubmit,
  email,
  setEmail,
  error,
  isSubmitting,
}: RequestOTPCodeProps) {
  return (
    <div className="md:3/5 p-6 sm:p-8 bg-background">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          Recuperar contraseña
        </h2>
        <p className="text-muted-foreground">
          Ingresa tu correo electrónico y te enviaremos instrucciones para
          restablecer tu contraseña
        </p>
      </div>
      {error && (
        <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
          {error}
        </div>
      )}
      <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
        <div>
          <Label
            htmlFor="email"
            className="block text-sm font-medium text-foreground mb-1"
          >
            Correo electrónico
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ingresa tu correo electrónico"
            className="w-full"
            required
          />
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
            {isSubmitting ? "Solicitando código..." : "Solicitar código"}
          </button>
        </div>
      </form>
    </div>
  );
}

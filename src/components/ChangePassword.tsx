import { FormEvent } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface ChangePasswordProps {
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  password: string;
  setPassword: (val: string) => void;
  error: string;
  isSubmitting: boolean;
}

export default function ChangePassword({
  error,
  handleSubmit,
  isSubmitting,
  password,
  setPassword,
}: ChangePasswordProps) {
  return (
    <div className="md:3/5 p-6 sm:p-8 bg-background">
      <div className="mb-6 sm:mb-8">
        {" "}
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          Establecer nueva contraseña
        </h2>
        <p className="text-muted-foreground">
          Ingresa tu nueva contraseña para restablecer el acceso a tu cuenta
        </p>
      </div>
      {error && (
        <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
          {error}
        </div>
      )}
      <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
        <div>
          {" "}
          <Label
            htmlFor="password"
            className="block text-sm font-medium text-foreground mb-1"
          >
            Nueva contraseña
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ingresa tu nueva contraseña"
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
            {" "}
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            ) : null}
            {isSubmitting ? "Cambiando contraseña..." : "Cambiar contraseña"}
          </button>
        </div>
      </form>
    </div>
  );
}

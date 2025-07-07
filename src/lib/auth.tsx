"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// Tipo para el usuario
interface User {
  id?: string;
  name?: string;
  username?: string;
  email?: string;
  phoneNumber?: string;
  countryCode?: string;
  role?: string;
}

// Contexto de autenticación
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (identifier: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string,
    countryCode?: string,
    phoneNumber?: string
  ) => Promise<void>;
  logout: () => void;
  getToken: () => string | null;
}

// Creación del contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

// Proveedor del contexto de autenticación
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  // Función para iniciar sesión con la API real
  const login = async (identifier: string, password: string) => {
    try {
      console.log("Enviando solicitud de login...", {
        identifier,
        backend: BACKEND_URL,
      });

      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier, password }),
      });

      console.log("Respuesta recibida:", {
        status: response.status,
        ok: response.ok,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || "Credenciales inválidas";
        console.error("Error en login:", errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Datos de login exitoso:", data);

      // Guardamos el token en localStorage si tu API lo devuelve
      if (data.token) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
      }

      // Guardamos los datos del usuario
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
      }

      localStorage.setItem("isAuthenticated", "true");
      setIsAuthenticated(true);

      return data; // Retornamos los datos para que el componente sepa que fue exitoso
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      // IMPORTANTE: Relanzar el error para que el componente pueda manejarlo
      throw error;
    }
  };

  // Función para registrar usuario con la API real
  const register = async (
    username: string,
    email: string,
    password: string,
    countryCode?: string,
    phoneNumber?: string
  ) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
          countryCode,
          phoneNumber,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error en el registro");
      }

      const data = await response.json();

      // NO guardamos el token ni autenticamos automáticamente
      // El usuario debe activar su cuenta por email y verificar WhatsApp primero
      return data; // Retornamos los datos por si son necesarios
    } catch (error) {
      throw new Error((error as Error).message);
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    // Si tu API tiene un endpoint de logout, podrías llamarlo aquí
    if (token) {
      try {
        fetch(`${BACKEND_URL}/api/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${getToken()}` },
        });
      } catch (err) {
        console.error(err);
      }
    }
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
    setToken(null);
    router.push("/login");
  };

  // Efecto para comprobar la autenticación cuando se carga la aplicación
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      const storedIsAuthenticated = localStorage.getItem("isAuthenticated");

      if (storedUser && storedIsAuthenticated === "true" && storedToken) {
        try {
          // Verificar si el token es válido haciendo una petición al servidor
          const response = await fetch(`${BACKEND_URL}/api/auth/profile`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });

          if (response.ok) {
            // Si la respuesta es exitosa, el token es válido
            const userData = JSON.parse(storedUser);
            setUser(userData);
            setIsAuthenticated(true);
            setToken(storedToken);
          } else {
            // Si la respuesta no es exitosa, el token no es válido
            // Limpiar el estado sin llamar a logout para evitar el ciclo
            localStorage.removeItem("user");
            localStorage.removeItem("isAuthenticated");
            localStorage.removeItem("token");
            setUser(null);
            setIsAuthenticated(false);
            setToken(null);
            router.push("/login");
          }
        } catch (error) {
          console.error("Error al verificar el token:", error);
          // Si hay un error en la petición, mantenemos la sesión si hay datos en localStorage
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAuthenticated(true);
          setToken(storedToken);
        }
      } else {
        // Si no hay token o usuario en localStorage, limpiamos el estado
        setUser(null);
        setIsAuthenticated(false);
        setToken(null);
      }

      setLoading(false);
    };

    checkAuth();
  }, [router]); // Eliminamos logout de las dependencias para evitar el ciclo

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // Si está cargando, no mostramos nada
  if (loading) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        token,
        login,
        register,
        logout,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar el contexto de autenticación
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser utilizado dentro de un AuthProvider");
  }
  return context;
}

"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rehydrate auth state on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("authUser");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Replace this with your real API call
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Invalid credentials");
    }

    const data = await response.json();
    const { token: newToken, user: newUser } = data;

    // Persist to localStorage + cookie (cookie is read by middleware)
    localStorage.setItem("authToken", newToken);
    localStorage.setItem("authUser", JSON.stringify(newUser));
    document.cookie = `authToken=${newToken}; path=/; max-age=86400`;

    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    document.cookie = "authToken=; path=/; max-age=0";
    setToken(null);
    setUser(null);
    router.push("/login");
  };

  return (
      <AuthContext.Provider
          value={{
            user,
            token,
            login,
            logout,
            isAuthenticated: !!token,
            isLoading,
          }}
      >
        {children}
      </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
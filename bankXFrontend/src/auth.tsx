import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { authApi, apiError } from "./api";
import type { AuthData, User } from "./types";

interface AuthContextValue {
  user: User | null;
  customer: AuthData["customer"] | null;
  loading: boolean;
  error: string;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [customer, setCustomer] = useState<AuthData["customer"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const logout = () => {
    localStorage.removeItem("bankx_token");
    setUser(null);
    setCustomer(null);
  };

  useEffect(() => {
    const restore = async () => {
      if (!localStorage.getItem("bankx_token")) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await authApi.me();
        setUser(data.data.user);
        setCustomer(data.data.customer);
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };
    void restore();
    const unauthorized = () => logout();
    window.addEventListener("bankx:unauthorized", unauthorized);
    return () => window.removeEventListener("bankx:unauthorized", unauthorized);
  }, []);

  const login = async (email: string, password: string) => {
    setError("");
    try {
      const { data } = await authApi.login(email, password);
      localStorage.setItem("bankx_token", data.data.token);
      setUser(data.data.user);
      setCustomer(data.data.customer);
    } catch (requestError) {
      const message = apiError(requestError);
      setError(message);
      throw new Error(message);
    }
  };

  const value = useMemo(() => ({ user, customer, loading, error, login, logout }), [user, customer, loading, error]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}

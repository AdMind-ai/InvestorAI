// src/context/AuthContext.tsx
import { createContext, useState, useEffect } from "react";
import { login as loginService, logout as logoutService } from "../api/auth";

interface User {
  name: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("access"));
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const data = await loginService(username, password);
      console.log("API Response:", data);
  
      if (data?.access) {
        setToken(data.access);
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);
  
        const userData: User = { name: username };
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        return true; 
      } else {
        console.error("Error: API didn't return valid token", data);
        return false; 
      }
    } catch (error) {
      console.error("Error logging in:", error);
      alert("Error logging in. Please check your credentials or try again.");
      return false; 
    }
  };

  const logout = () => {
    logoutService();
    setToken(null);
    setUser(null);
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
"use client";

import React, { createContext, useState, useContext, useEffect } from "react";

// Define the context type
interface TokenContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  clearToken: () => void;
  isAuthenticated: boolean;
}

// Create the context
const TokenContext = createContext<TokenContextType | undefined>(undefined);

// Create a provider component
export const TokenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(null);

  // Initialize token from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        setTokenState(storedToken);
      }
    }
  }, []);

  // Function to set token and update localStorage
  const setToken = (newToken: string | null) => {
    setTokenState(newToken);
    if (typeof window !== "undefined") {
      if (newToken) {
        localStorage.setItem("token", newToken);
      } else {
        localStorage.removeItem("token");
      }
    }
  };

  // Function to clear token
  const clearToken = () => {
    setToken(null);
  };

  const isAuthenticated = !!token;

  return (
    <TokenContext.Provider value={{ token, setToken, clearToken, isAuthenticated }}>
      {children}
    </TokenContext.Provider>
  );
};

// Custom hook to use the TokenContext
export const useTokenContext = (): TokenContextType => {
  const context = useContext(TokenContext);
  if (!context) {
    throw new Error("useTokenContext must be used within a TokenProvider");
  }
  return context;
};


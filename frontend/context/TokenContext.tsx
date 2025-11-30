"use client";

import React, { createContext, useState, useContext, useEffect } from "react";

// Define the context type
interface TokenContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  clearToken: () => void;
  isAuthenticated: boolean;
  username: string | null;
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

  // Function to decode JWT token and extract username
  const getUsernameFromToken = (token: string): string | null => {
    try {
      // JWT tokens have 3 parts separated by dots: header.payload.signature
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      // Decode the payload (second part)
      const payload = parts[1];
      // Add padding if needed for base64 decoding
      const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
      const decodedPayload = atob(paddedPayload);
      const parsedPayload = JSON.parse(decodedPayload);
      
      return parsedPayload.username || null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  const username = token ? getUsernameFromToken(token) : null;

  // Function to clear token
  const clearToken = () => {
    setToken(null);
  };

  const isAuthenticated = !!token;

  return (
    <TokenContext.Provider value={{ token, setToken, clearToken, isAuthenticated, username }}>
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


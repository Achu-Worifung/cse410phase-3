"use client";

import React, { createContext, useState, useContext } from "react";

// Define the context type
interface InputContextType {
  inputValue: string;
  setInputValue: (value: string) => void;
}

// Create the context
const InputContext = createContext<InputContextType | undefined>(undefined);

// Create a provider component
export const InputProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [inputValue, setInputValue] = useState("");

  return (
    <InputContext.Provider value={{ inputValue, setInputValue }}>
      {children}
    </InputContext.Provider>
  );
};

// Custom hook to use the InputContext
export const useInputContext = (): InputContextType => {
  const context = useContext(InputContext);
  if (!context) {
    throw new Error("useInputContext must be used within an InputProvider");
  }
  return context;
};
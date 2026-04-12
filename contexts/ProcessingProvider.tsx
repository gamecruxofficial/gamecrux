"use client";

import { createContext, useState, ReactNode, useContext } from "react";

interface ProcessingContextType {
  isProcessing: boolean;
  setIsProcessing: (isProcessing: boolean) => void;
}

// Create the context with a default value
export const ProcessingContext = createContext<ProcessingContextType | undefined>(
  undefined,
);

// Create a provider component
export const ProcessingProvider = ({ children }: { children: ReactNode }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  return (
    <ProcessingContext.Provider value={{ isProcessing, setIsProcessing }}>
      {children}
    </ProcessingContext.Provider>
  );
};

// Custom hook for easy context access
export const useProcessing = () => {
  const context = useContext(ProcessingContext);
  if (context === undefined) {
    throw new Error("useProcessing must be used within a ProcessingProvider");
  }
  return context;
};
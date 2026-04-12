"use client";

import { useProcessing } from "@/contexts/ProcessingProvider";

export const GlobalSpinner = () => {
  const { isProcessing } = useProcessing();

  if (!isProcessing) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#FFD12E] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-white text-lg font-medium">Processing your order...</p>
        <p className="text-gray-400 text-sm">Please don't close this window</p>
      </div>
    </div>
  );
};
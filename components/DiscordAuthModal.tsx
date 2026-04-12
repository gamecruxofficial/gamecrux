"use client";

import { useState, useEffect } from "react";

export default function DiscordAuthModal({ isOpen, onClose, onAuthSuccess }: { isOpen: boolean, onClose: () => void, onAuthSuccess: (id: string) => void }) {
  const [authUrl, setAuthUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/discord-auth")
        .then((res) => res.json())
        .then((data) => setAuthUrl(data.authUrl));
    }
  }, [isOpen]);

  const handleDiscordLogin = () => {
    if (authUrl) {
      window.open(authUrl, "DiscordAuth", "width=500,height=600");
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch("/api/check-discord-auth");
      const data = await res.json();
      if (data.authenticated) {
        onAuthSuccess(data.discordId);
        onClose();
      }
    };

    const interval = setInterval(checkAuth, 3000);
    return () => clearInterval(interval);
  }, [onAuthSuccess, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg text-white">
        <h2 className="text-xl mb-4">Authenticate with Discord</h2>
        <button className="bg-blue-600 px-4 py-2 rounded" onClick={handleDiscordLogin}>
          Login with Discord
        </button>
        <button className="mt-4 text-gray-400" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

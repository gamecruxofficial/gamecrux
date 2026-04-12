"use client"

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export const useSocialSignIn = () => {
  const router = useRouter();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isDiscordLoading, setIsDiscordLoading] = useState(false);

  const handleSocialSignIn = async (provider: "google" | "discord") => {
    if (provider === "google") {
      setIsGoogleLoading(true);
    } else if (provider === "discord") {
      setIsDiscordLoading(true);
    }

    try {
      const result = await signIn(provider, {
        callbackUrl: "/pages/pricing",
        redirect: true,
      });

      if (result?.error) {
        // Handle specific errors
        if (result.error === "OAuthAccountNotLinked") {
          toast.error(
            `This email is already associated with a ${provider} account. Please sign in with ${provider}.`
          );
        } else {
          toast.error(`Failed to sign in with ${provider}. Please try again.`);
        }
        console.error(`Error during ${provider} sign-in:`, result.error);
      } else if (result?.url) {
        // Use Next.js router for client-side navigation
        await router.push(result.url);
      }
    } catch (error) {
      // Handle unexpected errors
      toast.error("An unexpected error occurred. Please try again.");
      console.error(`Error during ${provider} sign-in:`, error);
    } finally {
      // Reset loading state
      if (provider === "google") {
        setIsGoogleLoading(false);
      } else if (provider === "discord") {
        setIsDiscordLoading(false);
      }
    }
  };

  return {
    isGoogleLoading,
    isDiscordLoading,
    handleSocialSignIn,
  };
};

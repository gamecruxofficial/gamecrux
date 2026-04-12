"use client"

import { useActionState, useState, useEffect } from "react"
import Link from "next/link"
import { useFormStatus } from "react-dom"
import { getSession } from "next-auth/react"
import { signInAction } from "./actions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FaDiscord } from "react-icons/fa"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSocialSignIn } from "@/hooks/useSocialSignIn"

export default function SignIn() {
  const router = useRouter()
  const [state, formAction] = useActionState(signInAction, {
    error: null,
    success: false,
  })
  const { isGoogleLoading, isDiscordLoading, handleSocialSignIn } = useSocialSignIn()

  useEffect(() => {
    if (state.success) {
      getSession().then(() => {
        router.push("/pages/pricing")
      })
    }
  }, [state, router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center -mt-[80px] p-4 bg-black bg-grid-white/[0.02]">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-6">

          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold text-white">Sign in to your account</h1>
            <p className="text-gray-400">
              Don&apos;t have an account?{" "}
              {/* <Link href="/sign-up" className="text-blue-500 hover:text-blue-400">
                Create one
              </Link> */}
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full">
          <Button
              disabled={isGoogleLoading || isDiscordLoading }
              onClick={() => handleSocialSignIn("discord")}
              variant="outline" className="w-full bg-[#111111] text-white border-gray-800 hover:bg-[#191919]"
            >
                {isDiscordLoading ? (
                <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                ) : (
                <span className="flex items-center gap-2 text-white">
                  <FaDiscord className="mx-auto w-5 h-5 text-white" />
                  Sign in with Discord
                </span>
                )}
            </Button>

          {/* <Button
              disabled={isGoogleLoading || isDiscordLoading }
              onClick={() => handleSocialSignIn("google")}
              variant="outline" className="w-full bg-[#111111] text-white border-gray-800 hover:bg-[#191919]"
            >
                {isGoogleLoading ? (
                <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                ) : (
                <span className="flex items-center gap-2 text-white">
                   <FaGoogle className="mx-auto w-4 h-4 text-white" />
                  Sign in with Google
                </span>
                )}
            </Button> */}
          </div>



          {/* <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#0A0A0A] px-2 text-gray-500">OR</span>
            </div>
          </div> */}

          {/* <form action={formAction} className="w-full space-y-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Email</label>
                <Input
                  type="email"
                  name="email"
                  placeholder="your.email@provider.com"
                  className="mt-1 bg-[#111111] border-gray-800 text-white placeholder:text-gray-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-400">Password</label>
                <Link href="/reset-password" className="text-sm text-blue-500 hover:text-blue-400">
                  Forgot?
                </Link>
              </div>
              <Input
                type="password"
                name="password"
                placeholder="••••••••••"
                className="bg-[#111111] border-gray-800 text-white placeholder:text-gray-500"
              />
            </div>

            {state.error && <p className="text-red-500 text-sm">{state.error}</p>}

            <SubmitButton />

            <p className="text-xs text-gray-500 text-center">
              By signing in, you agree to our{" "}
              <Link href="/terms" className="text-blue-500 hover:text-blue-400">
                Terms & Conditions
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-blue-500 hover:text-blue-400">
                Privacy Policy
              </Link>
              .
            </p>
          </form> */}

          <p className="text-xs text-gray-500 text-center">
              By signing in, you agree to our{" "}
              <Link href="/pages/terms" className="text-blue-500 hover:text-blue-400">
                Terms & Conditions
              </Link>{" "}
              and{" "}
              <Link href="/pages/privacy" className="text-blue-500 hover:text-blue-400">
                Privacy Policy
              </Link>
              .
          </p>
          
        </div>
      </div>
    </div>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full bg-blue-500 hover:bg-blue-600 text-white">
      {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign in"}
    </Button>
  )
}


"use client"

import { useEffect, useState } from "react"
import { useActionState } from "react"
import Link from "next/link"
import { getSession } from "next-auth/react"
import { useFormStatus } from "react-dom"
import { signUpAction } from "./actions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FaTwitter, FaGithub, FaRegEye, FaRegEyeSlash, FaUser, FaDiscord, FaGoogle } from "react-icons/fa"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { checkUsername } from "./actions"
import { useRouter } from "next/navigation"
import { useSocialSignIn } from "@/hooks/useSocialSignIn"

export default function SignUp() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState("")
  const [isUsernameUnique, setIsUsernameUnique] = useState(false)
  const [state, formAction] = useActionState(signUpAction, {
    error: null,
    success: false,
  })
  const { isGoogleLoading, isDiscordLoading, handleSocialSignIn } = useSocialSignIn()

  useEffect(() => {
    if (state.success) {
      getSession()
      router.push("/games")
    }
  }, [state, router])

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (username) {
        const isUnique = await checkUsername(username)
        setIsUsernameUnique(isUnique)
      }
    }, 250)

    return () => clearTimeout(delayDebounceFn)
  }, [username])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 -mt-[80px] bg-black bg-grid-white/[0.02]">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-6">

          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold text-white">Create an account</h1>
            <p className="text-gray-400">
              Already have an account?{" "}
              <Link href="/sign-in" className="text-blue-500 hover:text-blue-400">
                Sign in
              </Link>
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full">
          <Button
              disabled={isGoogleLoading || isDiscordLoading }
              onClick={() => handleSocialSignIn("google")}
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

          <Button
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
            </Button>
          </div>

          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#0A0A0A] px-2 text-gray-500">OR</span>
            </div>
          </div>

          <form action={formAction} className="w-full space-y-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Username</label>
                <div className="relative mt-1">
                  <Input
                    type="text"
                    name="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-[#111111] border-gray-800 text-white placeholder:text-gray-500"
                    placeholder="game123@"
                  />
                  {username && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {isUsernameUnique ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400">Email</label>
                <Input
                  type="email"
                  name="email"
                  placeholder="your.email@provider.com"
                  className="mt-1 bg-[#111111] border-gray-800 text-white placeholder:text-gray-500"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400">Password</label>
                <div className="relative mt-1">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••••"
                    className="bg-[#111111] border-gray-800 text-white pr-10 placeholder:text-gray-500"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaRegEye className="w-5 h-5" /> : <FaRegEyeSlash className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {state.error && <p className="text-red-500 text-sm">{state.error}</p>}

            <SubmitButton />

            <p className="text-xs text-gray-500 text-center">
              By signing up, you agree to our{" "}
              <Link href="/terms" className="text-blue-500 hover:text-blue-400">
                Terms & Conditions
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-blue-500 hover:text-blue-400">
                Privacy Policy
              </Link>
              .
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full bg-blue-500 hover:bg-blue-600 text-white">
      {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create account"}
    </Button>
  )
}


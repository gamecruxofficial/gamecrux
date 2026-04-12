'use client'

import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"
import { checkProvider } from "../sign-up/actions"
import { useEffect, useState } from "react"
import { FaDiscord } from "react-icons/fa"

interface SocialAccountsProps {
  user: {
    email?: string | null
  }
}

export function SocialAccounts({ user }: SocialAccountsProps) {
  const [provider, setProvider] = useState<string>("")

  useEffect(() => {
    const getProvider = async () => {
      if (user.email) {
        const result = await checkProvider(user.email)
        setProvider(result ?? "")
      }
    }
    getProvider()
  }, [user.email])

  const getProviderIcon = () => {
    switch (provider) {
      case 'google':
return <FaDiscord className="h-6 w-6" />
      case 'discord':
        return <FaDiscord className="h-12 w-12 text-blue-500" />
      case 'credentials':
return <FaDiscord className="h-6 w-6" />
    }
  }

  const getProviderName = () => {
    switch (provider) {
      case 'google':
        return 'Google'
      case 'discord':
        return 'Discord'
      case 'credentials':
        return 'Email'
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Connected social account</h3>
      <p className="text-sm text-muted-foreground">
        Services that you use to log in
      </p>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getProviderIcon()}
            <div className="text-sm">
              <div className="font-medium">{getProviderName()}</div>
              <div className="text-muted-foreground">{user.email}</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

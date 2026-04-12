"use client"

import React from "react"
import { signOut } from "next-auth/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronDown, CreditCardIcon, GamepadIcon, LogOut, Settings } from "lucide-react"
import Link from "next/link"

interface UserMenuProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  model?: string
}

export default function UserMenu({ user, model = "Free" }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center space-x-2 bg-[#FFD12E] border border-[#FFD12E] rounded-full px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#FFD12E] focus:ring-offset-2 focus:ring-offset-black">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.image || undefined} alt={user.name || "User avatar"} />
          <AvatarFallback className="bg-[#FFD12E] text-black">
        {user.name ? user.name[0].toUpperCase() : "U"}
          </AvatarFallback>
        </Avatar>
        <div className="hidden sm:flex flex-col items-start">
          <span className="text-sm font-medium text-black">{user.name}</span>
          <span className="text-xs text-gray-800">{model}</span>
        </div>
        <ChevronDown className="h-4 w-4 text-black sm:text-[#FFD12E]" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-black border border-[#FFD12E] text-white" align="end">
        <DropdownMenuLabel className="border-b border-[#FFD12E]">
          <div className="flex flex-col">
            <span className="font-bold">{user.name}</span>
            <span className="text-sm text-[#FFD12E]">{user.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuItem asChild className="focus:bg-white/10">
              <Link
                href="/games"
                className="flex items-center rounded-lg p-2 text-white hover:bg-white/60 transition-colors w-full"
              >
                <GamepadIcon className="h-5 w-5 mr-3" />
                Games
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="focus:bg-white/10">
              <Link
                href="/subscription"
                className="flex items-center rounded-lg p-2 text-white hover:bg-white/60 transition-colors w-full"
              >
                <CreditCardIcon className="h-5 w-5 mr-3" />
                Subscription
              </Link>
            </DropdownMenuItem>
        <DropdownMenuItem asChild className="focus:bg-white/10">
              <Link
                href="/settings"
                className="flex items-center rounded-lg p-2 text-white hover:bg-white/60 transition-colors w-full"
              >
                <Settings className="h-5 w-5 mr-3" />
                Settings
              </Link>
            </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem
          onClick={() => signOut()}
          className="flex items-center rounded-lg p-2 text-red-500 cursor-pointer"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


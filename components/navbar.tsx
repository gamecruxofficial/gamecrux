"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import MaxWidthWrapper from "./MaxWidth"
import { HoveredLink, Menu, MenuItem, ProductItem } from "@/components/ui/navbar-menu"
import { cn } from "@/lib/utils"
import { ArrowRight, HeadphonesIcon, Loader2 } from "lucide-react"
import { FaDiscord } from "react-icons/fa"
import UserMenu from "./user-menu"
import { SuggestDialog } from "./suggest-dialog"
import Image from "next/image"

export default function Navbar() {
  const [active, setActive] = useState<string | null>(null)
  const pathname = usePathname()
  const { data: session, status } = useSession()

  const isActive = (path: string) => pathname === path

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-sm">
      <MaxWidthWrapper maxWidth="2xl">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-20 relative">
                  {/* Logo - Left */}
            <div className="absolute left-0 flex items-center">
              <Link href="/" className="flex items-center gap-2">
                <Image width={800} height={800} src="/gc-logo.png" alt="Gamecrux Logo" className="h-24 w-24" />
              </Link>
            </div>
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Menu setActive={setActive}>
                <MenuItem
                  setActive={setActive}
                  active={active}
                  item="Home"
                  href="/"
                  className={cn(
                    isActive("/") && "underline decoration-4 underline-offset-8 decoration-[#FFD12E] text-[#FFD12E]",
                  )}
                />
                {/* <MenuItem
                  setActive={setActive}
                  active={active}
                  item="About"
                  href="/#about"
                  className={cn(
                    isActive("onClick={function onClick} about") && "underline decoration-4 underline-offset-8 decoration-[#FFD12E] text-[#FFD12E]",
                  )}
                /> */}
                 <MenuItem
                  setActive={setActive}
                  active={active}
                  item="Games"
                  href="/games"
                  className={cn(
                    isActive("/games") && "underline decoration-4 underline-offset-8 decoration-[#FFD12E] text-[#FFD12E]",
                  )}
                />
                {/* <MenuItem
                  setActive={setActive}
                  active={active}
                  item="Games"
                  className={cn(
                  isActive("/features") &&
                    "underline decoration-4 underline-offset-8 decoration-[#FFD12E] text-[#FFD12E]",
                  )}
                >
                  <div className="text-sm grid grid-cols-2 gap-10 p-4">
                  <ProductItem
                    title="Algochurn"
                    href="https://algochurn.com"
                    src="https://assets.aceternity.com/demos/algochurn.webp"
                    description="Prepare for tech interviews like never before."
                  />
                  <ProductItem
                    title="Tailwind Master Kit"
                    href="https://tailwindmasterkit.com"
                    src="https://assets.aceternity.com/demos/tailwindmasterkit.webp"
                    description="Production ready Tailwind css components for your next project"
                  />
                  <ProductItem
                    title="Moonbeam"
                    href="https://gomoonbeam.com"
                    src="https://assets.aceternity.com/demos/Screenshot+2024-02-21+at+11.51.31%E2%80%AFPM.png"
                    description="Never write from scratch again. Go from idea to blog in minutes."
                  />
                  <ProductItem
                    title="Rogue"
                    href="https://userogue.com"
                    src="https://assets.aceternity.com/demos/Screenshot+2024-02-21+at+11.47.07%E2%80%AFPM.png"
                    description="Respond to government RFPs, RFIs and RFQs 10x faster using AI"
                  />
                  <div className="col-span-2 flex items-center justify-center">
                    <Link href="/games" className="flex items-center gap-2 text-[#FFD12E] text-sm font-medium hover:underline">
                    See all games
                    <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                  </div>
                </MenuItem> */}
                <MenuItem
                  setActive={setActive}
                  active={active}
                  item="Pricing"
                  href="/pages/pricing"
                  className={cn(
                    isActive("/pages/pricing") && "underline decoration-4 underline-offset-8 decoration-[#FFD12E] text-[#FFD12E]",
                  )}
                >
                </MenuItem>
              </Menu>
            </div>
                  
        
            {/* Login Button or User Menu */}
            <div className="absolute right-0">
            {status === "loading" ? (
              
              <Button
                disabled
                className="bg-[#FFD12E] text-black hover:bg-[#FFD12E]/90 rounded-md px-4 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-[#FFD12E] focus:ring-offset-2 focus:ring-offset-black transition-colors"
              >
                Loading
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />

              </Button>
            ) : session ? (
              <div className="flex items-center gap-4">
                <Button
                  className="bg-[#262626] p-2 rounded-full text-white items-center border-black transition-all hover:opacity-70"
                  onClick={() => window.open("https://discord.gg/PcjapvBuzy", "_blank")}
                >
                  <HeadphonesIcon size={20} />
                </Button>
                {session.user.id && <SuggestDialog userId={session.user.id}/>}
                <UserMenu user={session.user} model="Free" />
              </div>
            ) : (
              
                <Button
                onClick={() => signIn("discord")}
                className="bg-[#FFD12E] text-black hover:bg-[#FFD12E]/90 rounded-md px-4 py-2 font-medium flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#FFD12E] focus:ring-offset-2 focus:ring-offset-black transition-colors"
                >
                Login
                <FaDiscord className="h-5 w-5" />

                </Button>
            )}
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  )
}

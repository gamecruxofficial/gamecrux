"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronRight } from "lucide-react"
import MaxWidthWrapper from "@/components/MaxWidth"
import { Game, games } from "@/constants/constants"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { SuggestDialog } from "@/components/suggest-dialog"
import { useState, useEffect } from "react"

const PlayerCount = ({ game }: { game: Game }) => {
  const [count, setCount] = useState(game.users.min)

  useEffect(() => {
    const generateCount = () => {
      setCount(
        Math.floor(Math.random() * (game.users.max - game.users.min + 1)) + game.users.min
      )
    }
    generateCount()
    const interval = setInterval(generateCount, 1000)
    return () => clearInterval(interval)
  }, [game.users.min, game.users.max])

  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
      </span>
      <p className="text-xs text-gray-300">{count} active</p>
    </div>
  )
}

const GameSection = ({
  title,
  games,
}: {
  title: string
  games: Game[]
  showAll: boolean
}) => {
  const currentGames = games

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎮</span>
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 2xl:grid-cols-4 4xl:grid-cols-5 gap-4">
        {currentGames.map((game, index) => (
          <Link
            scroll={true}
            key={index}
            href={game.href}
            className="group relative transition-all duration-200 hover:brightness-110 hover:shadow-lg"
          >
            <Card className="border border-white/10 bg-black/50 hover:bg-black/70 transition-colors overflow-hidden rounded-xl p-3">
              <div className="flex flex-col">
                <div className="relative aspect-[4/4]">
                  <Image src={game.image || "/placeholder.svg"} alt={game.title} fill className="rounded-md object-cover" />
                </div>
                <div className="mt-3">
                  <h3 className="text-lg font-bold text-white mb-1">{game.title}</h3>
                  <PlayerCount game={game} />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

const BannerSection = ({ subscription }: { subscription: any }) => {
  // Determine if user is on highest plan using the latest subscription
  const latestSubscription = subscription?.subscriptions?.[0]; // Latest is first in sorted array
  const userPlanId = latestSubscription?.plan;
  const isActive = latestSubscription?.status === "active";
  const isOnHighestPlan = isActive && userPlanId === "EXECUTIVE PLAN";
  const { data: session, status } = useSession()
  const userId = session?.user?.id

  // console.log({ userPlanId, isActive, isOnHighestPlan })

  return (
    <div className="grid md:grid-cols-2 gap-4 mt-8">
      {/* First Banner */}
      <Card className="bg-orange-700 overflow-hidden relative hover:brightness-110 hover:shadow-lg transition-all duration-200">
        <CardContent className="p-6">
          <div className="relative z-10 space-y-4">
            <div className="flex items-center space-x-2">
              <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-sm font-medium">
                🎮 Game Library
              </span>
            </div>
            <div>
              <p className="text-white/80 text-lg font-medium mb-2">
                Can&apos;t find your favorite game?
              </p>
              <h2 className="text-4xl font-bold mb-3 leading-tight">Suggest a Game</h2>
              <p className="text-white/70 text-lg mb-6">
                Tell us what game you&apos;d like to play.
              </p>
              {/* Replace inline dialog with SuggestDialog */}
              {userId && (
                <SuggestDialog
                  userId={userId}
                  triggerButtonClassName="bg-yellow-400 text-black hover:bg-yellow-500 font-semibold px-8 py-6 text-lg"
                  triggerButtonChildren={
                    <div className="flex items-center gap-2">
                      Suggest a Game
                      <ChevronRight className="h-5 w-5" />
                    </div>
                  }
                />
              )}
              {!userId && (
                <Button
                  className="bg-yellow-400 text-black font-semibold px-8 py-6 text-lg opacity-60 cursor-not-allowed"
                  disabled
                >
                  <div className="flex items-center gap-2">
                    Suggest a Game
                    <ChevronRight className="h-5 w-5" />
                  </div>
                </Button>
              )}
            </div>
          </div>
          <Image
            src="/banner-left.png"
            alt="Casino elements"
            width={450}
            height={400}
            className="absolute right-0 top-1/2 lg:-mr-28 -translate-y-1/2 hidden lg:block"
          />
        </CardContent>
      </Card>

      {/* Second Banner */}
      <Card className="bg-gradient-to-r from-red-900 to-red-800 overflow-hidden relative">
        <CardContent className="p-6">
          <div className="relative z-10 space-y-4">
            <div className="flex items-center space-x-2">
              <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-sm font-medium">
                ⭐ Premium Features
              </span>
            </div>
            <div>
              <p className="text-white/80 text-lg font-medium mb-2">
                Upgrade Your Experience
              </p>
              <h2 className="text-4xl font-bold mb-3 leading-tight">
                Go{" "}
                <span className="text-yellow-400 relative">
                  Executive
                  <span className="absolute -bottom-1 left-0 w-full h-1 bg-yellow-400/30 rounded-full"></span>
                </span>
              </h2>
              <p className="text-white/70 text-lg mb-6">
                Unlock exclusive games and features
              </p>
              <div className="flex gap-4">
                {isOnHighestPlan ? (
                  <Button
                    className="bg-yellow-400 text-black font-semibold px-8 py-6 text-lg opacity-60 cursor-not-allowed"
                    disabled
                  >
                    <div className="flex items-center gap-2">
                      Upgrade Now
                      <ChevronRight className="h-5 w-5" />
                    </div>
                  </Button>
                ) : (
                  <Button
                    asChild
                    className="bg-yellow-400 text-black hover:bg-yellow-500 font-semibold px-8 py-6 text-lg"
                  >
                    <Link href="/subscription" className="flex items-center gap-2">
                      Upgrade Now
                      <ChevronRight className="h-5 w-5" />
                    </Link>
                  </Button>
                )}
              </div>
              {isOnHighestPlan && (
                <p className="text-xs text-yellow-300 mt-2">You are already on the highest plan.</p>
              )}
            </div>
          </div>
          <Image
            src="/banner1.png"
            alt="Premium Features"
            width={450}
            height={400}
            className="absolute right-0 top-1/2 mt-2 -mr-24 -translate-y-1/2 hidden lg:block"
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default function SubscribedGamePage({ subscription }: { subscription: any }) {
  return (
    <div className="relative">
      <MaxWidthWrapper maxWidth="1370px" className="md:px-32 lg:px-48 2xl:px-32 4xl:px-4">
        <div className="min-h-screen text-white p-4 space-y-8 mb-32">
          <BannerSection subscription={subscription} />
          <GameSection title="All Games" games={games} showAll={true} />
        </div>
      </MaxWidthWrapper>
    </div>
  )
}

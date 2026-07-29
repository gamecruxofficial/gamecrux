"use client"

import { useState, useEffect, Suspense } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronRight, Lock } from "lucide-react"
import MaxWidthWrapper from "@/components/MaxWidth"
import { Game, games } from "@/constants/constants"
import { useSession } from "next-auth/react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import toast from "react-hot-toast"

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
  const router = useRouter()
  const { data: session } = useSession()

  const handleGameClick = (game: Game) => {
    if (!session) {
      toast.error("Please sign in to continue");
      router.push('/sign-in')
      return
    } else {
      router.push('/pages/pricing')
    }
  }

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎮</span>
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 2xl:grid-cols-4 4xl:grid-cols-5 gap-4">
        {games.map((game, index) => (
          <div
            key={index}
            className="group relative transition-all duration-200 hover:brightness-110 hover:shadow-lg cursor-pointer"
            onClick={() => handleGameClick(game)}
          >
            <Card className="border border-white/10 bg-black/50 hover:bg-black/70 transition-colors overflow-hidden rounded-xl p-3">
              <div className="flex flex-col">
                <div className="relative aspect-[4/4]">
                  <Image src={game.image || "/placeholder.svg"} alt={game.title} fill className="rounded-md object-cover" />
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <Lock className="text-white h-8 w-8" />
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="text-lg font-bold text-white mb-1">{game.title}</h3>
                  <Suspense fallback={<p className="text-xs text-gray-300">Loading...</p>}>
                    <PlayerCount game={game} />
                  </Suspense>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}

const BannerSection = () => {
  const { data: session } = useSession()

  return (
    <div className="grid md:grid-cols-2 gap-4 mt-8">
      {/* First Banner */}
      <Card className="bg-orange-700 overflow-hidden relative hover:brightness-110 hover:shadow-lg transition-all duration-200">
        <CardContent className="p-6">
          <div className="relative z-10 space-y-4">
            <div className="flex items-center space-x-2">
              <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-sm font-medium">
                🎮 Special Offer
              </span>
            </div>
            <div>
              <p className="text-white/80 text-lg font-medium mb-2">
                Register Now To Instantly Unlock
              </p>
              <h2 className="text-4xl font-bold mb-3 leading-tight">
                All{" "}
                <span className="text-yellow-400 relative">
                  Games
                  <span className="absolute -bottom-1 left-0 w-full h-1 bg-yellow-400/30 rounded-full"></span>
                </span>
              </h2>
              <p className="text-white/70 text-lg mb-6">
                Unlock premium games
              </p>
              {!session ? (
                <Button
                  asChild
                  className="bg-yellow-400 text-black hover:bg-yellow-500 font-semibold px-8 py-6 text-lg"
                >
                  <a href="/sign-in" className="flex items-center gap-2">
                    Sign up
                    <ChevronRight className="h-5 w-5" />
                  </a>
                </Button>
              ) : (
                <>
                 <Button
                  asChild
                  className="bg-yellow-400 text-black hover:bg-yellow-500 font-semibold px-8 py-6 text-lg"
                >
                  <Link href="/pages/pricing" className="flex items-center gap-2">
                    Subscribe
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                </Button>
                </>
              )}
            </div>
          </div>
          <Image
            src="/banner-left.png"
            alt="Casino elements"
            width={450}
            height={400}
            className="absolute right-0 top-1/2 lg:-mr-28 -translate-y-1/2 hidden 2xl:block"
          />
        </CardContent>
      </Card>

      {/* Second Banner */}
      <Card className="bg-gradient-to-r from-red-900 to-red-800 overflow-hidden relative">
      <CardContent className="p-6">
          <div className="relative z-10 space-y-4">
        <div className="flex items-center space-x-2">
          <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-sm font-medium">
            🎯 Suggest Game
          </span>
        </div>
        <div>
          <p className="text-white/80 text-lg font-medium mb-2">
            Get personalized games
          </p>
          <h2 className="text-4xl font-bold mb-3 leading-tight">
            Suggest{" "}
            <span className="text-yellow-400 relative">
          Games
          <span className="absolute -bottom-1 left-0 w-full h-1 bg-yellow-400/30 rounded-full"></span>
            </span>
          </h2>
          <p className="text-white/70 text-lg mb-6">
            Suggest now to add more games
          </p>
          <Dialog>
                <DialogTrigger asChild>
                  <Button
                  className="bg-yellow-400 text-black hover:bg-yellow-500 font-semibold px-8 py-6 text-lg"
                  >
                  <div className="flex items-center gap-2">
                    Suggest a Game
                    <ChevronRight className="h-5 w-5" />
                  </div>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] bg-black border border-gray-700 text-white">
                  <DialogHeader>
                  <DialogTitle className="text-2xl font-semibold text-white">Suggest a Game</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="game-name" className="text-gray-300">Game Name*</Label>
                    <Input id="game-name" placeholder="Enter your game name" className="w-full bg-gray-300 text-black border-gray-600" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="game-url" className="text-gray-300">Game URL*</Label>
                    <Input id="game-url" placeholder="Enter your game url" className="w-full bg-gray-300 text-black border-gray-600" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="game-description" className="text-gray-300">Game Description*</Label>
                    <Textarea
                    id="game-description"
                    placeholder="Describe the gameplay, objectives, or mechanics."
                    className="h-24 bg-gray-300 text-black border-gray-600"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="game-reason" className="text-gray-300">Why is this a great addition?*</Label>
                    <Textarea
                    id="game-reason"
                    placeholder="Explain why this game would be fun or unique."
                    className="h-24 bg-gray-300 text-black border-gray-600"
                    />
                  </div>
                  </div>
                  <DialogFooter className="flex items-center justify-between">
                  <p className="text-xs text-gray-500 italic">✨ Your idea could be the next big hit!</p>
                  <div className="flex gap-2">
                    <DialogTrigger asChild>
                    <Button variant="outline" className="bg-black text-white hover:bg-gray-800">
                      Cancel
                    </Button>
                    </DialogTrigger>
                    <Button type="submit" className="bg-[#6C5CE7] text-white hover:bg-[#5B4EE7]">
                    Submit
                    </Button>
                  </div>
                  </DialogFooter>
                </DialogContent>
                </Dialog>
        </div>
          </div>
          <Image
            src="/banner1.png"
            alt="Premium Features"
            width={450}
            height={400}
            className="absolute right-0 top-1/2 mt-2 -mr-24 -translate-y-1/2 hidden 2xl:block"
          />
        </CardContent>
      </Card>
    </div>
  )
}

const SideAd = ({
  position,
  isTop,
  imageUrl = "/ads-1.png",
  linkUrl = "https://discord.gg/gw2xfZSx6J"
}: {
  position: 'left' | 'right',
  isTop: boolean,
  imageUrl?: string,
  linkUrl?: string
}) => {

  return (
    <div className={`hidden md:block fixed ${position}-2 lg:${position}-4`}
         style={{
           top: isTop ? '8rem' : 'calc(8rem + 360px)',
           height: '360px'
         }}>
      <div className="w-[120px] md:w-[160px] lg:w-[200px] 2xl:w-[220px] 4xl:w-[250px] h-full">
        <div className="w-full h-full bg-black/50 border border-white/10 rounded-lg overflow-hidden hover:border-white/20 transition-colors">
          <div className="p-2 text-center text-xs text-white/60">Advertisement</div>
          <a href={linkUrl} target="_blank" rel="noopener noreferrer">
            <div className="relative w-full h-[calc(100%-28px)]">
              <Image
                src={imageUrl}
                alt="Advertisement"
                fill
                className="object-cover"
                priority={isTop}
              />
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}

export default function FreeGamePage() {
  return (
    <div className="relative">
      {/* Side Advertisements */}
      {/* <SideAd position="left" isTop={true} imageUrl="/ads-1.png" linkUrl="https://discord.gg/gw2xfZSx6J" />
      <SideAd position="right" isTop={true} imageUrl="/ads-2.png" linkUrl="https://discord.gg/PcjapvBuzy" />
      <SideAd position="left" isTop={false} imageUrl="/ads-2.png" linkUrl="https://discord.gg/PcjapvBuzy" />
      <SideAd position="right" isTop={false} imageUrl="/ads-2.png" linkUrl="https://discord.gg/PcjapvBuzy" /> */}

      <MaxWidthWrapper maxWidth="1370px" className="md:px-32 lg:px-48 2xl:px-32 4xl:px-4">
        <div className="min-h-screen text-white p-4 space-y-8 mb-32">
          <BannerSection />
          <GameSection title="All Games" games={games} showAll={true} />
        </div>
      </MaxWidthWrapper>
    </div>
  )
}





// "use client"

// import { useState } from "react"
// import Image from "next/image"
// import { useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent } from "@/components/ui/card"
// import { ChevronLeft, ChevronRight, Lock } from "lucide-react"
// import MaxWidthWrapper from "@/components/MaxWidth"
// import { categories, Game, games } from "@/constants/constants"
// import Link from "next/link"

// const GameSection = ({
//   title,
//   games,
//   showAll,
//   toggleViewAll,
// }: {
//   title: string
//   games: Game[]
//   showAll: boolean
//   toggleViewAll: () => void
// }) => {
//   const [currentPage, setCurrentPage] = useState(0)
//   const gamesPerPage = 6
//   const router = useRouter()

//   const totalPages = Math.ceil(games.length / gamesPerPage)

//   const currentGames = showAll ? games : games.slice(currentPage * gamesPerPage, (currentPage + 1) * gamesPerPage)

//   const nextPage = () => {
//     setCurrentPage((prev) => (prev + 1) % totalPages)
//   }

//   const prevPage = () => {
//     setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages)
//   }

//   const handleGameClick = (game: Game) => {
//     if (["Number Sequence", "Number Clicking Game", "Path Game"].includes(game.title)) {
//       router.push(game.href)
//     } else {
//       router.push("/pricing")
//     }
//   }

//   return (
//     <div className="mb-12">
//       <div className="flex justify-between items-center mb-6">
//         <div className="flex items-center gap-2">
//           <span className="text-2xl">🎮</span>
//           <h2 className="text-xl font-semibold">{title}</h2>
//         </div>
//         <div className="flex items-center gap-2">
//           {title !== "All Games" && (
//             <>
//               <Button variant="ghost" className="text-white hover:bg-[#1a1b23]" onClick={toggleViewAll}>
//                 {showAll ? "Show Less" : "View all"}
//               </Button>
//               <div className="flex gap-2">
//                 <Button
//                   variant="outline"
//                   size="icon"
//                   className="rounded-lg bg-[#1a1b23]"
//                   onClick={prevPage}
//                   disabled={showAll}
//                 >
//                   <ChevronLeft className="h-4 w-4" />
//                 </Button>
//                 <Button
//                   variant="outline"
//                   size="icon"
//                   className="rounded-lg bg-[#1a1b23]"
//                   onClick={nextPage}
//                   disabled={showAll}
//                 >
//                   <ChevronRight className="h-4 w-4" />
//                 </Button>
//               </div>
//             </>
//           )}
//         </div>
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
//         {currentGames.map((game, index) => (
//           <div
//             key={index}
//             className="group relative transform transition-transform hover:scale-105 cursor-pointer"
//             onClick={() => handleGameClick(game)}
//           >
//             <Card className="border border-white/10 bg-black/50 hover:bg-black/70 transition-colors overflow-hidden rounded-xl p-3">
//               <div className="flex flex-col">
//               <div className="relative aspect-[4/4]">
//                 <Image src={game.image || "/placeholder.svg"} alt={game.title} fill className="rounded-md object-cover" />
//                 {!["Number Sequence", "Number Clicking", "Path Game"].includes(game.title) && (
//                 <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
//                   <Lock className="text-white h-8 w-8" />
//                 </div>
//                 )}
//               </div>
//               <div className="mt-3">
//                 <h3 className="text-lg font-bold text-white mb-1">{game.title}</h3>
//                 <div className="flex items-center gap-2">
//                 <span className="relative flex h-2 w-2">
//                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
//                   <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
//                 </span>
//                 <p className="text-xs text-gray-300">{game.players}</p>
//                 </div>
//               </div>
//               </div>
//             </Card>
//           </div>
//         ))}
//       </div>
//     </div>
//   )
// }

// export default function FreeGamePage() {
//   const [showAllCategories, setShowAllCategories] = useState<Record<string, boolean>>(
//     categories.reduce((acc, category) => ({ ...acc, [category.id]: category.id === "home" }), {}),
//   );
//   const [activeCategory, setActiveCategory] = useState<string>("home");

//   const toggleViewAll = (categoryId: string) => {
//     setShowAllCategories((prev) => ({ ...prev, [categoryId]: !prev[categoryId] }));
//   };

//   return (
//     <MaxWidthWrapper maxWidth="2xl">
//       <div className="min-h-screen text-white p-4 space-y-8">
//         {/* Banner Section */}
//         <div className="grid md:grid-cols-2 gap-4">
//           {/* First Banner */}
//           <Card className="bg-blue-600 overflow-hidden relative">
//             <CardContent className="p-6">
//               <div className="relative z-10 space-y-4">
//           <div className="flex items-center space-x-2">
//             <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-sm font-medium">
//               🎮 Special Offer
//             </span>
//           </div>
//           <div>
//             <p className="text-white/80 text-lg font-medium mb-2">
//               Register Now To Instantly Unlock
//             </p>
//             <h2 className="text-4xl font-bold mb-3 leading-tight">
//               All Games
//             </h2>
//             <p className="text-white/70 text-lg mb-6">
//               Unlock premium games and exclusive content
//             </p>
//             <Button
//               asChild
//               className="bg-yellow-400 text-black hover:bg-yellow-500 transform transition-all duration-200 font-semibold px-8 py-6 text-lg"
//             >
//               <a href="/sign-in" className="flex items-center gap-2">
//                 Sign up
//                 <ChevronRight className="h-5 w-5" />
//               </a>
//             </Button>
//           </div>
//               </div>
//               <Image
//           src="/card-girl.png"
//           alt="Casino elements"
//           width={450}
//           height={400}
//           className="absolute right-0 top-1/2 lg:-mr-28 -translate-y-1/2 hidden lg:block"
//               />
//             </CardContent>
//           </Card>

// {/* Second Banner */}
// <Card className="bg-gradient-to-r from-red-900 to-red-800 overflow-hidden relative">
//   <CardContent className="p-6">
//     <div className="relative z-10 space-y-4">
//       <div className="flex items-center space-x-2">
//         <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-sm font-medium">
//           🎮 Game Mode
//         </span>
//       </div>
//       <div>
//         <p className="text-white/80 text-lg font-medium mb-2">
//           This Week’s Top Challenge
//         </p>
//         <h2 className="text-4xl font-bold mb-3 leading-tight">
//           Dominate the{" "}
//           <span className="text-yellow-400 relative">
//             RP Arena
//             <span className="absolute -bottom-1 left-0 w-full h-1 bg-yellow-400/30 rounded-full"></span>
//           </span>
//         </h2>
//         <p className="text-white/70 text-lg mb-6">
//           Compete in missions & unlock rare rewards.
//         </p>
//         <Button
//           asChild
//           className="bg-yellow-400 text-black hover:bg-yellow-500 transform transition-all duration-200 font-semibold px-8 py-6 text-lg"
//         >
//           <Link href="/#pricing" className="flex items-center gap-2">
//             Join Now
//             <ChevronRight className="h-5 w-5" />
//           </Link>
//         </Button>
//       </div>
//     </div>
//     <Image
//       src="/raptor.png"
//       alt="GTA RP Challenge"
//       width={570}
//       height={400}
//       className="absolute right-0 top-1/2 mt-2 -mr-36 -translate-y-1/2 hidden lg:block"
//     />
//   </CardContent>
// </Card>


//         </div>

//         {/* Navigation Categories */}
//         <div className="flex items-center justify-between mb-6 sticky top-0 z-10 py-4 bg-black">
//           <div className="flex gap-4">
//             {categories.map((category) => (
//               <Button
//                 key={category.id}
//                 variant="ghost"
//                 className={`text-gray-400 hover:text-white hover:bg-[#1a1b23] transition-colors whitespace-nowrap ${
//                   activeCategory === category.id ? "bg-[#1a1b23] text-white" : ""
//                 }`}
//                 onClick={() => setActiveCategory(category.id)}
//               >
//                 <span className="mr-2">{category.icon}</span>
//                 {category.title}
//               </Button>
//             ))}
//           </div>
//         </div>

//         {/* Game Sections */}
//         {activeCategory === "home" && (
//           <GameSection title="All Games" games={games} showAll={true} toggleViewAll={() => {}} />
//         )}
//         {categories.slice(1).map((category) => {
//           if (category.id === activeCategory) {
//             const categoryGames = games.filter((game) =>
//               category.id === "lobby" ? true : game.category === category.id,
//             );
//             return (
//               <GameSection
//                 key={category.id}
//                 title={category.title}
//                 games={categoryGames}
//                 showAll={showAllCategories[category.id]}
//                 toggleViewAll={() => toggleViewAll(category.id)}
//               />
//             );
//           }
//           return null;
//         })}
//       </div>
//     </MaxWidthWrapper>
//   );
// }


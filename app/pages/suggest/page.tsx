"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function SuggestDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-gray-900 text-white hover:bg-gray-800">⚡</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-black border border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-white">Suggest a Game</DialogTitle>
            {/* <DialogDescription className="text-gray-400 mt-2 leading-relaxed">
              <span className="font-semibold text-gray-300">Have an exciting idea for a mini-game? 🎮</span>
              <br />
              Share your creative thoughts with us, and together we might bring your amazing concept to life! ✨
            </DialogDescription> */}
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="game-name" className="text-gray-300">Game Name*</Label>
            <Input id="game-name" placeholder="Enter your game name" className="w-full bg-gray-300 text-black border-gray-600" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="game-name" className="text-gray-300">Game URL*</Label>
            <Input id="game-name" placeholder="Enter your game url" className="w-full bg-gray-300 text-black border-gray-600" />
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
  )
}

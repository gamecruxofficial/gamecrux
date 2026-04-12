"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HeadphonesIcon, Lightbulb } from "lucide-react";
import { toast } from "react-hot-toast";

const suggestGameSchema = z.object({
  gameName: z.string().min(1, "Game name is required").max(100, "Game name must be less than 100 characters"),
  gameUrl: z.string().min(1, "Game URL is required").url("Invalid URL format"),
  gameDescription: z.string().min(1, "Game description is required").max(500, "Game description must be less than 500 characters"),
  gameReason: z.string().min(1, "Reason is required").max(500, "Reason must be less than 500 characters"),
});

export function SuggestDialog({
  userId,
  triggerButtonClassName,
  triggerButtonChildren,
}: {
  userId: string
  triggerButtonClassName?: string
  triggerButtonChildren?: React.ReactNode
}) {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<z.infer<typeof suggestGameSchema>>({
    resolver: zodResolver(suggestGameSchema),
  });

  const onSubmit = async (data: z.infer<typeof suggestGameSchema>) => {
    try {
      const response = await fetch("/api/suggest-game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, userId }),
      });

      if (response.ok) {
        toast.success("Game suggestion submitted successfully!");
        reset();
        setOpen(false); // Close the modal on successful submission
      } else {
        console.error("Failed to submit game suggestion.");
      }
    } catch (error) {
      console.error("Error submitting game suggestion:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={triggerButtonClassName ?? "bg-[#262626] p-2 rounded-full  text-white items-center border-black transition-all hover:opacity-90"}>
          {triggerButtonChildren ?? <Lightbulb />}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-black border border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-white">Suggest a Game</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="game-name" className="text-gray-300">Game Name*</Label>
              <Input
                id="game-name"
                placeholder="Enter your game name"
                className="w-full bg-gray-300 text-black border-gray-600"
                {...register("gameName")}
              />
              {errors.gameName && (
                <p className="text-sm text-red-500">{errors.gameName.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="game-url" className="text-gray-300">Game URL*</Label>
              <Input
                id="game-url"
                placeholder="Enter your game URL"
                className="w-full bg-gray-300 text-black border-gray-600"
                {...register("gameUrl")}
              />
              {errors.gameUrl && (
                <p className="text-sm text-red-500">{errors.gameUrl.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="game-description" className="text-gray-300">Game Description*</Label>
              <Textarea
                id="game-description"
                placeholder="Describe the gameplay, objectives, or mechanics."
                className="h-24 bg-gray-300 text-black border-gray-600"
                {...register("gameDescription")}
              />
              {errors.gameDescription && (
                <p className="text-sm text-red-500">{errors.gameDescription.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="game-reason" className="text-gray-300">Why is this a great addition?*</Label>
              <Textarea
                id="game-reason"
                placeholder="Explain why this game would be fun or unique."
                className="h-24 bg-gray-300 text-black border-gray-600"
                {...register("gameReason")}
              />
              {errors.gameReason && (
                <p className="text-sm text-red-500">{errors.gameReason.message}</p>
              )}
            </div>
          </div>
          <DialogFooter className="flex items-center justify-between">
            <p className="text-xs text-gray-500 italic">✨ Your idea could be the next big hit!</p>
            <div className="flex gap-2">
              <Button type="button" onClick={() => setOpen(false)} className="bg-black text-white hover:bg-gray-800">
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#6C5CE7] text-white hover:bg-[#5B4EE7]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </div>
                ) : (
                  "Submit"
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

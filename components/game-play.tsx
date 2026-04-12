"use client"

import { useEffect, useRef } from "react"
import { CheckCircle2 } from "lucide-react"
import MaxWidthWrapper from "./MaxWidth"
import Image from "next/image"

export default function GamePlay() {
  const videoRef = useRef<HTMLVideoElement>(null)

  const features = [
    "Choose your game",
    "Practice anytime, anywhere",
    // "Choose your product",
    // "Practice anytime, anywhere",
    // "Have authentic GTA RP experience",
    // "Compete and have fun"
  ];

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.5,
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && videoRef.current) {
          videoRef.current.play()
        } else if (videoRef.current) {
          videoRef.current.pause()
        }
      })
    }, options)

    if (videoRef.current) {
      observer.observe(videoRef.current)
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current)
      }
    }
  }, [])

  return (
        <MaxWidthWrapper maxWidth="2xl">

    <section className="text-white px-4 py-16 mt-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Explore the best games in action right now!</h1>
          <p className="text-gray-400">Check out our games video below to get a sneak peek.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-900 border-[1px] border-gray-800">
          <video ref={videoRef} className="w-full  h-full object-cover" loop muted playsInline>
              <source
                src="/02211.mp4"
                type="video/mp4"
              />
            </video>
            {/* <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110">
                  <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center backdrop-blur-sm">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                      <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-black border-b-[6px] border-b-transparent ml-1" />
                    </div>
                  </div>
                </div> */}
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-4">Games Preview</h2>
              <p className="text-gray-400 mb-8">
              Browse through our collection of games and pick your favorite.
              </p>
            </div>

            <ul className="space-y-4">

            {Array.from({ length: 2 }).map((_, i) => (
              <li key={i} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>{features[i]}</span>
              </li>
            ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
    </MaxWidthWrapper>
  )
}


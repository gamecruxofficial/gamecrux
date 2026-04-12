import React from 'react'
import Image from 'next/image'

export default function FooterHero() {
  return (
    <div className=" text-white">
      {/* Hero Section */}
      <div className="relative min-h-screen flex flex-col">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/VECTOR.png"
            alt="Background"
            fill
            className="object-cover opacity-40"
            priority
          />
        </div>

        {/* Controller Image */}
        <div className="relative w-full max-w-4xl mx-auto px-4 pt-20 z-10">
          <Image
            src="/controller-2.png"
            alt="PlayStation Controller"
            width={800}
            height={400}
            className="w-full h-auto"
            priority
          />
        </div>

        {/* Hero Text */}
        <div className="flex flex-col items-center justify-center flex-grow relative">
          <div
            className="font-hero absolute text-[20vw] sm:text-[150px] md:text-[200px] lg:text-[250px]
            font-bold text-center leading-none tracking-wider
            transform -translate-y-1/2"
            style={{
              background: "linear-gradient(180deg, #838383 0%, #000000 89%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            game
          </div>
          <div
            className="font-hero absolute text-[20vw] sm:text-[150px] md:text-[200px] lg:text-[250px] lg:-mt-44
            font-bold text-center leading-none tracking-wider
            transform translate-y-1/2"
            style={{
              background: "linear-gradient(180deg, #838383 0%, #000000 79%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            crux
          </div>
        </div>
      </div>
    </div>
  )
}

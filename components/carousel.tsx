"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import MaxWidthWrapper from './MaxWidth';

const games = [
  { id: 1, name: 'Product 1', price: 29.99, image1: '/image-path.png', image2: '/card-gtaa.png', href: '/games' },
  { id: 2, name: 'Product 2', price: 49.99, image1: '/image-thermite.png', image2: '/card-gtagirl.png', href: '/games' },
  { id: 3, name: 'Product 3', price: 19.99, image1: '/image-finger.png', image2: '/card-gtaboi.png', href: '/games' },
  { id: 4, name: 'Product 4', price: 99.99, image1: '/image-numberclicking.png', image2: '/card-redhead.png', href: '/games' },
  { id: 5, name: 'Product 5', price: 59.99, image1: '/image-enter.png', image2: '/card-gurl.png', href: '/games' },
];

const ProductCarousel = () => {
  const scrollRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    let animationFrameId;
    const scroll = () => {
      if (!isHovered && scrollRef.current) {
        setScrollPosition((prev) => {
          const newPosition = prev + 1;
          if (newPosition >= scrollRef.current.scrollWidth / 2) {
            return 0;
          }
          return newPosition;
        });
        scrollRef.current.scrollLeft = scrollPosition;
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isHovered, scrollPosition]);

  // Double the games array to create seamless scrolling
  const doubledgames = [...games, ...games];

  return (
    <MaxWidthWrapper maxWidth="2xl">
      <section className="py-4 sm:py-8 md:py-12 text-gray-100">
        <div className="container mx-auto px-2 sm:px-4">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl leading-none tracking-wide font-bold text-white font-zentry mb-4">
            Trending games
          </h1>

          <div
            ref={scrollRef}
            className="flex overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="flex gap-4 flex-nowrap">
              {doubledgames.map((product, index) => (
                <div
                  key={`${product.id}-${index}`}
                  className="flex-none w-full max-w-sm"
                >
                  <div className="relative group">
                    <Link href={product.href} className="block h-full">
                    {product.image2 && (
                      <div className="absolute left-1/2 transform -translate-x-1/2 z-10 w-3/4 transition-transform group-hover:scale-110 duration-300">
                      <div className="relative w-full pt-[100%]">
                        <Image
                        src={product.image2}
                        alt={product.name}
                        fill
                        className="scale-125"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        priority={index === 0}
                        />
                      </div>
                      </div>
                    )}
                    </Link>

                    <Card className="border border-white/10 bg-black/50 hover:bg-black/70 transition-all duration-300 mt-12 sm:mt-16 md:mt-20">
                      <CardContent className="p-2 sm:p-4 h-full">
                        <Link href={product.href} className="block h-full">
                          <div className="rounded-md relative w-full pt-[75%]">
                            <Image
                              src={product.image1 || '/placeholder.svg'}
                              alt={product.name}
                              fill
                              className="object-cover rounded-md"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                          </div>
                        </Link>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </MaxWidthWrapper>
  );
};

export default ProductCarousel;
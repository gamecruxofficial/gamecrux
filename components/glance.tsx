"use client";

import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import Image from 'next/image';
import MaxWidthWrapper from './MaxWidth';

// Define a type for the card references to ensure type safety.
type CardRef = HTMLDivElement;

// Extend the React MouseEvent type for clarity and type safety.
interface MouseMoveEvent extends React.MouseEvent<HTMLDivElement> {
  clientX: number;
  clientY: number;
  currentTarget: HTMLDivElement;
}

const Glance: React.FC = () => {
    const [isHovering, setIsHovering] = useState<boolean>(false);
    // Use an array of refs to store references to each card element for animations.
    const cardRefs = useRef<CardRef[]>([]);

    // Function to add valid elements to our refs array.
    const addToRefs = (el: CardRef | null) => {
        if (el && !cardRefs.current.includes(el)) {
            cardRefs.current.push(el);
        }
    };

    // Handles the mouse move event to apply GSAP animations.
    const handleMouseMove = ({ clientX, clientY, currentTarget }: MouseMoveEvent) => {
        const rect = currentTarget.getBoundingClientRect();

        // Calculate the offset of the mouse from the center of the card.
        const xOffset = clientX - (rect.left + rect.width / 2);
        const yOffset = clientY - (rect.top + rect.height / 2);

        // Apply a 3D rotation and translation effect to child elements with the 'hover-text' class.
        if (isHovering) {
            const hoverElements = currentTarget.querySelectorAll('.hover-text');
            hoverElements.forEach((element) => {
                gsap.to(element, {
                    x: xOffset * 0.1,
                    y: yOffset * 0.1,
                    rotationY: xOffset / 15,
                    rotationX: -yOffset / 15,
                    transformPerspective: 600,
                    duration: 0.6,
                    ease: "power1.out",
                });
            });
        }
    };

    // useEffect to reset the animations when the mouse leaves the card area.
    useEffect(() => {
        if (!isHovering) {
            cardRefs.current.forEach((card: CardRef) => {
                const hoverElements = card.querySelectorAll('.hover-text');
                hoverElements.forEach((element) => {
                    gsap.to(element, {
                        x: 0,
                        y: 0,
                        rotationY: 0,
                        rotationX: 0,
                        duration: 0.6,
                        ease: "power1.out",
                    });
                });
            });
        }
    }, [isHovering]);

    return (
        <MaxWidthWrapper maxWidth="2xl">
            <section className='min-h-screen text-violet-100 p-4 sm:p-6 md:p-8 lg:p-10 space-y-6 sm:space-y-8 md:space-y-10'>
                <h3 className='uppercase font-general text-xs sm:text-sm pt-6 sm:pt-8 md:pt-10'>Our universe in a nutshell</h3>
                
                {/* Main container: stacks columns on mobile, row on large screens */}
                <div className='flex flex-col lg:flex-row gap-6 sm:gap-8 md:gap-10'>
                    
                    {/* Left Column */}
                    <div className='flex flex-col w-full gap-6 sm:gap-8 md:gap-10 items-center lg:items-end mt-10 sm:mt-16 md:mt-20 lg:mt-28'>
                        
                        {/* Card 1: Games */}
                        <div
                            ref={addToRefs}
                            className='flex flex-col sm:flex-row border border-neutral-700 w-full rounded-lg max-w-xl overflow-hidden'
                            onMouseMove={handleMouseMove}
                            onMouseEnter={() => setIsHovering(true)}
                            onMouseLeave={() => setIsHovering(false)}
                        >
                            <div className='p-4 sm:p-5 flex-shrink-0'>
                                <h3>WorldWide Available</h3>
                                <h1 className='plain-heading special-font font-zentry text-3xl sm:text-5xl md:text-7xl lg:text-9xl hover-text'>24<b>/</b>7</h1>
                            </div>
                            <div className='w-full'>
                                <video src='/card-1.webm' loop muted autoPlay playsInline className='w-full h-full object-cover' />
                            </div>
                        </div>

                        {/* Card 2: 10+ */}
                        <div
                            ref={addToRefs}
                            className='flex flex-col justify-between border border-neutral-700 p-4 sm:p-5 bg-yellow-300 rounded-lg w-full max-w-xl h-auto sm:h-[20rem] md:h-[25rem]'
                            onMouseMove={handleMouseMove}
                            onMouseEnter={() => setIsHovering(true)}
                            onMouseLeave={() => setIsHovering(false)}
                        >
                            <h1 className='plain-heading font-zentry text-black text-6xl sm:text-8xl md:text-9xl lg:text-[16rem] leading-none hover-text'>2<b>5</b>+</h1>
                            <div className='p-2 sm:p-5'>
                                <h3 className='text-black text-end font-semibold opacity-70'>games</h3>
                            </div>
                        </div>

                        {/* Card 3: Active Users */}
                        <div
                            ref={addToRefs}
                            className='flex flex-col border border-neutral-700 bg-violet-300 rounded-lg w-full max-w-xl overflow-hidden'
                            onMouseMove={handleMouseMove}
                            onMouseEnter={() => setIsHovering(true)}
                            onMouseLeave={() => setIsHovering(false)}
                        >
                            <div className='p-4 sm:p-5'>
                                <h3 className='text-black text-start font-semibold opacity-70'>Active Users</h3>
                                <h1 className='plain-heading special-font font-zentry text-black text-5xl sm:text-6xl md:text-7xl lg:text-[8rem] leading-none text-start hover-text'>1000<b>+</b></h1>
                            </div>
                            {/* Adjusted negative margin for responsiveness */}
                            <video src='/card-5.webm' loop muted autoPlay playsInline className='w-full h-auto mx-auto max-w-xs sm:max-w-sm -mt-16 sm:-mt-24 md:-mt-36' />
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className='flex flex-col w-full gap-6 sm:gap-8 md:gap-10 items-center lg:items-start'>
                        
                        {/* Card 4: Members */}
                        <div
                            ref={addToRefs}
                            className='flex flex-col border border-neutral-700 bg-violet-300 rounded-lg w-full max-w-xl overflow-hidden'
                            onMouseMove={handleMouseMove}
                            onMouseEnter={() => setIsHovering(true)}
                            onMouseLeave={() => setIsHovering(false)}
                        >
                            <div className='p-4 sm:p-5'>
                                <h3 className='text-black text-start font-semibold opacity-70'>Members</h3>
                                <h1 className='plain-heading special-font font-zentry text-black text-6xl sm:text-8xl md:text-9xl lg:text-[14rem] leading-none text-center hover-text'>100<b>0</b>+</h1>
                            </div>
                            {/* Adjusted negative margin for better stacking on mobile */}
                            <div className='relative w-full -mt-10 sm:-mt-20 md:-mt-36 lg:-mt-72 z-10'>
                                <Image
                                    src='/money.png'
                                    alt='card-2'
                                    width={800}
                                    height={800}
                                    className='w-full h-auto'
                                />
                            </div>
                        </div>

                        {/* Card 5: World-Class Games */}
                        <div
                            ref={addToRefs}
                            className='p-4 sm:p-5 border flex flex-col rounded-lg border-neutral-700 w-full max-w-xl'
                            onMouseMove={handleMouseMove}
                            onMouseEnter={() => setIsHovering(true)}
                            onMouseLeave={() => setIsHovering(false)}
                        >
                            <h1 className='plain-heading font-zentry text-white text-4xl sm:text-5xl md:text-6xl max-w-sm leading-none text-start hover-text'>W<b>o</b>rld-Class G<b>a</b>mes</h1>
                        </div>

                        {/* Card 6: Upcoming Games */}
                        <div
                            ref={addToRefs}
                            className='bg-violet-50 rounded-lg w-full max-w-xl p-4 sm:p-5'
                            onMouseMove={handleMouseMove}
                            onMouseEnter={() => setIsHovering(true)}
                            onMouseLeave={() => setIsHovering(false)}
                        >
                            <h3 className='text-black text-start font-semibold opacity-70'>Upcoming games <br />2025</h3>
                            {/* Responsive font size and line height */}
                            <h1 className='plain-heading special-font font-zentry text-black text-6xl sm:text-8xl md:text-9xl lg:text-[18rem] leading-tight sm:leading-tight md:leading-tight lg:leading-tight hover-text'>10<b>0</b>+</h1>
                        </div>
                    </div>
                </div>
            </section>
        </MaxWidthWrapper>
    );
};

export default Glance;

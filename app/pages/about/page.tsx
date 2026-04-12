"use client"

import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import Image from 'next/image';
import MaxWidthWrapper from '@/components/MaxWidth';

type CardRef = HTMLDivElement;

interface MouseMoveEvent extends React.MouseEvent<HTMLDivElement> {
  clientX: number;
  clientY: number;
  currentTarget: HTMLDivElement;
}

const Glance: React.FC = () => {
    const [isHovering, setIsHovering] = useState<boolean>(false);
    const cardRefs = useRef<CardRef[]>([]);

    const addToRefs = (el: CardRef | null) => {
        if (el && !cardRefs.current.includes(el)) {
            cardRefs.current.push(el);
        }
    };

    const handleMouseMove = ({ clientX, clientY, currentTarget }: MouseMoveEvent) => {
        const rect = currentTarget.getBoundingClientRect();

        const xOffset = clientX - (rect.left + rect.width / 2);
        const yOffset = clientY - (rect.top + rect.height / 2);

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

        <section className='min-h-screen  text-violet-100 p-4 sm:p-6 md:p-8 lg:p-10 space-y-6 sm:space-y-8 md:space-y-10'>
            <h3 className='uppercase font-general text-xs sm:text-sm pt-6 sm:pt-8 md:pt-10'>Our universe in a nutshell</h3>
            <h1 className='plain-heading font-zentry text-4xl sm:text-5xl md:text-7xl lg:text-[10rem] max-w-5xl sm:leading-tight md:leading-tight lg:leading-[8rem]'>Ga<b>me</b>crux at a glan<b>c</b>e</h1>

            <div className='flex flex-col lg:flex-row gap-6 sm:gap-8 md:gap-10'>
                {/* Left */}
                <div className='flex flex-col w-full gap-6 sm:gap-8 md:gap-10 items-center lg:items-end mt-10 sm:mt-16 md:mt-20 lg:mt-28'>
                    <div
                        ref={addToRefs}
                        className='flex flex-col sm:flex-row border border-neutral-700 w-full sm:w-auto rounded-lg max-w-xl'
                        onMouseMove={handleMouseMove}
                        onMouseEnter={() => setIsHovering(true)}
                        onMouseLeave={() => setIsHovering(false)}
                    >
                        <div className='p-4 sm:p-5'>
                            <h3>games</h3>
                            <h1 style={{ fontFeatureSettings: '"ss01" 1' }} className='plain-heading special-font font-zentry text-3xl sm:text-5xl md:text-7xl lg:text-9xl hover-text'>4<b>+</b></h1>
                        </div>
                        <div className='w-full sm:w-auto'>
                            <video src='/card-1.webm' loop muted autoPlay playsInline className='w-full h-auto' />
                        </div>
                    </div>

                    <div
                        ref={addToRefs}
                        className='flex flex-col justify-between border border-neutral-700 p-4 sm:p-5 bg-yellow-300 rounded-lg w-full max-w-xl sm:h-[20rem] md:h-[25rem]'
                        onMouseMove={handleMouseMove}
                        onMouseEnter={() => setIsHovering(true)}
                        onMouseLeave={() => setIsHovering(false)}
                    >
                        <h1 style={{ fontFeatureSettings: '"ss01" 1' }} className='plain-heading special-font font-zentry text-black text-6xl sm:text-8xl md:text-[12rem] lg:text-[16rem] leading-none hover-text'>1<b>0</b>+</h1>
                        <div className='p-2 sm:p-5'>
                            <h3 className='text-black text-end font-semibold opacity-70'>Games</h3>
                        </div>
                    </div>

                    <div
                        ref={addToRefs}
                        className='flex flex-col border border-neutral-700 bg-violet-300 rounded-lg w-full max-w-xl'
                        onMouseMove={handleMouseMove}
                        onMouseEnter={() => setIsHovering(true)}
                        onMouseLeave={() => setIsHovering(false)}
                    >
                        <div className='p-2 px-4 sm:px-5'>
                            <div className='p-2'>
                                <h3 style={{ fontFeatureSettings: '"ss01" 1' }}  className='text-black text-start font-semibold opacity-70'>Features</h3>
                            </div>
                            <h1 style={{ fontFeatureSettings: '"ss01" 1' }} className='plain-heading special-font font-zentry text-black text-5xl sm:text-6xl md:text-7xl lg:text-[8rem] leading-none text-start hover-text'>100<b></b><b>+</b></h1>
                        </div>
                        <video src='/card-5.webm' loop muted autoPlay playsInline className='h-auto mx-4 sm:mx-8 md:mx-14 -mt-36' />
                        <div className='p-4 sm:p-6 md:p-10 flex flex-wrap justify-between -mt-12'>
                            <div className='flex space-x-2 sm:space-x-3 mb-2 sm:mb-0'>
                                <div className='text-black h-4 w-4 sm:h-5 sm:w-5 bg-black rounded-full'> </div>
                                <h1 className='text-white font-general text-[0.6rem] sm:text-xs'>MINI GAMES <br /> 70%</h1>
                            </div>
                            <div className='flex space-x-2 sm:space-x-3 mb-2 sm:mb-0'>
                                <div className='text-black h-4 w-4 sm:h-5 sm:w-5 bg-yellow-300 rounded-full'> </div>
                                <h1 className='text-white font-general text-[0.6rem] sm:text-xs'>REWARDS <br /> 20%</h1>
                            </div>
                            <div className='flex space-x-2 sm:space-x-3'>
                                <div className='text-black h-4 w-4 sm:h-5 sm:w-5 bg-violet-50 rounded-full'> </div>
                                <h1 className='text-white font-general text-[0.6rem] sm:text-xs'>CHALLENGES <br /> 10%</h1>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right */}
                <div className='flex flex-col w-full gap-6 sm:gap-8 md:gap-10 items-center lg:items-start'>
                    <div
                        ref={addToRefs}
                        className='flex flex-col border border-neutral-700 bg-violet-300 rounded-lg w-full max-w-xl relative'
                        onMouseMove={handleMouseMove}
                        onMouseEnter={() => setIsHovering(true)}
                        onMouseLeave={() => setIsHovering(false)}
                    >
                        <div className='p-2'>
                            <div className='p-2'>
                                <h3 style={{ fontFeatureSettings: '"ss01" 1' }}  className='text-black text-start font-semibold opacity-70'>Members</h3>
                            </div>
                            <h1 id='text-3d' style={{ fontFeatureSettings: '"ss01" 1' }} className='plain-heading special-font font-zentry text-black text-6xl sm:text-8xl md:text-[12rem] lg:text-[14rem] leading-none text-center hover-text'>100<b>0</b>+</h1>
                        </div>
                        <div className='relative w-full -mt-10 sm:-mt-16 md:-mt-20 lg:-mt-72 z-10'>
                            <Image
                                src='/money.png'
                                alt='card-2'
                                width={800}
                                height={800}
                                className='w-full h-auto'
                            />
                        </div>
                    </div>

                    <div
                        ref={addToRefs}
                        className='p-4 sm:p-5 border flex flex-col rounded-lg border-neutral-700 w-full max-w-xl'
                        onMouseMove={handleMouseMove}
                        onMouseEnter={() => setIsHovering(true)}
                        onMouseLeave={() => setIsHovering(false)}
                    >
                        <h1 className='plain-heading font-zentry text-white text-4xl sm:text-5xl md:text-[4.5rem] max-w-sm leading-none text-start hover-text'>W<b>o</b>rld-Class B<b>a</b>ckers</h1>
                        <p className='text-end font-general uppercase text-[0.6rem] sm:text-xs pt-10 sm:pt-16 md:pt-20 hover-text'>
                            coinbase ventures <br />
                            binance labs<br />
                            defiance capital<br />
                            hashed<br />
                            pantera capital<br />
                            animoca brands<br />
                            play ventures<br />
                            skyvision capital<br />
                            vessel capital<br />
                            arche fund
                        </p>
                    </div>

                    <div
                        ref={addToRefs}
                        className='bg-violet-50 rounded-lg w-full max-w-xl'
                        onMouseMove={handleMouseMove}
                        onMouseEnter={() => setIsHovering(true)}
                        onMouseLeave={() => setIsHovering(false)}
                    >
                        <div className='p-2'>
                            <div className='p-2'>
                                <h3 className='text-black text-start font-semibold opacity-70'>Upcoming games <br />2025</h3>
                            </div>
                            <h1 style={{ fontFeatureSettings: '"ss01" 1' }} className='plain-heading special-font font-zentry plain-heading text-black text-6xl sm:text-8xl md:text-[16rem] lg:text-[18rem] px-4 leading-none sm:leading-[10rem] md:leading-[16rem] lg:leading-[20rem] text-start hover-text'>10<b>0</b>+</h1>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        </MaxWidthWrapper>
    );
};

export default Glance;


import React from 'react'
import { cn } from "@/lib/utils"

interface MaxWidthWrapperProps {
  className?: string
  children: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' |'1370px' | '2xl' | 'full'
}

export default function MaxWidthWrapper({
  className,
  children,
  maxWidth = '2xl'
}: MaxWidthWrapperProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-4 sm:px-6 lg:px-8',
        {
          'max-w-screen-sm': maxWidth === 'sm',
          'max-w-screen-md': maxWidth === 'md',
          'max-w-screen-lg': maxWidth === 'lg',
          'max-w-screen-xl': maxWidth === 'xl',
          'max-w-screen-2xl': maxWidth === '2xl',
          'max-w-[1336px]' : maxWidth === '1370px',
          'max-w-full': maxWidth === 'full',
        },
        className
      )}
    >
      {children}
    </div>
  )
}
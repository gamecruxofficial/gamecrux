import type { Metadata } from "next";
import Script from "next/script"; // 1. Import the Script component
import "./globals.css";
import { Poppins } from 'next/font/google'
import localFont from "next/font/local";
import Navbar from "@/components/navbar";
import LenisProvider from "@/components/LenisProvider";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { ProcessingProvider } from "@/contexts/ProcessingProvider";
import { GlobalSpinner } from "@/components/GlobalSpinner";

const myFont = localFont({
  src: './font/EurostileExtendedBlack.woff',
  variable: '--font-hero'
})

const general = localFont({
  src: './font/General.woff',
  variable: '--font-general'
})

const zentry = localFont({
  src: './font/zentry-regular.woff2',
  variable: '--font-zentry'
})

const popin = Poppins({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-popin',
})

export const metadata: Metadata = {
  title: "GAMECRUX",
  description: "Discover, Play, and Enjoy a Curated Selection of Exciting Minigames",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${popin.variable} ${zentry.variable} ${general.variable} ${myFont.variable}`} suppressHydrationWarning>
      {/* 2. Remove the manual <head> tag */}
      <body suppressHydrationWarning={true}>
        <SessionProvider>
          <LenisProvider>
              <ProcessingProvider>
               <GlobalSpinner />
               <main className="flex flex-col min-h-screen bg-black">
              <Navbar />
              <div className="mt-[80px]">
                {children}
              </div>
            </main>
             </ProcessingProvider>
          </LenisProvider>
        </SessionProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#333',
              color: '#fff',
            },
          }}
        />
      </body>
      {/* 3. Add the Script components here */}
      <Script 
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=G-GZ5CFF3T5L"
      />
      <Script 
        id="google-analytics"
        strategy="afterInteractive"
      >
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-GZ5CFF3T5L');
        `}
      </Script>
    </html>
  );
}
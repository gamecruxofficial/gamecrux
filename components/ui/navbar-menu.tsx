"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, LogIn } from "lucide-react";

const transition = {
  type: "spring",
  mass: 0.5,
  damping: 11.5,
  stiffness: 100,
  restDelta: 0.001,
  restSpeed: 0.001,
};

export const MenuItem = ({
  setActive,
  active,
  item,
  children,
  className,
  href,
}: {
  setActive: (item: string) => void;
  active: string | null;
  item: string;
  children?: React.ReactNode;
  className?: string;
  href?: string;
}) => {
  const content = (
    <motion.div
      whileHover={{ scale: 1.05, color: "#ffffff" }} // Scale up and change text color on hover
      transition={{ type: "spring", stiffness: 300 }} // Smooth spring animation
      className="cursor-pointer text-white hover:opacity-[0.9] flex items-center gap-1"
    >
      {item}
      {children && <ChevronDown className="w-5 h-3 text-white" />}
    </motion.div>
  );

  return (
    <div onMouseEnter={() => setActive(item)} className={`relative ${className || ''}`}>
      {href ? (
        <Link href={href}>
          {content}
        </Link>
      ) : (
        content
      )}
      {children && active !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={transition}
        >
          {active === item && (
            <div className="absolute top-[calc(100%_+_1.2rem)] left-1/2 transform -translate-x-1/2 pt-4">
              <motion.div
                transition={transition}
                layoutId="active"
                className="bg-black backdrop-blur-sm rounded-2xl overflow-hidden border border-white/[0.2] shadow-xl"
              >
                <motion.div
                  layout
                  className="w-max h-full p-4"
                >
                  {children}
                </motion.div>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export const Menu = ({
  setActive,
  children,
}: {
  setActive: (item: string | null) => void;
  children: React.ReactNode;
}) => {
  return (
    <nav
      onMouseLeave={() => setActive(null)}
      className="relative  shadow-input flex justify-center space-x-12 px-8 py-6"
    >
      {children}
    </nav>
  );
};

export const ProductItem = ({
  title,
  description,
  href,
  src,
}: {
  title: string;
  description: string;
  href: string;
  src: string;
}) => {
  return (
    <motion.div
      whileHover={{
        scale: 1.05,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        boxShadow: "0px 4px 20px rgba(255, 255, 255, 0.2)",
      }}
      transition={{ type: "spring", stiffness: 300 }}
      className="flex space-x-2 p-2 rounded-lg"
    >
      <Link href={href} className="flex space-x-2">
        <Image
          src={src}
          width={100}
          height={50}
          alt={title}
          className="flex-shrink-0 rounded-md shadow-2xl"
        />
        <div>
          <h4 className="text-base font-bold mb-1 text-white">{title}</h4>
          <p className="text-neutral-300 text-xs max-w-[8rem]">
            {description}
          </p>
        </div>
      </Link>
    </motion.div>
  );
};

export const HoveredLink = ({ children, ...rest }: any) => {
  return (
    <Link
      {...rest}
      className="text-neutral-200 hover:text-white"
    >
      {children}
    </Link>
  );
};

export const DiscordLoginButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="bg-[#5865F2] text-white flex items-center gap-2 px-4 py-2 rounded-md hover:bg-[#4752C4] transition-colors"
  >
    <LogIn className="w-4 h-4" />
    Login with Discord
  </button>
);
import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        '2xl': '1536px',
        '4xl': '1720px',
      },
      maskImage: {
        "radial-gradient": "radial-gradient(var(--tw-gradient-stops))",
      },
      colors: {
        blue: {
          "50": "#DFDFF0",
          "75": "#dfdff2",
          "100": "#F0F2FA",
          "200": "#010101",
          "300": "#4FB7DD",
        },
        violet: {
          "300": "#5724ff",
        },
        yellow: {
          "100": "#8e983f",
          "300": "#edff66",
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0px" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0px" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-5px)" },
          "75%": { transform: "translateX(5px)" },
        },
        "shimmer-slide": {
          to: {
            transform: "translate(calc(100cqw - 100%), 0)",
          },
        },
        "spin-around": {
          "0%": {
            transform: "translateZ(0) rotate(0)",
          },
          "15%, 35%": {
            transform: "translateZ(0) rotate(90deg)",
          },
          "65%, 85%": {
            transform: "translateZ(0) rotate(270deg)",
          },
          "100%": {
            transform: "translateZ(0) rotate(360deg)",
          },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        worm1: {
          from: {
            animationTimingFunction: "ease-in-out",
            strokeDashoffset: "-87.96",
          },
          "20%": {
            animationTimingFunction: "ease-in",
            strokeDashoffset: "0",
          },
          "60%": {
            strokeDashoffset: "-791.68",
            visibility: "visible",
          },
          "60.1%": {
            strokeDashoffset: "-791.68",
            visibility: "hidden",
          },
          to: {
            strokeDashoffset: "-791.68",
            visibility: "hidden",
          },
        },
        worm2: {
          from: {
            strokeDashoffset: "-87.96",
            visibility: "hidden",
          },
          "60%": {
            strokeDashoffset: "-87.96",
            visibility: "hidden",
          },
          "60.1%": {
            animationTimingFunction: "cubic-bezier(0,0,0.5,0.75)",
            strokeDashoffset: "-87.96",
            visibility: "visible",
          },
          "77%": {
            animationTimingFunction: "cubic-bezier(0.5,0.25,0.5,0.88)",
            strokeDashoffset: "-340",
            visibility: "visible",
          },
          to: {
            strokeDashoffset: "-669.92",
            visibility: "visible",
          },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shake: "shake 0.5s cubic-bezier(.36,.07,.19,.97) both",
        "shimmer-slide": "shimmer-slide var(--speed) ease-in-out infinite alternate",
        "spin-around": "spin-around calc(var(--speed) * 2) infinite linear",
        worm1: "worm1 3s infinite",
        worm2: "worm2 3s infinite",
      },
      fontFamily: {
        hero: ["var(--font-hero)"],
        popin: ["var(--font-popin)"],
        general: ["var(--font-general)"],
        zentry: ["var(--font-zentry)"],
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config


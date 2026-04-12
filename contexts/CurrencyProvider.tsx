"use client"

import * as React from "react"
import { useEffect, useState } from "react"

export const CurrencyContext = React.createContext<{
  currency: "EUR" | "INR"
  exchangeRate: number
}>({
  currency: "INR",
  exchangeRate: 1,
})

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<"EUR" | "INR">("EUR")

  useEffect(() => {
    setCurrency("EUR")
  }, [])

  return (
    <CurrencyContext.Provider value={{ currency, exchangeRate: 1 }}>
      {children}
    </CurrencyContext.Provider>
  )
}

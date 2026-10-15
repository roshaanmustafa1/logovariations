import type { Metadata } from "next"
import { Geist_Mono, Inter } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "LogoPack Studio — Personal Brand Asset Generator",
  description: "Personal vector logo asset pack generator, color variation studio, and export engine.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", inter.variable)}
    >
      <body
        suppressHydrationWarning
        className="min-h-screen bg-[#F8F7F4] text-[#252525]"
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}

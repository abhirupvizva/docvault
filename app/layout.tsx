import React from "react"
import type { Metadata, Viewport } from 'next'
import { Geist, Fira_Code } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" })
const firaCode = Fira_Code({ subsets: ["latin"], variable: "--font-fira-code" })

export const metadata: Metadata = {
  title: 'DocVault - Secure Document Storage',
  description: 'Store, manage, and access your important PDFs and documents with enterprise-grade security.',
  generator: 'Next.js',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#000000',
  colorScheme: 'dark',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`dark ${geist.variable} ${firaCode.variable}`}>
        <body className="font-sans antialiased bg-zinc-950 text-white">
          {children}
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  )
}

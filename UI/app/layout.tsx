import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navigation from "./components/Navigation"
import { LanguageProvider } from "./contexts/LanguageContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Bus Organizer - Personnel Service Management",
  description: "Comprehensive personnel service (bus) organizer with route optimization",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script
          async
          defer
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        ></script>
      </head>
      <body className={inter.className}>
        <LanguageProvider>
          <div className="min-h-screen bg-gray-50">
            <Navigation />
            <main className="flex-1">{children}</main>
            <footer className="bg-white border-t border-gray-200 mt-12">
              <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="text-center text-gray-500 text-sm">
                  <p>&copy; 2025 Bus Organizer. Built with Next.js and .NET 8.</p>
                </div>
              </div>
            </footer>
          </div>
        </LanguageProvider>
      </body>
    </html>
  )
}

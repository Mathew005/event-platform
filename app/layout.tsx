// RootLayout.tsx
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { UserProvider } from '@/components/contexts/UserContext'
import { EventProvider } from '@/components/contexts/EventContext'


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Event Platform',
  description: 'A platform for managing and discovering events',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider>
          <EventProvider>
            {children}
          </EventProvider>
        </UserProvider>
      </body>
    </html>
  )
}

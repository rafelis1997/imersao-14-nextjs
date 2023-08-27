import { NavBar } from './components/NavBar'
import ThemeRegistry from './components/ThemeRegistry/ThemeRegistry'
import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Imersão 14- Sistema de rastreabilidade de veículos',
  description: 'Generated by create next app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <NavBar />
          {children}
        </ThemeRegistry>
      </body>
    </html>
  )
}

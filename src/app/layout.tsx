import LecteurGlobal from '@/components/LecteurGlobal'
import { AudioProvider } from '@/contexts/AudioContext'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Jàng sa Diné — Apprends ta religion',
  description: 'Cours audio islamiques, Quran, invocations et rappels en français.',
  icons: { icon: '/logo.png' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <AudioProvider>
          {children}
          <LecteurGlobal />
        </AudioProvider>
      </body>
    </html>
  )
}
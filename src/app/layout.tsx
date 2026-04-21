import BanniereReprise from '@/components/BanniereReprise'
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
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=forward_10,replay_10,play_arrow&display=swap" />
      </head>
      <body>
        <AudioProvider>
          {children}
          <LecteurGlobal />
          <BanniereReprise />
        </AudioProvider>
      </body>
    </html>
  )
}
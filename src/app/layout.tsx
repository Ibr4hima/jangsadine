import LecteurGlobal from '@/components/LecteurGlobal'
import ScrollRestore from '@/components/ScrollRestore'
import ScrollTop from '@/components/ScrollTop'
import { AudioProvider } from '@/contexts/AudioContext'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Jàng sa Diné',
  description: 'Cours audio islamiques, khoutbah, conférences et fatwas par les savants sunnites.',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'android-chrome', url: '/android-chrome-192x192.png', sizes: '192x192' },
      { rel: 'android-chrome', url: '/android-chrome-512x512.png', sizes: '512x512' },
    ],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=forward_10,replay_10,play_arrow&display=swap" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#28558b" />
      </head>
      <body>
        <AudioProvider>
          {children}
          <LecteurGlobal />
          <ScrollTop />
          <ScrollRestore />
          <audio id="audio-principal" preload="metadata">
            <source id="source-principal" src={undefined} type="audio/mpeg" />
          </audio>
          <audio id="audio-livre" preload="metadata">
            <source id="source-livre" src={undefined} type="audio/mpeg" />
          </audio>
          {/* Audio silencieux en boucle pour maintenir la session iOS active même en pause */}
          <audio id="audio-silence" src="/silence.wav" loop preload="auto"></audio>
        </AudioProvider>
      </body>
    </html>
  )
}
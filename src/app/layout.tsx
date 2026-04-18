import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Jàng sa Diné — Apprends ta religion',
  description: 'Cours audio, Conférences, Sermons du Vendredi en Wolof et bien plus.',
  keywords: 'islam, cours audio, quran, invocations, fiqh, aqeedah, français',
  icons: {
    icon: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
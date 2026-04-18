import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Jàng sa Diné — Apprends ta Religion',
  description: 'Cours audio islamiques, Quran, invocations et rappels en français. Aqeedah, Fiqh, Hadith, Seerah et bien plus.',
  keywords: 'islam, cours audio, quran, invocations, fiqh, aqeedah, français',
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
'use client'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

type Livre = {
  id: string
  titre: string
  url_pdf: string | null
  description: string | null
  categories: { nom: string }
}

type Cours = {
  id: string
  titre: string
  sheikh: string
  nb_episodes: number
  description: string | null
}

const couleurBg: Record<string, string> = {
  Aqeedah: '#e8f0f8', Fiqh: '#faf3dc', Hadith: '#eaf4ee', Tafsir: '#fde8f0',
  Seerah: '#fdf0eb', 'Bons comportements': '#f2eefa', 'Sciences du Coran': '#e8f6f5', 'Séries de cours': '#e8f8e8',
}
const couleurTxt: Record<string, string> = {
  Aqeedah: '#28558b', Fiqh: '#b8911f', Hadith: '#2d7a4f', Tafsir: '#a02060',
  Seerah: '#c05c2e', 'Bons comportements': '#6b3db5', 'Sciences du Coran': '#1a8a7a', 'Séries de cours': '#1a7a1a',
}

export default function PageLivre() {
  const { id } = useParams()
  const [livre, setLivre] = useState<Livre | null>(null)
  const [versions, setVersions] = useState<Cours[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function charger() {
      const { data: livreData } = await supabase
        .from('livres')
        .select('*, categories(nom)')
        .eq('id', id)
        .single()
      const { data: coursData } = await supabase
        .from('cours')
        .select('id, titre, sheikh, nb_episodes, description')
        .eq('livre_id', id)
        .order('created_at')
      if (livreData) setLivre(livreData)
      if (coursData) setVersions(coursData)
      setLoading(false)
    }
    charger()
  }, [id])

  const categorie = (livre?.categories as any)?.nom || ''

  if (loading) return (
    <main style={{ minHeight: '100vh', background: 'var(--fond-creme)' }}>
      <Navbar />
      <div style={{ textAlign: 'center', padding: '100px 24px', color: '#aaa' }}>Chargement...</div>
    </main>
  )

  if (!livre) return (
    <main style={{ minHeight: '100vh', background: 'var(--fond-creme)' }}>
      <Navbar />
      <div style={{ textAlign: 'center', padding: '100px 24px', color: '#aaa' }}>Livre introuvable</div>
    </main>
  )

  return (
    <main style={{ minHeight: '100vh', background: 'var(--fond-creme)' }}>
      <Navbar />

      <section style={{ background: 'var(--bleu)', padding: '40px 24px 36px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Link href="/audio" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', display: 'inline-block', marginBottom: '16px' }}>
            ← Retour aux cours
          </Link>
          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', color: 'var(--or)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
            {categorie}
          </span>
          <h1 style={{ fontSize: '30px', fontWeight: 700, color: 'white', marginBottom: livre.description ? '10px' : '16px', lineHeight: 1.3 }}>
            {livre.titre}
          </h1>
          {livre.description && (
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, maxWidth: '600px', marginBottom: '16px', fontStyle: 'italic' }}>
              {livre.description}
            </p>
          )}
          {livre.url_pdf && (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <a href={livre.url_pdf} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', color: 'white', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.25)' }}>
                📖 Consulter le livre
              </a>
            </div>
          )}
        </div>
      </section>

      <div style={{ height: '3px', background: 'linear-gradient(90deg, transparent, #d9ac2a 30%, #d9ac2a 70%, transparent)' }} />

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '36px 24px' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', color: 'var(--or)', textTransform: 'uppercase', marginBottom: '6px' }}>
          Versions disponibles
        </p>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--texte)', marginBottom: '24px' }}>
          {versions.length} version{versions.length > 1 ? 's' : ''} de ce cours
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {versions.map(v => (
            <Link key={v.id} href={`/audio/${v.id}`} style={{ background: 'white', border: '1px solid var(--bordure)', borderRadius: '14px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px', textDecoration: 'none', transition: 'border-color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--bleu)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--bordure)'}
            >
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--bleu)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <div style={{ width: 0, height: 0, borderTop: '7px solid transparent', borderBottom: '7px solid transparent', borderLeft: '12px solid white', marginLeft: '3px' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--texte)', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.titre || livre.titre}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', fontWeight: 500, padding: '2px 10px', borderRadius: '10px', background: couleurBg[categorie] || '#f0f0f0', color: couleurTxt[categorie] || '#666' }}>{v.sheikh}</span>
                  <span style={{ fontSize: '12px', fontWeight: 500, padding: '2px 10px', borderRadius: '10px', background: '#f0f0f0', color: '#999' }}>{v.nb_episodes}</span>
                </div>
              </div>
              <span style={{ fontSize: '13px', color: 'var(--bleu)', fontWeight: 600, flexShrink: 0 }}>→</span>
            </Link>
          ))}
        </div>
      </div>

      <Footer />

    </main>
  )
}

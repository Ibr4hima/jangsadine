'use client'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import TitreDefilant from '@/components/TitreDefilant'
import { useAudio } from '@/contexts/AudioContext'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

type Livre = {
  id: string
  titre: string
  url_pdf: string | null
  url_audio: string | null
  description: string | null
  type: string
  sheikh: string | null
  categories: { nom: string }
}

type Cours = {
  id: string
  titre: string
  sheikh: string
  nb_episodes: number
  description: string | null
}

type Chapitre = {
  id: string
  titre: string
  numero: number
  url_pdf: string | null
}

const couleurBg: Record<string, string> = {
  Aqeedah: '#e8f0f8', Fiqh: '#faf3dc', Hadith: '#eaf4ee', 'Tafsir & Sciences du Coran': '#fde8f0',
  Seerah: '#fdf0eb', 'Invocations': '#DEE8CE', 'Éthique & Bons comportements': '#f2eefa', 'Séries de cours': '#EDE8D0',
}
const couleurTxt: Record<string, string> = {
  Aqeedah: '#28558b', Fiqh: '#b8911f', Hadith: '#2d7a4f', 'Tafsir & Sciences du Coran': '#a02060',
  Seerah: '#c05c2e', 'Invocations': '#06402B', 'Éthique & Bons comportements': '#6b3db5', 'Séries de cours': '#654321',
}

export default function PageLivre() {
  const { id } = useParams()
  const [livre, setLivre] = useState<Livre | null>(null)
  const [versions, setVersions] = useState<Cours[]>([])
  const [chapitres, setChapitres] = useState<Chapitre[]>([])
  const [loading, setLoading] = useState(true)
  const { jouerLivre, toggleLivre, enLectureLivre, progressionLivre, livreAudio } = useAudio()

  useEffect(() => {
    async function charger() {
      const { data: livreData } = await supabase
        .from('livres')
        .select('*, categories(nom)')
        .eq('id', id)
        .single()
      if (livreData) {
        setLivre(livreData)
        if (livreData.type === 'chapitres') {
          const { data: chapsData } = await supabase
            .from('chapitres_livre')
            .select('id, titre, numero, url_pdf')
            .eq('livre_id', id)
            .order('numero')
          if (chapsData) setChapitres(chapsData)
        } else {
          const { data: coursData } = await supabase
            .from('cours')
            .select('id, titre, sheikh, nb_episodes, description')
            .eq('livre_id', id)
            .order('created_at')
          if (coursData) setVersions(coursData)
        }
      }
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
          <button onClick={() => window.history.back()}
            style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '16px', display: 'inline-block', padding: 0 }}>
            ← Retour aux cours
          </button>
          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', color: 'var(--or)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
            {categorie}
          </span>
          <h1 style={{ fontSize: '30px', fontWeight: 700, color: 'white', marginBottom: '6px', lineHeight: 1.3 }}>
            {livre.titre}
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: livre.description ? '10px' : '0' }}>
            {livre.type === 'chapitres'
              ? `${livre.sheikh ? livre.sheikh + ' · ' : ''}${chapitres.length} chapitre${chapitres.length > 1 ? 's' : ''}`
              : livre.sheikh || ''
            }
          </p>
          {livre.description && (
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, maxWidth: '600px', marginBottom: '16px', fontStyle: 'italic' }}>
              {livre.description}
            </p>
          )}
          {/* Boutons PDF + Audio */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }}>
            {livre.url_pdf && (
              <a href={livre.url_pdf} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', color: 'white', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.25)' }}>
                📖 Consulter le livre
              </a>
            )}
            {livre.url_audio && (
              <button
                onClick={() => {
                  if (!livre.url_audio) return
                  if (livreAudio?.url === livre.url_audio) {
                    toggleLivre()
                  } else {
                    jouerLivre(livre.url_audio, livre.titre)
                  }
                }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: enLectureLivre && livreAudio?.url === livre.url_audio ? 'rgba(217,172,42,0.3)' : 'rgba(255,255,255,0.15)',
                  color: 'white', padding: '8px 16px', borderRadius: '8px', fontSize: '13px',
                  fontWeight: 500, border: enLectureLivre && livreAudio?.url === livre.url_audio ? '1px solid rgba(217,172,42,0.6)' : '1px solid rgba(255,255,255,0.25)',
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s'
                }}>
                {/* Icône animée */}
                {enLectureLivre && livreAudio?.url === livre.url_audio ? (
                  <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '14px' }}>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} style={{
                        width: '2px', borderRadius: '2px', background: 'var(--or)',
                        height: i % 2 === 0 ? '14px' : '8px',
                        animation: 'pulse-bar 0.4s ease-in-out infinite alternate',
                        animationDelay: `${i * 0.1}s`
                      }} />
                    ))}
                  </div>
                ) : (
                  <span style={{ fontSize: '16px' }}>🎧</span>
                )}
                {enLectureLivre && livreAudio?.url === livre.url_audio ? '' : 'Écouter le livre'}
                {/* Barre de progression */}
                {enLectureLivre && livreAudio?.url === livre.url_audio && (
                  <div style={{ width: '60px', height: '3px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: progressionLivre + '%', height: '100%', background: 'var(--or)', borderRadius: '2px', transition: 'width 0.5s' }} />
                  </div>
                )}
              </button>
            )}
          </div>
        </div>
      </section>

      <div style={{ height: '3px', background: 'linear-gradient(90deg, transparent, #d9ac2a 30%, #d9ac2a 70%, transparent)' }} />

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '36px 24px' }}>

        {/* MODE CHAPITRES */}
        {livre.type === 'chapitres' && (
          <>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', color: 'var(--or)', textTransform: 'uppercase', marginBottom: '6px' }}>
              Table des matières
            </p>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--texte)', marginBottom: '24px' }}>
              {chapitres.length} chapitre{chapitres.length > 1 ? 's' : ''}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {chapitres.map(chap => (
                <div key={chap.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#bbb', width: '24px', textAlign: 'right', flexShrink: 0 }}>
                    {chap.numero}
                  </span>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Link href={`/audio/livre/${id}/chapitre/${chap.id}`}
                      onClick={() => sessionStorage.setItem(`scroll:/audio/livre/${id}`, String(window.scrollY))}
                      style={{
                        flex: 1, background: 'white', border: '1px solid var(--bordure)', borderRadius: '12px',
                        padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px',
                        textDecoration: 'none', transition: 'border-color 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--bleu)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--bordure)'}
                    >
                      <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: couleurBg[categorie] || '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <div style={{ width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: '10px solid ' + (couleurTxt[categorie] || '#aaa'), marginLeft: '2px' }} />
                      </div>
                      <TitreDefilant texte={chap.titre} style={{ fontSize: '14px', fontWeight: 600, color: 'var(--texte)', flex: 1 }} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* MODE STANDARD */}
        {livre.type !== 'chapitres' && (
          <>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', color: 'var(--or)', textTransform: 'uppercase', marginBottom: '6px' }}>
              Versions disponibles
            </p>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--texte)', marginBottom: '24px' }}>
              {versions.length} version{versions.length > 1 ? 's' : ''} de ce cours
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {versions.map(v => (
                <Link key={v.id} href={`/audio/${v.id}`}
                  onClick={() => {
                    console.log('CLICK - scroll actuel:', window.scrollY)
                    sessionStorage.setItem(`scroll:/audio/livre/${id}`, String(window.scrollY))
                  }}
                  style={{ background: 'white', border: '1px solid var(--bordure)', borderRadius: '14px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px', textDecoration: 'none', transition: 'border-color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--bleu)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--bordure)'}
                >
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--bleu)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <div style={{ width: 0, height: 0, borderTop: '7px solid transparent', borderBottom: '7px solid transparent', borderLeft: '12px solid white', marginLeft: '3px' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <TitreDefilant texte={v.titre || livre.titre} style={{ fontSize: '15px', fontWeight: 700, color: 'var(--texte)', marginBottom: '4px' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '12px', fontWeight: 500, padding: '2px 10px', borderRadius: '10px', background: couleurBg[categorie] || '#f0f0f0', color: couleurTxt[categorie] || '#666' }}>{v.sheikh}</span>
                      <span style={{ fontSize: '12px', fontWeight: 500, padding: '2px 10px', borderRadius: '10px', background: '#f0f0f0', color: '#999' }}>{v.nb_episodes}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      <Footer />
    </main>
  )
}
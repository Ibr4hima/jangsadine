'use client'

import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import { BookMarked, BookOpen, Clock, Headphones, Mic } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'


const modules = [
  { nom: 'Cours audio', href: '/audio', couleur: '#e8f0f8', iconColor: '#28558b' },
  { nom: 'Conférences', href: '/conferences', couleur: '#faf3dc', iconColor: '#b8911f' },
  { nom: 'Khoutbah', href: '/khoutbah', couleur: '#e8f0f8', iconColor: '#28558b' },
  { nom: 'Heures de prières', href: '/prieres', couleur: '#faf3dc', iconColor: '#b8911f' },
  { nom: 'Ebooks', href: '/ebooks', couleur: '#e8f0f8', iconColor: '#28558b' },
]

const categories = ['Aqeedah', 'Fiqh', 'Hadith', 'Tafsir', 'Seerah', 'Bons comportements', 'Fatwas', 'Khoutbah', 'Conférences']

const icones: Record<string, React.ReactNode> = {
  'Cours audio': <Headphones size={22} strokeWidth={1.5} />,
  'Conférences': <Mic size={22} strokeWidth={1.5} />,
  'Khoutbah': <BookMarked size={22} strokeWidth={1.5} />,
  'Heures de prières': <Clock size={22} strokeWidth={1.5} />,
  'Ebooks': <BookOpen size={22} strokeWidth={1.5} />,
}

export default function Accueil() {
  const [derniersCoursDB, setDerniersCoursDB] = useState<{ id: string; titre: string; sheikh: string; nb_episodes: number; categories: { nom: string } }[]>([])

  useEffect(() => {
    async function charger() {
      const { data } = await supabase
        .from('cours')
        .select('id, titre, sheikh, nb_episodes, categories(nom)')
        .order('created_at', { ascending: false })
        .limit(3)
      if (data) setDerniersCoursDB(data as any)
    }
    charger()
  }, [])
  return (
    <main>
      <Navbar />

      {/* Hero */}
      <section style={{
        background: 'var(--fond-creme)',
        padding: '72px 24px 60px',
        textAlign: 'center',
        borderBottom: '1px solid var(--bordure)',
      }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <Image
            src="/basmallah.png"
            alt="Bismillah ir-rahman ir-rahim"
            width={320}
            height={80}
            style={{
              margin: '0 auto 20px',
              opacity: 0.85,
            }}
          />
          <h1 style={{
            fontSize: '52px',
            fontWeight: 700,
            color: 'var(--texte)',
            lineHeight: 1.15,
            marginBottom: '16px',
          }}>
            Apprends ta{' '}
            <span style={{ color: 'var(--or)' }}>religion</span>
            <br />
          </h1>
          <p style={{
            fontSize: '16px',
            color: 'var(--texte-muted)',
            lineHeight: 1.7,
            marginBottom: '32px',
          }}>
            Cours audio, khoutbah, conférences, ebooks et heures de prières —<br />
            accessible à tous gratuitement.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/audio" style={{
              background: 'var(--bleu)',
              color: 'white',
              padding: '13px 28px',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 500,
            }}>
              Découvrir les cours
            </Link>
            <Link href="/ebooks" style={{
              border: '1.5px solid var(--or)',
              color: 'var(--or-fonce)',
              padding: '13px 28px',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 500,
            }}>
              Consulter les Ebooks
            </Link>
          </div>
        </div>
      </section>

      {/* Barre or */}
      <div style={{ height: '3px', background: 'linear-gradient(90deg, transparent, #d9ac2a 30%, #d9ac2a 70%, transparent)' }} />

      {/* Modules */}
      <section style={{
        background: 'var(--blanc)',
        padding: '56px 24px',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', color: 'var(--or)', textTransform: 'uppercase', marginBottom: '6px' }}>
            La plateforme
          </p>
          <h2 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--texte)', marginBottom: '32px' }}>
            Tout ce dont tu as besoin
          </h2>
          <div className="modules-grid">
            {modules.map((mod) => (
              <Link key={mod.href} href={mod.href} style={{
                border: '1px solid var(--bordure)',
                borderRadius: '12px',
                padding: '28px 16px',
                background: 'white',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                gap: '12px',
                transition: 'border-color 0.15s, transform 0.15s',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--bleu)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--bordure)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: mod.couleur,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: mod.iconColor,
                }}>
                  {icones[mod.nom]}
                </div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--texte)',
                  lineHeight: 1.3,
                }}>
                  {mod.nom}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Barre or */}
      <div style={{ height: '3px', background: 'linear-gradient(90deg, transparent, #d9ac2a 30%, #d9ac2a 70%, transparent)' }} />

      {/* Aperçu cours audio */}
      <section style={{
        background: 'var(--fond-creme)',
        padding: '56px 24px',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', color: 'var(--or)', textTransform: 'uppercase', marginBottom: '6px' }}>
            Bibliothèque
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--texte)' }}>
              Cours audio
            </h2>
            <Link href="/audio" style={{ fontSize: '14px', color: 'var(--bleu)', fontWeight: 500 }}>
              Voir tout →
            </Link>
          </div>

          {/* Catégories */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
            {categories.map((cat) => (
              <span key={cat} style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 500,
                border: '1px solid var(--bordure)',
                background: 'white',
                color: '#666',
                cursor: 'pointer',
              }}>
                {cat}
              </span>
            ))}
          </div>

          {/* Aperçu 3 audios */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {derniersCoursDB.map((cours) => (
              <Link key={cours.id} href={`/audio/${cours.id}`} style={{
                background: 'white',
                border: '1px solid var(--bordure)',
                borderRadius: '12px',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                textDecoration: 'none',
                transition: 'border-color 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--bleu)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--bordure)'}
              >
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--bleu)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <div style={{ width: 0, height: 0, borderTop: '7px solid transparent', borderBottom: '7px solid transparent', borderLeft: '12px solid white', marginLeft: '3px' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--texte)', marginBottom: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {cours.titre}
                  </div>
                  <div style={{ fontSize: '12px', color: '#aaa' }}>
                    {cours.sheikh} · {cours.nb_episodes} épisode{cours.nb_episodes > 1 ? 's' : ''}
                  </div>
                </div>
                <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '10px', background: '#e8f0f8', color: 'var(--bleu)', fontWeight: 500, flexShrink: 0 }}>
                  {(cours.categories as any)?.nom}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

    </main>
  )
}
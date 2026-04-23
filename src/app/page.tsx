'use client'

import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import TitreDefilant from '@/components/TitreDefilant'
import { supabase } from '@/lib/supabase'
import { BookMarked, BookOpen, Clock, Headphones, Mic } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const couleurBg: Record<string, string> = {
  Aqeedah: '#e8f0f8', Fiqh: '#faf3dc', Hadith: '#eaf4ee', Tafsir: '#fde8f0',
  Seerah: '#fdf0eb', 'Bons comportements': '#f2eefa', 'Sciences du Coran': '#e8f6f5', 'Séries de cours': '#e8f8e8',
}
const couleurTxt: Record<string, string> = {
  Aqeedah: '#28558b', Fiqh: '#b8911f', Hadith: '#2d7a4f', Tafsir: '#a02060',
  Seerah: '#c05c2e', 'Bons comportements': '#6b3db5', 'Sciences du Coran': '#1a8a7a', 'Séries de cours': '#1a7a1a',
}


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
  const [derniersEpisodes, setDerniersEpisodes] = useState<{ id: string; titre: string; duree: string; cours: { id: string; titre: string; sheikh: string; categories: { nom: string } } }[]>([])

  useEffect(() => {
    async function charger() {
      const { data } = await supabase
        .from('episodes')
        .select('id, titre, duree, cours:cours_id(id, titre, sheikh, categories(nom))')
        .order('created_at', { ascending: false })
        .limit(3)
      if (data) setDerniersEpisodes(data as any)
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
            Cours audio, khoutbah, conférences, fatwas, ebooks et heures de prières —<br />
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
              Dourous
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
            {derniersEpisodes.map((ep) => {
              const cours = ep.cours as any
              const nomCat = (cours?.categories as any)?.nom
              return (
                <Link key={ep.id} href={`/audio/${cours?.id}`} style={{
                  minWidth: 0, overflow: 'hidden', background: 'white',
                  border: '1px solid var(--bordure)', borderRadius: '12px',
                  padding: '12px 14px', display: 'flex', alignItems: 'center',
                  gap: '14px', textDecoration: 'none', transition: 'border-color 0.15s'
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--bleu)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--bordure)'}
                >
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <div style={{ width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: '10px solid #aaa', marginLeft: '2px' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <TitreDefilant
                      texte={ep.titre}
                      style={{ fontSize: '14px', fontWeight: 600, color: 'var(--texte)', marginBottom: '2px' }}
                    />
                    <p style={{ fontSize: '12px', color: '#999' }}>{cours?.sheikh} · {ep.duree}</p>
                  </div>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: couleurBg[nomCat] || '#f0f0f0', border: '0.7px solid ' + (couleurTxt[nomCat] || '#ccc'), flexShrink: 0 }} />                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

    </main>
  )
}
'use client'

import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import TitreDefilant from '@/components/TitreDefilant'
import { supabase } from '@/lib/supabase'
import { BookMarked, BookOpen, Clock, Headphones, HelpCircle, Mic } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const couleurBg: Record<string, string> = {
  Aqeedah: '#e8f0f8', Fiqh: '#faf3dc', Hadith: '#eaf4ee', 'Tafsir & Sciences du Coran': '#fde8f0',
  Seerah: '#fdf0eb', 'Invocations': '#DEE8CE', 'Éthique & Bons comportements': '#f2eefa', 'Séries de cours': '#EDE8D0',
}
const couleurTxt: Record<string, string> = {
  Aqeedah: '#28558b', Fiqh: '#b8911f', Hadith: '#2d7a4f', 'Tafsir & Sciences du Coran': '#a02060',
  Seerah: '#c05c2e', 'Invocations': '#06402B', 'Éthique & Bons comportements': '#6b3db5', 'Séries de cours': '#654321',
}

const sections = [
  {
    nom: 'Cours audio', desc: 'Dourous complets par des sheikhs reconnus',
    href: '/audio', bg: '#e8f0f8', color: '#28558b',
    icon: <Headphones size={22} strokeWidth={1.5} />,
  },
  {
    nom: 'Khoutbah', desc: 'Prêches du vendredi en wolof et en français',
    href: '/khoutbah', bg: '#faf3dc', color: '#b8911f',
    icon: <BookMarked size={22} strokeWidth={1.5} />,
  },
  {
    nom: 'Conférences', desc: 'Causeries et conférences islamiques',
    href: '/conferences', bg: '#eaf4ee', color: '#2d7a4f',
    icon: <Mic size={22} strokeWidth={1.5} />,
  },
  {
    nom: 'Ebooks', desc: 'Livres et ressources en PDF, gratuits',
    href: '/ebooks', bg: '#fdf0eb', color: '#c05c2e',
    icon: <BookOpen size={22} strokeWidth={1.5} />,
  },
  {
    nom: 'Fatwas', desc: 'Questions et réponses de jurisprudence',
    href: '/fatwas', bg: '#f2eefa', color: '#6b3db5',
    icon: <HelpCircle size={22} strokeWidth={1.5} />,
  },
  {
    nom: 'Prières', desc: 'Horaires géolocalisés, partout dans le monde',
    href: '/prieres', bg: '#DEE8CE', color: '#06402B',
    icon: <Clock size={22} strokeWidth={1.5} />,
  },
]

export default function Accueil() {
  const [derniersCours, setDerniersCours] = useState<{
    id: string; titre: string; sheikh: string; nb_episodes: number; categories: { nom: string }
  }[]>([])
  const [nbCours, setNbCours] = useState<number | null>(null)

  useEffect(() => {
    async function charger() {
      const [{ data }, { count }] = await Promise.all([
        supabase.from('cours')
          .select('id, titre, sheikh, nb_episodes, categories(nom)')
          .order('created_at', { ascending: false })
          .limit(4),
        supabase.from('cours').select('*', { count: 'exact', head: true }),
      ])
      if (data) setDerniersCours(data as any)
      if (count) setNbCours(count)
    }
    charger()
  }, [])

  return (
    <main>
      <Navbar />

      {/* ── Hero ── */}
      <section style={{
        background: 'var(--fond-creme)',
        padding: '80px 24px 68px',
        textAlign: 'center',
        borderBottom: '1px solid var(--bordure)',
      }}>
        <div style={{ maxWidth: '580px', margin: '0 auto' }}>
          <Image
            src="/basmallah.png"
            alt="Bismillah ir-rahman ir-rahim"
            width={280}
            height={70}
            style={{ margin: '0 auto 32px', opacity: 0.8 }}
          />

          <h1 style={{
            fontSize: 'clamp(40px, 8vw, 60px)',
            fontWeight: 700,
            color: 'var(--texte)',
            lineHeight: 1.1,
            letterSpacing: '-0.5px',
            marginBottom: '18px',
          }}>
            Apprends ta{' '}
            <span style={{ color: 'var(--or)' }}>religion</span>
          </h1>

          <p style={{
            fontSize: '17px',
            color: 'var(--texte-muted)',
            lineHeight: 1.75,
            marginBottom: '36px',
            maxWidth: '440px',
            margin: '0 auto 36px',
          }}>
            Cours audio, khoutbah, conférences, fatwas et ebooks —
            tout ce dont tu as besoin, gratuitement.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '48px' }}>
            <Link href="/audio" style={{
              background: 'var(--bleu)', color: 'white',
              padding: '14px 32px', borderRadius: '10px',
              fontSize: '15px', fontWeight: 600,
              boxShadow: '0 2px 14px rgba(40,85,139,0.28)',
              transition: 'opacity 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Découvrir les cours
            </Link>
            <Link href="/ebooks" style={{
              background: 'white',
              border: '1.5px solid var(--or)',
              color: 'var(--or-fonce)',
              padding: '14px 32px', borderRadius: '10px',
              fontSize: '15px', fontWeight: 600,
              transition: 'background 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#fdf8ec'}
              onMouseLeave={e => e.currentTarget.style.background = 'white'}
            >
              Voir les ebooks
            </Link>
          </div>

          {/* Stats strip */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            borderTop: '1px solid var(--bordure)',
            paddingTop: '28px',
          }}>
            {[
              { val: nbCours ? `+${nbCours}` : '—', label: 'cours audio' },
              { val: '100%', label: 'gratuit' },
              { val: 'FR · WO', label: 'langues' },
            ].map((s, i) => (
              <div key={i} style={{
                flex: 1,
                padding: '0 20px',
                borderLeft: i > 0 ? '1px solid var(--bordure)' : 'none',
              }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--bleu)', marginBottom: '3px' }}>{s.val}</div>
                <div style={{ fontSize: '11px', color: 'var(--texte-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gold bar */}
      <div style={{ height: '3px', background: 'linear-gradient(90deg, transparent, #d9ac2a 30%, #d9ac2a 70%, transparent)' }} />

      {/* ── Content sections ── */}
      <section style={{ background: 'white', padding: '68px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', color: 'var(--or)', textTransform: 'uppercase', marginBottom: '8px', textAlign: 'center' }}>
            Explorer
          </p>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 34px)', fontWeight: 700, color: 'var(--texte)', marginBottom: '44px', textAlign: 'center' }}>
            Tout le contenu, en un seul endroit
          </h2>

          <div className="sections-grid">
            {sections.map(s => (
              <Link key={s.href} href={s.href} style={{
                display: 'flex', alignItems: 'flex-start', gap: '14px',
                padding: '18px 20px', borderRadius: '14px',
                border: '1px solid var(--bordure)',
                background: 'white',
                transition: 'border-color 0.18s, box-shadow 0.18s, transform 0.18s',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = s.color
                  e.currentTarget.style.boxShadow = `0 4px 20px ${s.color}1a`
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--bordure)'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: s.bg, color: s.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {s.icon}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--texte)', marginBottom: '4px' }}>{s.nom}</div>
                  <div style={{ fontSize: '13px', color: 'var(--texte-muted)', lineHeight: 1.45 }}>{s.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Gold bar */}
      <div style={{ height: '3px', background: 'linear-gradient(90deg, transparent, #d9ac2a 30%, #d9ac2a 70%, transparent)' }} />

      {/* ── Derniers cours ── */}
      <section style={{ background: 'var(--fond-creme)', padding: '68px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '8px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', color: 'var(--or)', textTransform: 'uppercase' }}>
              Bibliothèque
            </p>
            <Link href="/audio" style={{ fontSize: '14px', color: 'var(--bleu)', fontWeight: 500 }}>
              Tout voir →
            </Link>
          </div>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 34px)', fontWeight: 700, color: 'var(--texte)', marginBottom: '28px' }}>
            Derniers cours
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {derniersCours.map(cours => {
              const nomCat = (cours.categories as any)?.nom
              const bgCat = couleurBg[nomCat] || '#f0f0f0'
              const txtCat = couleurTxt[nomCat] || '#888'
              return (
                <Link key={cours.id} href={`/audio/${cours.id}`} style={{
                  display: 'flex', alignItems: 'center', gap: '16px',
                  background: 'white', border: '1px solid var(--bordure)',
                  borderRadius: '14px', padding: '16px 20px',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--bleu)'
                    e.currentTarget.style.boxShadow = '0 2px 14px rgba(40,85,139,0.09)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--bordure)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  {/* Play circle */}
                  <div style={{
                    width: '46px', height: '46px', borderRadius: '50%',
                    background: bgCat,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <div style={{
                      width: 0, height: 0,
                      borderTop: '6px solid transparent',
                      borderBottom: '6px solid transparent',
                      borderLeft: `11px solid ${txtCat}`,
                      marginLeft: '3px',
                    }} />
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <TitreDefilant
                      texte={cours.titre}
                      style={{ fontSize: '15px', fontWeight: 600, color: 'var(--texte)', marginBottom: '6px' }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '12px', fontWeight: 500,
                        padding: '2px 10px', borderRadius: '20px',
                        background: bgCat, color: txtCat,
                      }}>
                        {cours.sheikh}
                      </span>
                      {nomCat && (
                        <span style={{ fontSize: '12px', color: '#aaa' }}>·</span>
                      )}
                      {nomCat && (
                        <span style={{ fontSize: '12px', color: 'var(--texte-muted)' }}>{nomCat}</span>
                      )}
                    </div>
                  </div>

                  {/* Episode count */}
                  <div style={{ flexShrink: 0, textAlign: 'right' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--texte)' }}>{cours.nb_episodes}</span>
                    <div style={{ fontSize: '11px', color: '#aaa' }}>épisode{cours.nb_episodes > 1 ? 's' : ''}</div>
                  </div>
                </Link>
              )
            })}
          </div>

          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <Link href="/audio" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              border: '1.5px solid var(--bleu)', color: 'var(--bleu)',
              padding: '12px 28px', borderRadius: '10px',
              fontSize: '14px', fontWeight: 600,
              transition: 'background 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bleu)'; e.currentTarget.style.color = 'white' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--bleu)' }}
            >
              Voir toute la bibliothèque →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

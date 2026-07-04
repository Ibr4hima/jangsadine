'use client'
import Quadrillage from '@/components/Quadrillage'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

function arrondir(n: number): number {
  if (n < 10) return n
  if (n < 100) return Math.floor(n / 10) * 10
  return Math.floor(n / 50) * 50
}

const reseaux = [
  {
    nom: 'Telegram',
    href: 'https://t.me/janggsadine',
    couleur: '#229ED9',
    icone: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.17 13.913l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.978.646z" />
      </svg>
    ),
  },
  {
    nom: 'Instagram',
    href: 'https://www.instagram.com/jangsadine',
    couleur: '#E1306C',
    icone: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
  },
  {
    nom: 'YouTube',
    href: 'https://www.youtube.com/@jangsadine',
    couleur: '#FF0000',
    icone: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
      </svg>
    ),
  },
]

const liens = [
  { label: 'Cours audio', href: '/audio' },
  { label: 'Conférences', href: '/conferences' },
  { label: 'Khoutbah', href: '/khoutbah' },
  { label: 'Fatwas', href: '/fatwas' },
  { label: 'Prières', href: '/prieres' },
]

export default function Footer() {
  const [nbCours, setNbCours] = useState<number | null>(null)
  const [nbKhoutbahConf, setNbKhoutbahConf] = useState<number | null>(null)

  useEffect(() => {
    async function charger() {
      const { count: cours } = await supabase.from('cours').select('*', { count: 'exact', head: true })
      const { count: confs } = await supabase.from('conferences').select('*', { count: 'exact', head: true })
      const { count: khs } = await supabase.from('khoutbahs').select('*', { count: 'exact', head: true })
      if (cours) setNbCours(arrondir(cours))
      if (confs !== null && khs !== null) setNbKhoutbahConf(arrondir(confs + khs))
    }
    charger()
  }, [])

  return (
    <footer style={{ marginTop: 'auto', position: 'relative', background: 'linear-gradient(180deg, #1c3d66 0%, #13294a 100%)', borderTopLeftRadius: 32, borderTopRightRadius: 32, overflow: 'hidden' }}>
      <div style={{ height: '3px', background: 'linear-gradient(90deg, transparent, #d6ad3a 30%, #d6ad3a 70%, transparent)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(110% 70% at 50% 0%, rgba(214,173,58,0.07), transparent 55%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', maxWidth: '1100px', margin: '0 auto', padding: '52px 28px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '40px', marginBottom: '44px' }}>

          <div style={{ maxWidth: '300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '11px', marginBottom: '14px' }}>
              <Image src="/logo.png" alt="Jàng sa Diné" width={38} height={38} />
              <span style={{ fontSize: '18px', fontWeight: 700, color: 'white', letterSpacing: '0.2px' }}>
                Jàng sa <span style={{ color: '#d6ad3a' }}>Diné</span>
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.75 }}>
              {nbCours && nbKhoutbahConf
                ? `Plus de ${nbCours} cours audio et plus de ${nbKhoutbahConf} conférences et khoutbah en wolof — le tout gratuitement.`
                : 'Apprends ta religion — cours audio, khoutbah, conférences et ebooks islamiques accessibles gratuitement.'
              }
            </p>
          </div>

          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1.8px', color: '#d6ad3a', textTransform: 'uppercase', marginBottom: '16px' }}>Navigation</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {liens.map(l => (
                <Link key={l.href} href={l.href} style={{ fontSize: '13.5px', color: 'rgba(255,255,255,0.6)', transition: 'color 0.15s' }}
                  onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => e.currentTarget.style.color = '#d6ad3a'}
                  onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                >{l.label}</Link>
              ))}
            </div>
          </div>

          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1.8px', color: '#d6ad3a', textTransform: 'uppercase', marginBottom: '16px' }}>Nous suivre</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
              {reseaux.map(r => (
                <a key={r.nom} href={r.href} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '11px', textDecoration: 'none', transition: 'transform 0.15s' }}
                  onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => e.currentTarget.style.transform = 'translateX(2px)'}
                  onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => e.currentTarget.style.transform = 'translateX(0)'}
                >
                  <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: r.couleur + '26', border: '1px solid ' + r.couleur + '4d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: r.couleur, flexShrink: 0 }}>
                    {r.icone}
                  </div>
                  <span style={{ fontSize: '13.5px', fontWeight: 500, color: 'rgba(255,255,255,0.72)' }}>{r.nom}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', marginBottom: '22px' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>© {new Date().getFullYear()} Jàng sa Diné — Tous droits réservés</p>
        </div>
      </div>
    </footer>
  )
}
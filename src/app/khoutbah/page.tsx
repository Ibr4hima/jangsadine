'use client'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import TitreDefilant from '@/components/TitreDefilant'
import MiniEgaliseur from '@/components/MiniEgaliseur'
import { useAudio } from '@/contexts/AudioContext'
import { supabase } from '@/lib/supabase'
import { Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'

type Khoutbah = { id: string; titre: string; sheikh: string; duree: string; url_audio: string; serie: string | null; numero_serie: number | null }

// ─── palette identique à l'app ───────────────────────────────
const BLEU = '#2d578c'
const OR = '#d6ad3a'
const BG_TOP = '#3d6ba3'
const BG_MID = '#2d578c'
const BG_BOT = '#234a7a'
const W14 = 'rgba(255,255,255,0.14)'
const W55 = 'rgba(255,255,255,0.55)'
const W70 = 'rgba(255,255,255,0.70)'
const W10 = 'rgba(255,255,255,0.10)'

function normaliser(t: string) {
  return t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

// ─── Squelette de chargement ──────────────────────────────────
function Squelettes({ n = 6 }: { n?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="squelette" style={{ height: 72, borderRadius: 18 }} />
      ))}
    </div>
  )
}

// ─── Carte d'une khoutbah ─────────────────────────────────────
function CarteKhoutbah({ k, actif, enLecture, onPress }: {
  k: Khoutbah, actif: boolean, enLecture: boolean, onPress: () => void
}) {
  const badge = k.serie ? `${k.serie}${k.numero_serie ? ` · ${k.numero_serie}` : ''}` : null

  return (
    <div
      onClick={onPress}
      className="carte-piste"
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: actif ? '#f5f9fe' : '#fff',
        borderRadius: 18, padding: 12,
        border: actif ? `1.5px solid ${BLEU}` : '1.5px solid transparent',
        boxShadow: '0 4px 10px rgba(58,74,92,0.06)',
        cursor: 'pointer',
      }}
    >
      {/* pastille play / égaliseur */}
      <div style={{
        width: 42, height: 42, borderRadius: 21, flexShrink: 0,
        background: actif ? BLEU : '#edf2f8',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: actif ? `0 3px 6px rgba(45,87,140,0.30)` : 'none',
      }}>
        {actif && enLecture ? (
          <MiniEgaliseur />
        ) : (
          <svg width="16" height="16" viewBox="0 -960 960 960">
            <path d="M320-200v-560l440 280-440 280Z" fill={actif ? 'white' : BLEU} />
          </svg>
        )}
      </div>

      {/* titre + sheikh + badge série */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <TitreDefilant
          texte={k.titre}
          style={{
            fontSize: 14, fontWeight: 600,
            color: actif ? BLEU : 'var(--texte)',
            marginBottom: 3,
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <p style={{ fontSize: 12, color: 'var(--texte-muted)', margin: 0, flexShrink: 1 }}>{k.sheikh}</p>
          {badge && (
            <span style={{
              fontSize: 10.5, fontWeight: 600,
              padding: '2px 8px', borderRadius: 7,
              background: '#faf3dc', color: '#b8911f',
              whiteSpace: 'nowrap',
            }}>
              {badge}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Khoutbah() {
  const [khoutbahs, setKhoutbahs] = useState<Khoutbah[]>([])
  const [recherche, setRecherche] = useState('')
  const [loading, setLoading] = useState(true)
  const { jouer, piste, enLecture, toggleLecture } = useAudio()

  useEffect(() => {
    supabase.from('khoutbahs').select('*').order('serie').order('numero_serie').order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setKhoutbahs(data); setLoading(false) })
  }, [])

  const filtres = khoutbahs.filter(k =>
    normaliser(k.titre).includes(normaliser(recherche)) ||
    normaliser(k.sheikh).includes(normaliser(recherche)) ||
    (k.serie && normaliser(k.serie).includes(normaliser(recherche)))
  )

  const onPiste = (k: Khoutbah) => {
    if (piste?.id === k.id) { toggleLecture(); return }
    jouer({ id: k.id, titre: k.titre, sheikh: k.sheikh, url: k.url_audio, duree: k.duree, href: '/khoutbah' })
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--fond-creme)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* ── Héros ── */}
      <div style={{ position: 'relative', borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${BG_TOP} 0%, ${BG_MID} 55%, ${BG_BOT} 100%)` }} />
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(140,180,230,0.12)', top: -140, right: -100 }} />
        <div style={{ position: 'absolute', width: 220, height: 220, borderRadius: '50%', background: 'rgba(214,173,58,0.06)', bottom: -80, left: -70 }} />

        <div style={{ position: 'relative', maxWidth: 640, margin: '0 auto', padding: '22px 24px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          {/* eyebrow + titre */}
          <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(214,173,58,0.16)', borderRadius: 999, padding: '5px 13px' }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.8px', color: OR, textTransform: 'uppercase', lineHeight: 1 }}>Médiathèque</span>
          </div>
          <h1 style={{ fontSize: 21, fontWeight: 700, color: '#fff', margin: 0, textAlign: 'center' }}>Khoutbah</h1>

          {/* barre de recherche en verre */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: W10, border: `1px solid ${W14}`, borderRadius: 999, padding: '10px 16px', width: '100%' }}>
            <Search size={17} color={W55} strokeWidth={2} style={{ flexShrink: 0 }} />
            <input
              value={recherche}
              onChange={e => setRecherche(e.target.value)}
              placeholder="Rechercher..."
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                fontSize: 14, fontFamily: 'inherit', color: '#fff',
              }}
            />
            {recherche && (
              <button onClick={() => setRecherche('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                <X size={15} color={W70} strokeWidth={2} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Liste ── */}
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '20px 24px 72px', flex: 1, width: '100%' }}>
        {loading ? (
          <Squelettes />
        ) : filtres.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '56px 0' }}>
            <div style={{ width: 64, height: 64, borderRadius: 32, background: '#e4ebf3', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Search size={26} color="#9aa8b8" strokeWidth={2} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--texte-muted)', textAlign: 'center' }}>
              {recherche ? `Aucune khoutbah pour « ${recherche} »` : 'Les khoutbahs arrivent bientôt'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtres.map((k, i) => (
              <div key={k.id} className="kh-item" style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}>
                <CarteKhoutbah
                  k={k}
                  actif={piste?.id === k.id}
                  enLecture={enLecture}
                  onPress={() => onPiste(k)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />

      <style>{`
        .carte-piste { transition: box-shadow 0.15s, transform 0.1s; }
        .carte-piste:hover { box-shadow: 0 6px 18px rgba(58,74,92,0.10); transform: translateY(-1px); }
        .kh-item { animation: khFadeUp 0.35s ease both; }
        @keyframes khFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .squelette {
          background: #dde3ea;
          animation: sqPulse 1.4s ease-in-out infinite;
        }
        @keyframes sqPulse {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.65; }
        }
        input::placeholder { color: ${W55}; }
      `}</style>
    </main>
  )
}

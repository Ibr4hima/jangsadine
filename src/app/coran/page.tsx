'use client'
import FondAurore from '@/components/FondAurore'
import { QURAN_ICON_URI } from '@/lib/quranIcon'
import divisionsHafs from '@/data/quran/divisions.json'
import divisionsQaloon from '@/data/quran/qaloon_divisions.json'
import souratesQaloon from '@/data/quran/qaloon_sourates.json'
import souratesHafs from '@/data/quran/sourates.json'
import divisionsWarsh from '@/data/quran/warsh_divisions.json'
import souratesWarsh from '@/data/quran/warsh_sourates.json'
import Link from 'next/link'
import { useEffect, useState } from 'react'

// ─── palette héros (identique à l'accueil) ────────────────────
const BG_TOP = '#3d6ba3'
const BG_MID = '#2d578c'
const BG_BOT = '#234a7a'
const OR = '#d6ad3a'
const BLEU = '#2d578c'
const W12 = 'rgba(255,255,255,0.12)'

type Sourate = { index: number; nom: string; nomAr: string; versets: number; page: number }
type Divisions = { juz: Record<string, number> }

// Listes de sourates et divisions par riwaya (versets, pages et débuts de
// juz diffèrent entre Hafs et Warsh)
const souratesParRiwaya: Record<string, Sourate[]> = {
  hafs: souratesHafs as Sourate[],
  warsh: souratesWarsh as Sourate[],
  qaloon: souratesQaloon as Sourate[],
}
const divisionsParRiwaya: Record<string, Divisions> = {
  hafs: divisionsHafs as Divisions,
  warsh: divisionsWarsh as Divisions,
  qaloon: divisionsQaloon as Divisions,
}

// ─── riwayas ──────────────────────────────────────────────────
const RIWAYAS = [
  { id: 'hafs', nom: 'Hafs' },
  { id: 'warsh', nom: 'Warsh' },
  { id: 'qaloon', nom: 'Qaloon' },
] as const

// Débuts des 30 juz : « sora:aya » → n°, triés. Chaque chip ouvre le lecteur
// pile au premier verset du juz (param `verset`).
function construireJuzs(divisions: Divisions) {
  return Object.entries(divisions.juz)
    .map(([cle, n]) => {
      const [sora, aya] = cle.split(':').map(Number)
      return { n, sora, aya }
    })
    .sort((a, b) => a.n - b.n)
}

// ─── badge octogramme ۞ (deux carrés superposés à 45°) ───────
// Clin d'œil au rub-el-hizb du Mushaf : discret, fin, élégant.
function BadgeNumero({ n }: { n: number }) {
  return (
    <div style={{ width: 48, height: 48, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width={48} height={48} viewBox="0 0 48 48" style={{ position: 'absolute', inset: 0 }}>
        <rect x={9.5} y={9.5} width={29} height={29} rx={8}
          fill="rgba(39,76,122,0.05)" stroke="rgba(39,76,122,0.30)" strokeWidth={1.1} />
        <rect x={9.5} y={9.5} width={29} height={29} rx={8}
          fill="rgba(39,76,122,0.03)" stroke="rgba(39,76,122,0.30)" strokeWidth={1.1}
          transform="rotate(45 24 24)" />
      </svg>
      <span style={{ fontSize: 12, fontWeight: 700, color: BLEU, position: 'relative' }}>{n}</span>
    </div>
  )
}

export default function Coran() {
  const [riwaya, setRiwaya] = useState<string>('hafs')
  const [reprise, setReprise] = useState<{ sourate: Sourate; cle: string | null; riwaya: string } | null>(null)

  const sourates = souratesParRiwaya[riwaya] ?? souratesParRiwaya.hafs
  const juzs = construireJuzs(divisionsParRiwaya[riwaya] ?? divisionsParRiwaya.hafs)

  // Riwaya choisie, persistée
  useEffect(() => {
    try {
      const r = localStorage.getItem('jsd_riwaya')
      if (r && RIWAYAS.some(x => x.id === r)) setRiwaya(r)
    } catch { }
  }, [])
  const choisirRiwaya = (id: string) => {
    setRiwaya(id)
    try { localStorage.setItem('jsd_riwaya', id) } catch { }
  }

  // Position exacte de lecture (pour la puce « Reprendre »)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('jsd_reprise_coran')
      if (!raw) return
      const r = JSON.parse(raw) as { sourate: number; cle?: string; riwaya?: string }
      const riw = r.riwaya === 'warsh' || r.riwaya === 'qaloon' ? r.riwaya : 'hafs'
      const s = souratesParRiwaya[riw].find(x => x.index === r.sourate)
      if (s) setReprise({ sourate: s, cle: r.cle ?? null, riwaya: riw })
    } catch { }
  }, [])

  return (
    <main style={{ position: 'fixed', inset: 0, zIndex: 500, height: '100dvh', background: 'var(--fond-creme)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ─── héros bleu ─────────────────────────────────────── */}
      <div style={{ position: 'relative', borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${BG_TOP} 0%, ${BG_MID} 55%, ${BG_BOT} 100%)` }} />
        <FondAurore />

        <div style={{ position: 'relative', maxWidth: 640, margin: '0 auto', padding: 'calc(env(safe-area-inset-top, 0px) + 8px) 24px 16px' }}>
          {/* calligraphie القرآن الكريم — posée en absolu sur le flanc droit,
              du haut du titre jusqu'à la rangée des riwayas */}
          <img
            src={QURAN_ICON_URI}
            alt=""
            aria-hidden
            style={{ position: 'absolute', top: 'calc(env(safe-area-inset-top, 0px) + 6px)', right: 24, width: 96, height: 96, objectFit: 'contain', opacity: 0.95, pointerEvents: 'none' }}
          />

          <div style={{ display: 'flex', alignItems: 'center' }}>
            {/* retour à l'accueil — pastille de verre */}
            <Link href="/" aria-label="Accueil" className="coran-retour" style={{
              width: 46, height: 46, borderRadius: 23, flexShrink: 0,
              background: W12, border: '1px solid rgba(255,255,255,0.28)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginRight: 12,
            }}>
              <svg width={22} height={22} viewBox="0 -960 960 960">
                <path d="M240-200h120v-240h240v240h120v-360L480-740 240-560v360Zm-80 80v-480l320-240 320 240v480H520v-240h-80v240H160Zm320-350Z" fill="#fff" />
              </svg>
            </Link>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', color: OR, textTransform: 'uppercase', margin: '0 0 4px' }}>Lecture</p>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', margin: 0 }}>Coran</h1>
            </div>
          </div>

          {/* sélecteur de riwaya — rangée défilante bord à bord */}
          <div className="chips-scroll" style={{ display: 'flex', alignItems: 'center', overflowX: 'auto', margin: '12px -24px 0', padding: '0 24px' }}>
            {RIWAYAS.map(r => {
              const active = r.id === riwaya
              return (
                <button key={r.id} onClick={() => choisirRiwaya(r.id)} className="coran-chip" style={{
                  flexShrink: 0, padding: '6px 13px', borderRadius: 999, cursor: 'pointer',
                  marginRight: 8,
                  background: active ? '#fff' : W12,
                  border: 'none', fontFamily: 'inherit',
                  fontSize: 11, fontWeight: 600,
                  color: active ? BG_BOT : '#fff',
                }}>
                  {r.nom}
                </button>
              )
            })}
          </div>

          {/* puce « Reprendre » — rouvre pile où on s'était arrêté */}
          {reprise && (
            <Link
              href={`/coran/${reprise.sourate.index}?riwaya=${reprise.riwaya}${reprise.cle ? `&cle=${reprise.cle}` : ''}`}
              className="coran-chip"
              style={{
                display: 'inline-block', background: OR, borderRadius: 999,
                padding: '6px 12px', marginTop: 12,
                fontSize: 11, fontWeight: 600, color: '#1c3d66',
              }}
            >
              Reprendre · {reprise.sourate.nom}  ›
            </Link>
          )}
        </div>
      </div>

      {/* ─── saut rapide par juz (fixe) ─────────────────────── */}
      <div className="chips-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '12px 24px 8px', maxWidth: 688, margin: '0 auto', width: '100%', flexShrink: 0 }}>
        {juzs.map(j => (
          <Link key={j.n} href={`/coran/${j.sora}?riwaya=${riwaya}&juz=${j.n}`} className="coran-chip" style={{
            flexShrink: 0, height: 34, padding: '0 15px', borderRadius: 999,
            background: '#fff', border: '1px solid var(--bordure)',
            display: 'flex', alignItems: 'center',
            fontSize: 12, fontWeight: 600, color: BLEU, whiteSpace: 'nowrap',
          }}>
            Juz {j.n}
          </Link>
        ))}
      </div>

      {/* ─── liste des sourates (seule zone qui défile) ─────── */}
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' as const }}>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '12px 24px calc(env(safe-area-inset-bottom, 0px) + 32px)', width: '100%' }}>
        {sourates.map(s => (
          <Link key={s.index} href={`/coran/${s.index}?riwaya=${riwaya}`} className="carte-sourate" style={{
            display: 'flex', alignItems: 'center',
            background: '#fff', borderRadius: 22,
            padding: '14px 16px 14px 8px', marginBottom: 10,
            boxShadow: '0 4px 12px rgba(42,59,82,0.06)',
            textDecoration: 'none',
          }}>
            <BadgeNumero n={s.index} />
            <div style={{ flex: 1, minWidth: 0, marginLeft: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--texte)', margin: 0 }}>{s.nom}</p>
              <p style={{ fontSize: 11, color: 'var(--texte-muted)', margin: '2px 0 0' }}>{s.versets} versets · Page {s.page}</p>
            </div>
            {/* Nom calligraphique (ligature SuraNames par identifiant) */}
            <span style={{ fontFamily: 'SuraNames', fontSize: 28, color: BG_MID, marginLeft: 8, direction: 'ltr' }}>
              {String(s.index).padStart(3, '0')}
            </span>
          </Link>
        ))}
        </div>
      </div>

      <style>{`
        .chips-scroll::-webkit-scrollbar { display: none; }
        .chips-scroll { scrollbar-width: none; }
        .coran-retour { transition: background 0.15s, transform 0.15s; }
        .coran-retour:hover { background: rgba(255,255,255,0.24); }
        .coran-retour:active { transform: scale(0.88); }
        .coran-chip { transition: transform 0.15s; }
        .coran-chip:active { transform: scale(0.94); }
        .carte-sourate { transition: transform 0.18s cubic-bezier(0.22,1,0.36,1), box-shadow 0.18s; }
        .carte-sourate:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(42,59,82,0.10); }
        .carte-sourate:active { transform: scale(0.97); }
      `}</style>
    </main>
  )
}

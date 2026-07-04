'use client'
import OrnementHero from '@/components/OrnementHero'
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

// ─── fond aurore ──────────────────────────────────────────────
function Aurore() {
  return (
    <>
      <div className="aurore aurore-1" style={{ width: 380, height: 380, background: 'rgb(120,165,220)', top: -160, right: -120 }} />
      <div className="aurore aurore-2" style={{ width: 300, height: 300, background: 'rgb(90,140,200)', bottom: -120, left: -90 }} />
      <div className="aurore aurore-3" style={{ width: 340, height: 340, background: 'rgb(30,64,106)', bottom: -170, right: -80 }} />
    </>
  )
}

// ─── badge octogramme ۞ (deux carrés superposés à 45°) ───────
// Clin d'œil au rub-el-hizb du Mushaf : discret, fin, élégant.
function BadgeNumero({ n }: { n: number }) {
  return (
    <div style={{ width: 44, height: 44, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width={44} height={44} viewBox="0 0 48 48" style={{ position: 'absolute', inset: 0 }}>
        <rect x={9.5} y={9.5} width={29} height={29} rx={8}
          fill="rgba(39,76,122,0.05)" stroke="rgba(39,76,122,0.30)" strokeWidth={1.1} />
        <rect x={9.5} y={9.5} width={29} height={29} rx={8}
          fill="rgba(39,76,122,0.03)" stroke="rgba(39,76,122,0.30)" strokeWidth={1.1}
          transform="rotate(45 24 24)" />
      </svg>
      <span style={{ fontSize: 11.5, fontWeight: 700, color: BG_MID, position: 'relative' }}>{n}</span>
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
      <div style={{ position: 'relative', borderBottomLeftRadius: 26, borderBottomRightRadius: 26, overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(163deg, #45719f 0%, ${BG_MID} 46%, #1a3a63 100%)` }} />
        <Aurore />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(105% 70% at 18% -12%, rgba(190,215,245,0.16), transparent 58%)' }} />
        <OrnementHero taille={190} opacite={0.10} style={{ top: -58, right: -52 }} />
        <OrnementHero taille={120} opacite={0.06} inverse style={{ bottom: -44, left: -34 }} />
        {/* fine ligne lumineuse en pied de héros */}
        <div style={{ position: 'absolute', bottom: 0, left: '12%', right: '12%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)' }} />

        <div style={{ position: 'relative', maxWidth: 640, margin: '0 auto', padding: 'calc(env(safe-area-inset-top, 0px) + 10px) 20px 12px' }}>
          {/* calligraphie القرآن الكريم — flanc droit */}
          <img
            src={QURAN_ICON_URI}
            alt=""
            aria-hidden
            style={{ position: 'absolute', top: 2, right: 18, width: 62, height: 62, objectFit: 'contain', opacity: 0.95, pointerEvents: 'none' }}
          />

          <div>
            <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '2.2px', color: OR, textTransform: 'uppercase', margin: '0 0 2px' }}>Lecture</p>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: 0 }}>Coran</h1>
          </div>

          {/* riwayas + reprise sur une seule rangée */}
          <div className="chips-scroll" style={{ display: 'flex', alignItems: 'center', gap: 7, overflowX: 'auto', margin: '10px -20px 0', padding: '0 20px' }}>
            {RIWAYAS.map(r => {
              const active = r.id === riwaya
              return (
                <button key={r.id} onClick={() => choisirRiwaya(r.id)} className="coran-chip" style={{
                  flexShrink: 0, padding: '5px 12px', borderRadius: 999, cursor: 'pointer',
                  background: active ? '#fff' : W12,
                  border: 'none', fontFamily: 'inherit',
                  fontSize: 11.5, fontWeight: 600,
                  color: active ? BG_BOT : '#fff',
                }}>
                  {r.nom}
                </button>
              )
            })}
            {reprise && (
              <Link
                href={`/coran/${reprise.sourate.index}?riwaya=${reprise.riwaya}${reprise.cle ? `&cle=${reprise.cle}` : ''}`}
                className="coran-chip"
                style={{
                  flexShrink: 0, background: OR, borderRadius: 999,
                  padding: '5px 11px', marginLeft: 2,
                  fontSize: 11.5, fontWeight: 600, color: '#1c3d66', whiteSpace: 'nowrap',
                }}
              >
                Reprendre · {reprise.sourate.nom}  ›
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ─── saut rapide par juz (fixe) ─────────────────────── */}
      <div className="chips-scroll" style={{ display: 'flex', gap: 7, overflowX: 'auto', padding: '10px 20px 8px', maxWidth: 688, margin: '0 auto', width: '100%', flexShrink: 0 }}>
        {juzs.map(j => (
          <Link key={j.n} href={`/coran/${j.sora}?riwaya=${riwaya}&juz=${j.n}`} className="coran-chip" style={{
            flexShrink: 0, height: 29, padding: '0 13px', borderRadius: 999,
            background: '#fff', border: '1px solid var(--bordure)',
            display: 'flex', alignItems: 'center',
            fontSize: 11.5, fontWeight: 600, color: BG_MID, whiteSpace: 'nowrap',
          }}>
            Juz {j.n}
          </Link>
        ))}
      </div>

      {/* ─── liste des sourates (seule zone qui défile) ─────── */}
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' as const }}>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '2px 20px calc(env(safe-area-inset-bottom, 0px) + 24px)', width: '100%' }}>
        {sourates.map(s => (
          <Link key={s.index} href={`/coran/${s.index}?riwaya=${riwaya}`} className="carte-sourate" style={{
            display: 'flex', alignItems: 'center',
            background: '#fff', borderRadius: 18,
            padding: '8px 14px 8px 6px', marginBottom: 8,
            boxShadow: '0 4px 12px rgba(42,59,82,0.06)',
            textDecoration: 'none',
          }}>
            <BadgeNumero n={s.index} />
            <div style={{ flex: 1, minWidth: 0, marginLeft: 4 }}>
              <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--texte)', margin: 0 }}>{s.nom}</p>
              <p style={{ fontSize: 10.5, color: 'var(--texte-muted)', margin: '2px 0 0' }}>{s.versets} versets · Page {s.page}</p>
            </div>
            {/* Nom calligraphique (ligature SuraNames par identifiant) */}
            <span style={{ fontFamily: 'SuraNames', fontSize: 23, color: BG_MID, marginLeft: 8, direction: 'ltr' }}>
              {String(s.index).padStart(3, '0')}
            </span>
          </Link>
        ))}
        </div>
      </div>

      <style>{`
        .aurore { position: absolute; border-radius: 50%; filter: blur(18px); pointer-events: none; will-change: transform, opacity; }
        .aurore-1 { animation: aurore1 17s ease-in-out infinite alternate; }
        .aurore-2 { animation: aurore2 23s ease-in-out infinite alternate; }
        .aurore-3 { animation: aurore3 29s ease-in-out infinite alternate; }
        @keyframes aurore1 { from { opacity: 0.18; transform: none; } to { opacity: 0.30; transform: translate(55px, 38px) scale(1.12); } }
        @keyframes aurore2 { from { opacity: 0.14; transform: none; } to { opacity: 0.26; transform: translate(-48px, -30px) scale(1.10); } }
        @keyframes aurore3 { from { opacity: 0.30; transform: none; } to { opacity: 0.46; transform: translateX(34px) scale(1.08); } }
        .chips-scroll::-webkit-scrollbar { display: none; }
        .chips-scroll { scrollbar-width: none; }
        .coran-chip { transition: transform 0.15s; }
        .coran-chip:active { transform: scale(0.94); }
        .carte-sourate { transition: transform 0.18s cubic-bezier(0.22,1,0.36,1), box-shadow 0.18s; }
        .carte-sourate:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(42,59,82,0.10); }
        .carte-sourate:active { transform: scale(0.97); }
        @media (prefers-reduced-motion: reduce) {
          .aurore-1, .aurore-2, .aurore-3 { animation: none; }
        }
      `}</style>
    </main>
  )
}

'use client'
import Footer from '@/components/Footer'
import HeroDetail from '@/components/HeroDetail'
import Navbar from '@/components/Navbar'
import TitreDefilant from '@/components/TitreDefilant'
import { couleurBg, couleurTxt } from '@/lib/categories'
import { supabase } from '@/lib/supabase'
import { Search, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const OR = '#d6ad3a'
const BLEU = '#2d578c'
const W14 = 'rgba(255,255,255,0.14)'
const W55 = 'rgba(255,255,255,0.55)'
const W70 = 'rgba(255,255,255,0.70)'
const W10 = 'rgba(255,255,255,0.10)'

function normaliser(texte: string): string {
  return texte
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[ḍḏṭṯṣṡẓḥḫġ]/g, (c) => ({ ḍ: 'd', ḏ: 'd', ṭ: 't', ṯ: 't', ṣ: 's', ṡ: 's', ẓ: 'z', ḥ: 'h', ḫ: 'h', ġ: 'g' }[c] || c))
    .replace(/[āīūôê]/g, (c) => ({ ā: 'a', ī: 'i', ū: 'u', ô: 'o', ê: 'e' }[c] || c))
}

type Categorie = { id: string; nom: string; slug: string; ordre: number }
type Livre = { id: string; titre: string; categorie_id: string; titre_arabe?: string; sheikh?: string | null }

export default function Audio() {
  const [categories, setCategories] = useState<Categorie[]>([])
  const [livres, setLivres] = useState<Livre[]>([])
  const [catActive, setCatActive] = useState('toutes')
  const [loading, setLoading] = useState(true)
  const [recherche, setRecherche] = useState('')
  const [coursSerieUniqueMap, setCoursSerieUniqueMap] = useState<Record<string, string>>({})

  useEffect(() => {
    const saved = sessionStorage.getItem('categorie:/audio')
    if (saved) queueMicrotask(() => setCatActive(saved))
  }, [])

  useEffect(() => {
    async function charger() {
      const { data: cats } = await supabase.from('categories').select('*').order('ordre')
      const { data: livresList } = await supabase.from('livres').select('*').order('created_at')
      if (cats) setCategories(cats)
      if (livresList) setLivres(livresList)
      const serieMap: Record<string, string> = {}
      const { data: coursAvecId } = await supabase.from('cours').select('id, livre_id, serie_unique').eq('serie_unique', true)
      if (coursAvecId) coursAvecId.forEach(c => { if (c.livre_id) serieMap[c.livre_id] = c.id })
      setCoursSerieUniqueMap(serieMap)
      setLoading(false)
    }
    charger()
  }, [])

  useEffect(() => {
    if (loading) return
    const saved = sessionStorage.getItem('scroll:/audio')
    if (!saved) return
    sessionStorage.removeItem('scroll:/audio')
    requestAnimationFrame(() => window.scrollTo(0, parseInt(saved, 10)))
  }, [loading])

  const livresFiltres = livres.filter(l => {
    const cat = categories.find(c => c.id === l.categorie_id)
    const matchCategorie = catActive === 'toutes' || cat?.slug === catActive
    const matchRecherche = recherche === '' ||
      normaliser(l.titre).includes(normaliser(recherche)) ||
      (l.titre_arabe ? l.titre_arabe.includes(recherche) : false)
    return matchCategorie && matchRecherche
  })

  return (
    <main style={{ minHeight: '100vh', background: 'var(--fond-creme)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* ── Héros ── */}
      <HeroDetail>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(214,173,58,0.16)', borderRadius: 999, padding: '5px 13px' }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.8px', color: OR, textTransform: 'uppercase', lineHeight: 1 }}>Médiathèque</span>
          </div>
          <h1 style={{ fontSize: 21, fontWeight: 700, color: '#fff', margin: 0, textAlign: 'center' }}>Cours audio</h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: W10, border: `1px solid ${W14}`, borderRadius: 999, padding: '10px 16px', width: '100%' }}>
            <Search size={17} color={W55} strokeWidth={2} style={{ flexShrink: 0 }} />
            <input value={recherche} onChange={e => setRecherche(e.target.value)} placeholder="Rechercher..."
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 14, fontFamily: 'inherit', color: '#fff' }} />
            {recherche && (
              <button onClick={() => setRecherche('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                <X size={15} color={W70} strokeWidth={2} />
              </button>
            )}
          </div>
        </div>
      </HeroDetail>

      {/* ── Chips catégories ── */}
      <div className="chips-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '12px 24px 4px', maxWidth: 688, margin: '0 auto', width: '100%' }}>
        {[{ key: 'toutes', label: 'Tous', bg: BLEU, txt: '#fff' },
        ...categories.map(c => ({ key: c.slug, label: c.nom, bg: couleurBg[c.nom] || BLEU, txt: couleurTxt[c.nom] || '#fff' }))].map(c => {
          const estActif = catActive === c.key
          return (
            <button
              key={c.key}
              onClick={() => { setCatActive(c.key); sessionStorage.setItem('categorie:/audio', c.key) }}
              style={{
                flexShrink: 0, padding: '8px 14px', borderRadius: 999, cursor: 'pointer',
                background: estActif ? c.bg : '#fff',
                border: `1px solid ${estActif ? c.txt : '#e2e7ee'}`,
                color: estActif ? c.txt : '#6b7686',
                fontFamily: 'inherit', fontSize: 12, fontWeight: estActif ? 600 : 500, whiteSpace: 'nowrap',
              }}
            >
              {c.label}
            </button>
          )
        })}
      </div>

      {/* ── Liste des livres / cours ── */}
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '12px 24px 80px', flex: 1, width: '100%' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="squelette" style={{ height: 86, borderRadius: 18 }} />)}
          </div>
        ) : livresFiltres.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '56px 0' }}>
            <div style={{ width: 64, height: 64, borderRadius: 32, background: '#e4ebf3', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Search size={26} color="#9aa8b8" strokeWidth={2} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--texte-muted)' }}>Aucun résultat trouvé</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {livresFiltres.map((l, i) => {
              const cat = categories.find(c => c.id === l.categorie_id)
              const nomCat = cat?.nom ?? ''
              const accent = couleurTxt[nomCat] ?? BLEU
              return (
                <Link
                  key={l.id}
                  href={coursSerieUniqueMap[l.id] ? `/audio/${coursSerieUniqueMap[l.id]}` : `/audio/livre/${l.id}`}
                  onClick={() => sessionStorage.setItem('scroll:/audio', String(window.scrollY))}
                  className="carte-piste appear"
                  style={{
                    position: 'relative', display: 'flex', flexDirection: 'column', gap: 6,
                    background: '#fff', borderRadius: 18, padding: '12px 16px 12px 20px',
                    boxShadow: '0 4px 10px rgba(58,74,92,0.06)', overflow: 'hidden', textDecoration: 'none',
                    animationDelay: `${Math.min(i, 8) * 45}ms`,
                  }}
                >
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: accent, opacity: 0.85 }} />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    {nomCat ? (
                      <span style={{ background: couleurBg[nomCat] ?? '#f0f0f0', color: accent, fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999 }}>{nomCat}</span>
                    ) : <span />}
                    {l.titre_arabe ? (
                      <span style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", direction: 'rtl', fontSize: 12, color: '#9aa4b2', maxWidth: '50%', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{l.titre_arabe}</span>
                    ) : null}
                  </div>
                  <TitreDefilant texte={l.titre} style={{ fontSize: 15, fontWeight: 700, color: 'var(--texte)' }} />
                  {l.sheikh ? (
                    <p style={{ fontSize: 12, color: 'var(--texte-muted)', margin: 0 }}>{l.sheikh}</p>
                  ) : null}
                </Link>
              )
            })}
          </div>
        )}
      </div>

      <Footer />

      <style>{`
        .chips-scroll::-webkit-scrollbar { display: none; }
        .chips-scroll { scrollbar-width: none; }
        .carte-piste { transition: box-shadow 0.15s, transform 0.1s; }
        .carte-piste:hover { box-shadow: 0 6px 18px rgba(58,74,92,0.10); transform: translateY(-1px); }
        .appear { animation: appearUp 0.35s ease both; }
        @keyframes appearUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .squelette { background: #dde3ea; animation: sqPulse 1.4s ease-in-out infinite; }
        @keyframes sqPulse { 0%, 100% { opacity: 0.35; } 50% { opacity: 0.65; } }
        input::placeholder { color: ${W55}; }
      `}</style>
    </main>
  )
}

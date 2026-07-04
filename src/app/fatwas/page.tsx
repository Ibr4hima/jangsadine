'use client'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import MiniEgaliseur from '@/components/MiniEgaliseur'
import { useAudio } from '@/contexts/AudioContext'
import { supabase } from '@/lib/supabase'
import { ListFilter, Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'

type Fatwa = { id: string; question: string; sheikh: string; categorie: string; url_audio: string; duree: string }
type Categorie = { nom: string; couleur: string; epingle: boolean }

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

// ─── Pastille play / pause / égaliseur ───────────────────────
function PastillePlay({ actif, enLecture, taille = 34 }: { actif: boolean, enLecture: boolean, taille?: number }) {
  return (
    <div style={{
      width: taille, height: taille, borderRadius: taille / 2, flexShrink: 0,
      background: actif ? BLEU : '#edf2f8',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: actif ? '0 3px 6px rgba(45,87,140,0.30)' : 'none',
    }}>
      {actif && enLecture ? (
        <MiniEgaliseur />
      ) : (
        <svg width="15" height="15" viewBox="0 -960 960 960">
          <path d="M320-200v-560l440 280-440 280Z" fill={actif ? 'white' : BLEU} />
        </svg>
      )}
    </div>
  )
}

// ─── Squelette de chargement ──────────────────────────────────
function Squelettes({ n = 4 }: { n?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="squelette" style={{ height: 92, borderRadius: 18 }} />
      ))}
    </div>
  )
}

export default function Fatwas() {
  const [fatwas, setFatwas] = useState<Fatwa[]>([])
  const [categories, setCategories] = useState<Categorie[]>([])
  const [sheikhs, setSheikhs] = useState<string[]>([])
  const [catActive, setCatActive] = useState('toutes')
  const [sheikhsActifs, setSheikhsActifs] = useState<string[]>([])
  const [showSheikhPicker, setShowSheikhPicker] = useState(false)
  const [recherche, setRecherche] = useState('')
  const [loading, setLoading] = useState(true)
  const { jouer, piste, enLecture, toggleLecture } = useAudio()

  useEffect(() => {
    async function charger() {
      const [{ data: fatwasData }, { data: catsData }, { data: sheikhsData }] = await Promise.all([
        supabase.from('fatwas').select('*').order('categorie').order('created_at'),
        supabase.from('fatwas_categories').select('nom, couleur, epingle').order('nom'),
        supabase.from('fatwas_sheikhs').select('nom').order('nom'),
      ])
      if (fatwasData) setFatwas(fatwasData)
      if (catsData) {
        const triees = [...catsData].sort((a, b) => {
          if (a.epingle && !b.epingle) return -1
          if (!a.epingle && b.epingle) return 1
          return 0
        })
        setCategories(triees)
      }
      if (sheikhsData) setSheikhs(sheikhsData.map(s => s.nom))
      setLoading(false)
    }
    charger()
  }, [])

  const filtres = fatwas.filter(f => {
    const matchCat = catActive === 'toutes' || f.categorie === catActive
    const matchSheikh = sheikhsActifs.length === 0 || sheikhsActifs.includes(f.sheikh)
    const matchRecherche = recherche === '' ||
      normaliser(f.question).includes(normaliser(recherche)) ||
      normaliser(f.sheikh).includes(normaliser(recherche))
    return matchCat && matchSheikh && matchRecherche
  })

  // Groupes par catégorie (épinglées en premier)
  const groupes: Record<string, Fatwa[]> = {}
  filtres.forEach(f => {
    if (!groupes[f.categorie]) groupes[f.categorie] = []
    groupes[f.categorie].push(f)
  })
  const groupesTries = Object.entries(groupes).sort(([a], [b]) => {
    const catA = categories.find(c => c.nom === a)
    const catB = categories.find(c => c.nom === b)
    if (catA?.epingle && !catB?.epingle) return -1
    if (!catA?.epingle && catB?.epingle) return 1
    return 0
  })

  const onPiste = (f: Fatwa) => {
    if (piste?.id === f.id) { toggleLecture(); return }
    jouer({ id: f.id, titre: f.question, sheikh: f.sheikh, url: f.url_audio, duree: f.duree, href: '/fatwas' })
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
          <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(214,173,58,0.16)', borderRadius: 999, padding: '5px 13px' }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.8px', color: OR, textTransform: 'uppercase', lineHeight: 1 }}>Médiathèque</span>
          </div>
          <h1 style={{ fontSize: 21, fontWeight: 700, color: '#fff', margin: 0, textAlign: 'center' }}>Fatwas</h1>

          {/* barre de recherche en verre */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: W10, border: `1px solid ${W14}`, borderRadius: 999, padding: '10px 16px', width: '100%' }}>
            <Search size={17} color={W55} strokeWidth={2} style={{ flexShrink: 0 }} />
            <input
              value={recherche}
              onChange={e => setRecherche(e.target.value)}
              placeholder="Rechercher..."
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 14, fontFamily: 'inherit', color: '#fff' }}
            />
            {recherche && (
              <button onClick={() => setRecherche('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                <X size={15} color={W70} strokeWidth={2} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Chips de filtres ── */}
      <div className="chips-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '12px 24px 4px', maxWidth: 688, margin: '0 auto', width: '100%' }}>
        {/* bouton sheikh */}
        <button
          onClick={() => setShowSheikhPicker(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
            padding: '8px 12px', borderRadius: 999, cursor: 'pointer',
            background: sheikhsActifs.length > 0 ? OR : '#fff',
            border: `1px solid ${sheikhsActifs.length > 0 ? OR : '#e2e7ee'}`,
            color: sheikhsActifs.length > 0 ? '#fff' : '#6b7686',
            fontFamily: 'inherit', fontSize: 12, fontWeight: 500,
          }}
        >
          <ListFilter size={15} color={sheikhsActifs.length > 0 ? '#fff' : '#6b7686'} strokeWidth={2} />
          Sheikh{sheikhsActifs.length > 0 ? ` · ${sheikhsActifs.length}` : ''}
        </button>

        {/* Toutes + catégories */}
        {[{ key: 'toutes', label: 'Toutes', bg: BLEU, txt: '#fff' },
        ...categories.map(c => ({ key: c.nom, label: c.nom, bg: c.couleur + '22', txt: c.couleur }))].map(c => {
          const estActif = catActive === c.key
          return (
            <button
              key={c.key}
              onClick={() => setCatActive(c.key)}
              style={{
                flexShrink: 0, padding: '8px 14px', borderRadius: 999, cursor: 'pointer',
                background: estActif ? c.bg : '#fff',
                border: `1px solid ${estActif ? c.txt : '#e2e7ee'}`,
                color: estActif ? c.txt : '#6b7686',
                fontFamily: 'inherit', fontSize: 12, fontWeight: estActif ? 600 : 500,
                whiteSpace: 'nowrap',
              }}
            >
              {c.label}
            </button>
          )
        })}
      </div>

      {/* ── Contenu ── */}
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '12px 24px 80px', flex: 1, width: '100%' }}>
        {loading ? (
          <Squelettes />
        ) : filtres.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '56px 0' }}>
            <div style={{ width: 64, height: 64, borderRadius: 32, background: '#e4ebf3', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Search size={26} color="#9aa8b8" strokeWidth={2} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--texte-muted)', textAlign: 'center' }}>Aucune fatwa trouvée</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {groupesTries.map(([categorie, items]) => {
              const accent = categories.find(c => c.nom === categorie)?.couleur ?? '#6b7686'
              return (
                <div key={categorie}>
                  {/* en-tête de groupe */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, paddingLeft: 2 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 4, background: accent }} />
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: accent }}>{categorie}</span>
                    <span style={{ fontSize: 11, fontWeight: 500, color: '#aab4c0' }}>{items.length}</span>
                    <div style={{ flex: 1, height: 1, background: '#e6eaf0' }} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {items.map((f, i) => {
                      const actif = piste?.id === f.id
                      return (
                        <div
                          key={f.id}
                          onClick={() => onPiste(f)}
                          className="carte-piste fatwa-item"
                          style={{
                            background: actif ? '#f5f9fe' : '#fff',
                            borderRadius: 18, padding: 12,
                            border: actif ? `1.5px solid ${BLEU}` : '1.5px solid transparent',
                            boxShadow: '0 4px 10px rgba(58,74,92,0.06)',
                            cursor: 'pointer',
                            animationDelay: `${Math.min(i, 8) * 45}ms`,
                          }}
                        >
                          <p style={{
                            fontSize: 14, fontWeight: 600, lineHeight: 1.55, margin: '0 0 8px',
                            color: actif ? BLEU : 'var(--texte)',
                          }}>
                            {f.question}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <PastillePlay actif={actif} enLecture={enLecture} taille={34} />
                            <span style={{ flex: 1, fontSize: 12, fontWeight: 500, color: actif ? BLEU : '#8a94a2' }}>{f.sheikh}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Footer />

      {/* ── Modale filtre sheikh (bottom-sheet, comme l'app) ── */}
      {showSheikhPicker && (
        <div
          onClick={() => setShowSheikhPicker(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(13,27,46,0.45)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="sheet-sheikh"
            style={{
              background: '#fff', width: '100%', maxWidth: 520,
              borderTopLeftRadius: 28, borderTopRightRadius: 28,
              padding: '24px 24px 40px',
            }}
          >
            <div style={{ width: 40, height: 4.5, borderRadius: 3, background: '#dde3ea', margin: '0 auto 24px' }} />
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--texte)', margin: '0 0 2px' }}>Filtrer par sheikh</h2>
            <p style={{ fontSize: 12, color: 'var(--texte-muted)', margin: '0 0 16px' }}>Sélectionnez un ou plusieurs intervenants</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {sheikhs.map(s => {
                const actif = sheikhsActifs.includes(s)
                return (
                  <div
                    key={s}
                    onClick={() => setSheikhsActifs(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                      padding: 12, borderRadius: 16,
                      background: actif ? '#faf3dc' : '#f5f6f8',
                      border: `1px solid ${actif ? OR : 'transparent'}`,
                    }}
                  >
                    <div style={{
                      width: 22, height: 22, borderRadius: 7, flexShrink: 0,
                      border: `2px solid ${actif ? OR : '#c4ccd6'}`,
                      background: actif ? OR : '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {actif && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                      )}
                    </div>
                    <span style={{ flex: 1, fontSize: 14, fontWeight: actif ? 600 : 400, color: 'var(--texte)' }}>{s}</span>
                  </div>
                )
              })}
            </div>

            {sheikhsActifs.length > 0 && (
              <button
                onClick={() => setSheikhsActifs([])}
                style={{ width: '100%', marginTop: 12, padding: 10, borderRadius: 14, border: 'none', background: '#f0f2f5', color: '#6b7686', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Effacer la sélection
              </button>
            )}
          </div>
        </div>
      )}

      <style>{`
        .chips-scroll::-webkit-scrollbar { display: none; }
        .chips-scroll { scrollbar-width: none; }
        .carte-piste { transition: box-shadow 0.15s, transform 0.1s; }
        .carte-piste:hover { box-shadow: 0 6px 18px rgba(58,74,92,0.10); transform: translateY(-1px); }
        .fatwa-item { animation: fatwaFadeUp 0.35s ease both; }
        @keyframes fatwaFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .sheet-sheikh { animation: sheetUp 0.28s cubic-bezier(0.22,1,0.36,1) both; }
        @keyframes sheetUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        .squelette { background: #dde3ea; animation: sqPulse 1.4s ease-in-out infinite; }
        @keyframes sqPulse { 0%, 100% { opacity: 0.35; } 50% { opacity: 0.65; } }
        input::placeholder { color: ${W55}; }
      `}</style>
    </main>
  )
}

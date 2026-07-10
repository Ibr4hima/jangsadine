'use client'
import FondAurore from '@/components/FondAurore'
import Footer from '@/components/Footer'
import MiniEgaliseur from '@/components/MiniEgaliseur'
import Navbar from '@/components/Navbar'
import TitreDefilant from '@/components/TitreDefilant'
import { useAudio } from '@/contexts/AudioContext'
import { supabase } from '@/lib/supabase'
import { Search, X } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

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
  return (t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

type Livre = { id: string; titre: string; titre_arabe: string | null; categorie_id: string | null }
type Cat = { id: string; nom: string }
type Audio = { id: string; titre: string; sheikh: string; url_audio: string; duree: string; serie?: string | null; numero_serie?: number | null }
type Fatwa = { id: string; question: string; sheikh: string; url_audio: string; duree: string }

// pastille play / égaliseur
function Pastille({ actif, enLecture, note }: { actif: boolean; enLecture: boolean; note?: boolean }) {
  return (
    <div style={{ width: 42, height: 42, borderRadius: 21, flexShrink: 0, background: actif ? BLEU : '#edf2f8', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: actif ? '0 3px 6px rgba(45,87,140,0.30)' : 'none' }}>
      {actif && enLecture
        ? <MiniEgaliseur />
        : note
          ? <svg width="18" height="18" viewBox="0 -960 960 960"><path d="M400-120q-66 0-113-47t-47-113q0-66 47-113t113-47q23 0 42.5 5.5T480-460v-380h240v120H560v400q0 66-47 113t-113 47Z" fill={actif ? '#fff' : BLEU} /></svg>
          : <svg width="16" height="16" viewBox="0 -960 960 960"><path d="M320-200v-560l440 280-440 280Z" fill={actif ? '#fff' : BLEU} /></svg>}
    </div>
  )
}

function EnTeteGroupe({ label, n }: { label: string; n: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0 10px' }}>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.6px', color: OR, textTransform: 'uppercase' }}>{label}</span>
      <span style={{ fontSize: 11, fontWeight: 600, color: '#aab4c0' }}>{n}</span>
      <div style={{ flex: 1, height: 1, background: '#e6eaf0' }} />
    </div>
  )
}

function RechercheInner() {
  const sp = useSearchParams()
  const [q, setQ] = useState(sp.get('q') ?? '')
  const [loading, setLoading] = useState(true)
  const { jouer, piste, enLecture, toggleLecture } = useAudio()

  const [livres, setLivres] = useState<Livre[]>([])
  const [cats, setCats] = useState<Cat[]>([])
  const [serieMap, setSerieMap] = useState<Record<string, string>>({})
  const [confs, setConfs] = useState<Audio[]>([])
  const [khs, setKhs] = useState<Audio[]>([])
  const [fatwas, setFatwas] = useState<Fatwa[]>([])

  useEffect(() => {
    Promise.all([
      supabase.from('livres').select('id, titre, titre_arabe, categorie_id'),
      supabase.from('categories').select('id, nom'),
      supabase.from('cours').select('id, livre_id, serie_unique').eq('serie_unique', true),
      supabase.from('conferences').select('id, titre, sheikh, url_audio, duree'),
      supabase.from('khoutbahs').select('id, titre, sheikh, url_audio, duree, serie, numero_serie'),
      supabase.from('fatwas').select('id, question, sheikh, url_audio, duree'),
    ]).then(([l, c, s, cf, k, f]) => {
      if (l.data) setLivres(l.data)
      if (c.data) setCats(c.data)
      if (s.data) { const m: Record<string, string> = {}; s.data.forEach((x: { id: string; livre_id: string | null }) => { if (x.livre_id) m[x.livre_id] = x.id }); setSerieMap(m) }
      if (cf.data) setConfs(cf.data)
      if (k.data) setKhs(k.data)
      if (f.data) setFatwas(f.data)
      setLoading(false)
    })
  }, [])

  const ql = normaliser(q.trim())
  const has = ql.length > 0

  const livresF = has ? livres.filter(l => normaliser(l.titre).includes(ql) || (l.titre_arabe ? l.titre_arabe.includes(q.trim()) : false)) : []
  const confsF = has ? confs.filter(c => normaliser(c.titre).includes(ql) || normaliser(c.sheikh).includes(ql)) : []
  const khsF = has ? khs.filter(k => normaliser(k.titre).includes(ql) || normaliser(k.sheikh).includes(ql) || (k.serie ? normaliser(k.serie).includes(ql) : false)) : []
  const fatwasF = has ? fatwas.filter(f => normaliser(f.question).includes(ql) || normaliser(f.sheikh).includes(ql)) : []
  const total = livresF.length + confsF.length + khsF.length + fatwasF.length

  const jouerAudio = (a: Audio | Fatwa, href: string, titre: string, sheikh: string) => {
    if (piste?.id === a.id) { toggleLecture(); return }
    jouer({ id: a.id, titre, sheikh, url: a.url_audio, duree: a.duree, href })
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--fond-creme)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* ── Héros ── */}
      <div style={{ position: 'relative', borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${BG_TOP} 0%, ${BG_MID} 55%, ${BG_BOT} 100%)` }} />
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(140,180,230,0.12)', top: -140, right: -100 }} />
        <div style={{ position: 'relative', maxWidth: 640, margin: '0 auto', padding: '22px 24px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(214,173,58,0.16)', borderRadius: 999, padding: '5px 13px' }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.8px', color: OR, textTransform: 'uppercase', lineHeight: 1 }}>Recherche</span>
          </div>
          <h1 style={{ fontSize: 21, fontWeight: 700, color: '#fff', margin: 0, textAlign: 'center' }}>Tout le contenu</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: W10, border: `1px solid ${W14}`, borderRadius: 999, padding: '12px 16px', width: '100%' }}>
            <Search size={18} color={W55} strokeWidth={2} style={{ flexShrink: 0 }} />
            <input
              autoFocus
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Rechercher..."
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 15, fontFamily: 'inherit', color: '#fff' }}
            />
            {q && (
              <button onClick={() => setQ('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                <X size={16} color={W70} strokeWidth={2} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Résultats ── */}
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '20px 24px 72px', flex: 1, width: '100%' }}>
        {!has ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0' }}>
            <div style={{ width: 64, height: 64, borderRadius: 32, background: '#e4ebf3', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Search size={26} color="#9aa8b8" strokeWidth={2} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--texte-muted)' }}>Aucun résultat</p>
          </div>
        ) : loading ? (
          <p style={{ textAlign: 'center', padding: '48px 0', fontSize: 14, color: 'var(--texte-muted)' }}>Recherche…</p>
        ) : total === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0' }}>
            <div style={{ width: 64, height: 64, borderRadius: 32, background: '#e4ebf3', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Search size={26} color="#9aa8b8" strokeWidth={2} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--texte-muted)' }}>Aucun résultat pour « {q.trim()} »</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            {/* Cours */}
            {livresF.length > 0 && (
              <div>
                <EnTeteGroupe label="Cours" n={livresF.length} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {livresF.map(l => {
                    const nomCat = cats.find(c => c.id === l.categorie_id)?.nom ?? ''
                    return (
                      <Link key={l.id} href={serieMap[l.id] ? `/audio/${serieMap[l.id]}` : `/audio/livre/${l.id}`} className="carte-piste" style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#fff', borderRadius: 18, padding: 12, boxShadow: '0 4px 10px rgba(58,74,92,0.06)', textDecoration: 'none' }}>
                        <Pastille actif={false} enLecture={false} note />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <TitreDefilant texte={l.titre} style={{ fontSize: 14, fontWeight: 600, color: 'var(--texte)' }} />
                          {nomCat && <p style={{ fontSize: 12, color: 'var(--texte-muted)', margin: '3px 0 0' }}>{nomCat}</p>}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Conférences */}
            {confsF.length > 0 && (
              <div>
                <EnTeteGroupe label="Conférences" n={confsF.length} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {confsF.map(c => {
                    const actif = piste?.id === c.id
                    return (
                      <div key={c.id} onClick={() => jouerAudio(c, '/conferences', c.titre, c.sheikh)} className="carte-piste" style={{ display: 'flex', alignItems: 'center', gap: 14, background: actif ? '#f5f9fe' : '#fff', borderRadius: 18, padding: 12, border: actif ? `1.5px solid ${BLEU}` : '1.5px solid transparent', boxShadow: '0 4px 10px rgba(58,74,92,0.06)', cursor: 'pointer' }}>
                        <Pastille actif={actif} enLecture={enLecture} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <TitreDefilant texte={c.titre} style={{ fontSize: 14, fontWeight: 600, color: actif ? BLEU : 'var(--texte)' }} />
                          <p style={{ fontSize: 12, color: 'var(--texte-muted)', margin: '3px 0 0' }}>{c.sheikh}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Khoutbah */}
            {khsF.length > 0 && (
              <div>
                <EnTeteGroupe label="Khoutbah" n={khsF.length} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {khsF.map(k => {
                    const actif = piste?.id === k.id
                    const badge = k.serie ? `${k.serie}${k.numero_serie ? ` · ${k.numero_serie}` : ''}` : null
                    return (
                      <div key={k.id} onClick={() => jouerAudio(k, '/khoutbah', k.titre, k.sheikh)} className="carte-piste" style={{ display: 'flex', alignItems: 'center', gap: 14, background: actif ? '#f5f9fe' : '#fff', borderRadius: 18, padding: 12, border: actif ? `1.5px solid ${BLEU}` : '1.5px solid transparent', boxShadow: '0 4px 10px rgba(58,74,92,0.06)', cursor: 'pointer' }}>
                        <Pastille actif={actif} enLecture={enLecture} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <TitreDefilant texte={k.titre} style={{ fontSize: 14, fontWeight: 600, color: actif ? BLEU : 'var(--texte)' }} />
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3, flexWrap: 'wrap' }}>
                            <p style={{ fontSize: 12, color: 'var(--texte-muted)', margin: 0 }}>{k.sheikh}</p>
                            {badge && <span style={{ fontSize: 10.5, fontWeight: 600, padding: '2px 8px', borderRadius: 7, background: '#faf3dc', color: '#b8911f' }}>{badge}</span>}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Fatwas */}
            {fatwasF.length > 0 && (
              <div>
                <EnTeteGroupe label="Fatwas" n={fatwasF.length} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {fatwasF.map(f => {
                    const actif = piste?.id === f.id
                    return (
                      <div key={f.id} onClick={() => jouerAudio(f, '/fatwas', f.question, f.sheikh)} className="carte-piste" style={{ display: 'flex', alignItems: 'center', gap: 14, background: actif ? '#f5f9fe' : '#fff', borderRadius: 18, padding: 12, border: actif ? `1.5px solid ${BLEU}` : '1.5px solid transparent', boxShadow: '0 4px 10px rgba(58,74,92,0.06)', cursor: 'pointer' }}>
                        <Pastille actif={actif} enLecture={enLecture} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 600, color: actif ? BLEU : 'var(--texte)', margin: 0, lineHeight: 1.4 }}>{f.question}</p>
                          <p style={{ fontSize: 12, color: 'var(--texte-muted)', margin: '3px 0 0' }}>{f.sheikh}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />

      <style>{`
        .carte-piste { transition: box-shadow 0.15s, transform 0.1s; }
        .carte-piste:hover { box-shadow: 0 6px 18px rgba(58,74,92,0.10); transform: translateY(-1px); }
        input::placeholder { color: ${W55}; }
      `}</style>
    </main>
  )
}

export default function RecherchePage() {
  return (
    <Suspense fallback={<main style={{ minHeight: '100vh', background: 'var(--fond-creme)' }}><Navbar /></main>}>
      <RechercheInner />
    </Suspense>
  )
}

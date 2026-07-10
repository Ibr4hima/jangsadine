'use client'
import MiniEgaliseur from '@/components/MiniEgaliseur'
import TitreDefilant from '@/components/TitreDefilant'
import { useAudio } from '@/contexts/AudioContext'
import { supabase } from '@/lib/supabase'
import { Search, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

const BLEU = '#2d578c'
const OR = '#d6ad3a'

function normaliser(t: string) {
  return (t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

type Livre = { id: string; titre: string; titre_arabe: string | null; categorie_id: string | null }
type Cat = { id: string; nom: string }
type Audio = { id: string; titre: string; sheikh: string; url_audio: string; duree: string; serie?: string | null; numero_serie?: number | null }
type Fatwa = { id: string; question: string; sheikh: string; url_audio: string; duree: string }

const MAX = 4

function Pastille({ actif, enLecture, note }: { actif: boolean; enLecture: boolean; note?: boolean }) {
  return (
    <div style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: actif ? BLEU : '#edf2f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {actif && enLecture
        ? <MiniEgaliseur />
        : note
          ? <svg width="16" height="16" viewBox="0 -960 960 960"><path d="M400-120q-66 0-113-47t-47-113q0-66 47-113t113-47q23 0 42.5 5.5T480-460v-380h240v120H560v400q0 66-47 113t-113 47Z" fill={actif ? '#fff' : BLEU} /></svg>
          : <svg width="14" height="14" viewBox="0 -960 960 960"><path d="M320-200v-560l440 280-440 280Z" fill={actif ? '#fff' : BLEU} /></svg>}
    </div>
  )
}

function Groupe({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '1.4px', color: OR, textTransform: 'uppercase', margin: '8px 10px 4px' }}>{label}</p>
      {children}
    </div>
  )
}

export default function RechercheLive() {
  const router = useRouter()
  const { jouer, piste, enLecture, toggleLecture } = useAudio()
  const [q, setQ] = useState('')
  const [ouvert, setOuvert] = useState(false)
  const [charge, setCharge] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  const [livres, setLivres] = useState<Livre[]>([])
  const [cats, setCats] = useState<Cat[]>([])
  const [serieMap, setSerieMap] = useState<Record<string, string>>({})
  const [confs, setConfs] = useState<Audio[]>([])
  const [khs, setKhs] = useState<Audio[]>([])
  const [fatwas, setFatwas] = useState<Fatwa[]>([])

  const charger = () => {
    if (charge) return
    setCharge(true)
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
    })
  }

  useEffect(() => {
    const h = (e: MouseEvent) => { if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOuvert(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
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

  const rowStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 11, padding: '8px 10px', borderRadius: 12, cursor: 'pointer', textDecoration: 'none' }

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <form
        onSubmit={e => { e.preventDefault(); const v = q.trim(); router.push(v ? `/recherche?q=${encodeURIComponent(v)}` : '/recherche') }}
        style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', borderRadius: 999, padding: '15px 20px', boxShadow: '0 10px 22px rgba(28,61,102,0.14)' }}
      >
        <Search size={19} color={BLEU} strokeWidth={2} style={{ flexShrink: 0 }} />
        <input
          value={q}
          onChange={e => { setQ(e.target.value); setOuvert(true); charger() }}
          onFocus={() => { setOuvert(true); charger() }}
          placeholder="Rechercher..."
          style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 14, fontFamily: 'inherit', color: 'var(--texte)' }}
        />
        {q && (
          <button type="button" onClick={() => setQ('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
            <X size={16} color="#9aa3ad" strokeWidth={2} />
          </button>
        )}
      </form>

      {ouvert && has && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, zIndex: 30,
          background: '#fff', borderRadius: 18, border: '1px solid #eef1f5',
          boxShadow: '0 18px 44px rgba(28,61,102,0.18)', maxHeight: 440, overflowY: 'auto', padding: 8,
        }}>
          {total === 0 ? (
            <p style={{ textAlign: 'center', padding: '20px 0', fontSize: 13, color: 'var(--texte-muted)' }}>
              {charge ? `Aucun résultat pour « ${q.trim()} »` : 'Recherche…'}
            </p>
          ) : (
            <>
              {livresF.length > 0 && (
                <Groupe label="Cours">
                  {livresF.slice(0, MAX).map(l => {
                    const nomCat = cats.find(c => c.id === l.categorie_id)?.nom ?? ''
                    return (
                      <Link key={l.id} href={serieMap[l.id] ? `/audio/${serieMap[l.id]}` : `/audio/livre/${l.id}`} onClick={() => setOuvert(false)} className="row-rech" style={rowStyle}>
                        <Pastille actif={false} enLecture={false} note />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <TitreDefilant texte={l.titre} style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--texte)' }} />
                          {nomCat && <p style={{ fontSize: 11.5, color: 'var(--texte-muted)', margin: '1px 0 0' }}>{nomCat}</p>}
                        </div>
                      </Link>
                    )
                  })}
                </Groupe>
              )}

              {confsF.length > 0 && (
                <Groupe label="Conférences">
                  {confsF.slice(0, MAX).map(c => {
                    const actif = piste?.id === c.id
                    return (
                      <div key={c.id} onClick={() => jouerAudio(c, '/conferences', c.titre, c.sheikh)} className="row-rech" style={rowStyle}>
                        <Pastille actif={actif} enLecture={enLecture} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <TitreDefilant texte={c.titre} style={{ fontSize: 13.5, fontWeight: 600, color: actif ? BLEU : 'var(--texte)' }} />
                          <p style={{ fontSize: 11.5, color: 'var(--texte-muted)', margin: '1px 0 0' }}>{c.sheikh}</p>
                        </div>
                      </div>
                    )
                  })}
                </Groupe>
              )}

              {khsF.length > 0 && (
                <Groupe label="Khoutbah">
                  {khsF.slice(0, MAX).map(k => {
                    const actif = piste?.id === k.id
                    return (
                      <div key={k.id} onClick={() => jouerAudio(k, '/khoutbah', k.titre, k.sheikh)} className="row-rech" style={rowStyle}>
                        <Pastille actif={actif} enLecture={enLecture} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <TitreDefilant texte={k.titre} style={{ fontSize: 13.5, fontWeight: 600, color: actif ? BLEU : 'var(--texte)' }} />
                          <p style={{ fontSize: 11.5, color: 'var(--texte-muted)', margin: '1px 0 0' }}>{k.sheikh}</p>
                        </div>
                      </div>
                    )
                  })}
                </Groupe>
              )}

              {fatwasF.length > 0 && (
                <Groupe label="Fatwas">
                  {fatwasF.slice(0, MAX).map(f => {
                    const actif = piste?.id === f.id
                    return (
                      <div key={f.id} onClick={() => jouerAudio(f, '/fatwas', f.question, f.sheikh)} className="row-rech" style={rowStyle}>
                        <Pastille actif={actif} enLecture={enLecture} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13.5, fontWeight: 600, color: actif ? BLEU : 'var(--texte)', margin: 0, lineHeight: 1.35, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.question}</p>
                          <p style={{ fontSize: 11.5, color: 'var(--texte-muted)', margin: '1px 0 0' }}>{f.sheikh}</p>
                        </div>
                      </div>
                    )
                  })}
                </Groupe>
              )}

              <Link href={`/recherche?q=${encodeURIComponent(q.trim())}`} onClick={() => setOuvert(false)} style={{ display: 'block', textAlign: 'center', padding: '10px 0 6px', fontSize: 12.5, fontWeight: 600, color: BLEU, textDecoration: 'none', borderTop: '1px solid #f0f2f6', marginTop: 4 }}>
                Voir tous les résultats ({total}) →
              </Link>
            </>
          )}
        </div>
      )}

      <style>{`
        .row-rech { transition: background 0.12s; }
        .row-rech:hover { background: #f5f9fe; }
      `}</style>
    </div>
  )
}

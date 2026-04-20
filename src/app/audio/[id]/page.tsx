'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import { useAudio } from '@/contexts/AudioContext'
import Link from 'next/link'

type Cours = {
  id: string
  titre: string
  sheikh: string
  nb_episodes: number
  description: string | null
  categories: { nom: string }
}

type Episode = {
  id: string
  titre: string
  numero: number
  duree: string
  url_audio: string
}

function formaterTemps(s: number) {
  if (!s || isNaN(s)) return '0:00'
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = Math.floor(s % 60)
  if (h > 0) return h + ':' + m.toString().padStart(2,'0') + ':' + sec.toString().padStart(2,'0')
  return m + ':' + sec.toString().padStart(2,'0')
}

export default function PageCours() {
  const { id } = useParams()
  const [cours, setCours] = useState<Cours | null>(null)
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [loading, setLoading] = useState(true)
  const { jouer, piste, enLecture, progression, dureeTotal, toggleLecture, reculer, avancer, seeker } = useAudio()

  useEffect(() => {
    async function charger() {
      const { data: coursData } = await supabase.from('cours').select('*, categories(nom)').eq('id', id).single()
      const { data: epsData } = await supabase.from('episodes').select('*').eq('cours_id', id).order('numero')
      if (coursData) setCours(coursData)
      if (epsData) setEpisodes(epsData)
      setLoading(false)
    }
    charger()
  }, [id])

  const idx = episodes.findIndex(e => e.id === piste?.id)
  const precedent = idx > 0 ? episodes[idx - 1] : null
  const suivant = idx < episodes.length - 1 ? episodes[idx + 1] : null
  const tempsActuel = (progression / 100) * dureeTotal

  if (loading) return <main style={{ minHeight: '100vh', background: 'var(--fond-creme)' }}><Navbar /><div style={{ textAlign: 'center', padding: '100px 24px', color: '#aaa' }}>Chargement...</div></main>
  if (!cours) return <main style={{ minHeight: '100vh', background: 'var(--fond-creme)' }}><Navbar /><div style={{ textAlign: 'center', padding: '100px 24px', color: '#aaa' }}>Cours introuvable</div></main>

  return (
    <main style={{ minHeight: '100vh', background: 'var(--fond-creme)' }}>
      <Navbar />
      <section style={{ background: 'var(--bleu)', padding: '40px 24px 36px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Link href="/audio" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', display: 'inline-block', marginBottom: '16px' }}>← Retour aux cours</Link>
          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', color: 'var(--or)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>{(cours.categories as any)?.nom}</span>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'white', marginBottom: '6px', lineHeight: 1.3 }}>{cours.titre}</h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: cours.description ? '10px' : '0' }}>{cours.sheikh} · {cours.nb_episodes} épisode{cours.nb_episodes > 1 ? 's' : ''}</p>
          {cours.description && <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, maxWidth: '600px', fontStyle: 'italic' }}>{cours.description}</p>}
        </div>
      </section>
      <div style={{ height: '3px', background: 'linear-gradient(90deg, transparent, #d9ac2a 30%, #d9ac2a 70%, transparent)' }} />

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>
        {piste && episodes.some(e => e.id === piste.id) && (
          <div style={{ background: 'white', border: '1px solid var(--bordure)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
            <p style={{ fontSize: '11px', color: 'var(--or)', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>En cours d'écoute</p>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--texte)', marginBottom: '16px' }}>{piste.titre}</h2>
            <div onClick={e => { const rect = e.currentTarget.getBoundingClientRect(); seeker(((e.clientX - rect.left) / rect.width) * 100) }} style={{ height: '4px', background: '#eee', borderRadius: '2px', cursor: 'pointer', marginBottom: '6px' }}>
              <div style={{ width: progression + '%', height: '100%', background: 'var(--bleu)', borderRadius: '2px', transition: 'width 0.1s' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#aaa', marginBottom: '14px' }}>
              <span>{formaterTemps(tempsActuel)}</span>
              <span>{formaterTemps(dureeTotal)}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '14px' }}>
              <button onClick={() => precedent && jouer({ id: precedent.id, titre: precedent.titre, sheikh: cours.sheikh, url: precedent.url_audio, duree: precedent.duree, href: `/audio/${id}` })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--texte)', opacity: precedent ? 1 : 0.3 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
              </button>
              <button onClick={reculer} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--texte)' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 2v6h6M2.66 15.57a10 10 0 1 0 .57-8.38"/><text x="7.5" y="15" fontSize="6.5" fill="currentColor" stroke="none" fontWeight="700">15</text></svg>
              </button>
              <button onClick={toggleLecture} style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--bleu)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {enLecture ? <div style={{ display: 'flex', gap: '4px' }}><div style={{ width: '3px', height: '16px', background: 'white', borderRadius: '2px' }} /><div style={{ width: '3px', height: '16px', background: 'white', borderRadius: '2px' }} /></div> : <div style={{ width: 0, height: 0, borderTop: '9px solid transparent', borderBottom: '9px solid transparent', borderLeft: '16px solid white', marginLeft: '3px' }} />}
              </button>
              <button onClick={avancer} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--texte)' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38"/><text x="7.5" y="15" fontSize="6.5" fill="currentColor" stroke="none" fontWeight="700">15</text></svg>
              </button>
              <button onClick={() => suivant && jouer({ id: suivant.id, titre: suivant.titre, sheikh: cours.sheikh, url: suivant.url_audio, duree: suivant.duree, href: `/audio/${id}` })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--texte)', opacity: suivant ? 1 : 0.3 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zm8.5-6v6h2V6h-2v6z"/></svg>
              </button>
            </div>
          </div>
        )}

        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--texte)', marginBottom: '14px' }}>Tous les épisodes</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {episodes.map(ep => {
            const actif = piste?.id === ep.id
            return (
              <div key={ep.id} onClick={() => jouer({ id: ep.id, titre: ep.titre, sheikh: cours.sheikh, url: ep.url_audio, duree: ep.duree, href: `/audio/${id}` })}
                style={{ background: actif ? '#e8f0f8' : 'white', border: `1px solid ${actif ? 'var(--bleu)' : 'var(--bordure)'}`, borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => { if (!actif) e.currentTarget.style.borderColor = 'var(--bleu)' }}
                onMouseLeave={e => { if (!actif) e.currentTarget.style.borderColor = 'var(--bordure)' }}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: actif ? 'var(--bleu)' : '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {actif && enLecture ? <div style={{ display: 'flex', gap: '2px' }}><div style={{ width: '3px', height: '12px', background: 'white', borderRadius: '2px' }} /><div style={{ width: '3px', height: '12px', background: 'white', borderRadius: '2px' }} /></div> : <div style={{ width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: '10px solid ' + (actif ? 'white' : '#aaa'), marginLeft: '2px' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: actif ? 600 : 500, color: actif ? 'var(--bleu)' : 'var(--texte)' }}>{ep.titre}</div>
                </div>
                <span style={{ fontSize: '12px', color: '#bbb', flexShrink: 0 }}>{ep.duree}</span>
              </div>
            )
          })}
        </div>
      </div>

      <footer style={{ background: 'var(--footer-bg)', padding: '32px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginTop: '60px' }}>
        <div style={{ fontSize: '16px', fontWeight: 700, color: 'white' }}>Jàng sa <span style={{ color: 'var(--or)' }}>Diné</span></div>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>© {new Date().getFullYear()} — Tous droits réservés</div>
      </footer>
    </main>
  )
}

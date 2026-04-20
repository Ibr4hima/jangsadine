'use client'
import Navbar from '@/components/Navbar'
import TitreDefilant from '@/components/TitreDefilant'
import { useAudio } from '@/contexts/AudioContext'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'

type Conference = { id: string; titre: string; sheikh: string; duree: string; url_audio: string }

function formaterTemps(s: number) {
  if (!s || isNaN(s)) return '0:00'
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = Math.floor(s % 60)
  if (h > 0) return h + ':' + m.toString().padStart(2, '0') + ':' + sec.toString().padStart(2, '0')
  return m + ':' + sec.toString().padStart(2, '0')
}

export default function Conferences() {
  const [conferences, setConferences] = useState<Conference[]>([])
  const [recherche, setRecherche] = useState('')
  const [loading, setLoading] = useState(true)
  const { jouer, piste, enLecture, progression, dureeTotal, toggleLecture, reculer, avancer, seeker } = useAudio()

  useEffect(() => {
    async function charger() {
      const { data } = await supabase.from('conferences').select('*').order('created_at', { ascending: false })
      if (data) setConferences(data)
      setLoading(false)
    }
    charger()
  }, [])

  const filtres = conferences.filter(c =>
    c.titre.toLowerCase().includes(recherche.toLowerCase()) ||
    c.sheikh.toLowerCase().includes(recherche.toLowerCase())
  )

  const idx = conferences.findIndex(c => c.id === piste?.id)
  const precedente = idx > 0 ? conferences[idx - 1] : null
  const suivante = idx < conferences.length - 1 ? conferences[idx + 1] : null

  const tempsActuel = (progression / 100) * dureeTotal

  return (
    <main style={{ minHeight: '100vh', background: 'var(--fond-creme)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <section style={{ background: 'var(--bleu)', padding: '48px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', color: 'var(--or)', textTransform: 'uppercase', marginBottom: '8px' }}>Bibliotheque</p>
        <h1 style={{ fontSize: '40px', fontWeight: 700, color: 'white', marginBottom: '12px' }}>Conférences</h1>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', maxWidth: '480px', margin: '0 auto 24px' }}>Conférence en langue wolof</p>
        <div style={{ maxWidth: '480px', margin: '0 auto', position: 'relative' }}>
          <input value={recherche} onChange={e => setRecherche(e.target.value)} placeholder="Rechercher une conférence..." style={{ width: '100%', padding: '12px 20px 12px 44px', borderRadius: '50px', border: 'none', fontSize: '14px', fontFamily: 'inherit', outline: 'none', background: 'rgba(255,255,255,0.15)', color: 'white', boxSizing: 'border-box' }} />
          <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', opacity: 0.6 }}>🔍</span>
        </div>
      </section>
      <div style={{ height: '3px', background: 'linear-gradient(90deg, transparent, #d9ac2a 30%, #d9ac2a 70%, transparent)' }} />

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px', flex: 1, width: '100%' }}>
        {piste && conferences.some(c => c.id === piste.id) && (
          <div style={{ background: 'white', border: '1px solid var(--bordure)', borderRadius: '16px', padding: '24px', marginBottom: '28px' }}>
            <p style={{ fontSize: '11px', color: 'var(--or)', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>En cours d'écoute</p>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--texte)', marginBottom: '4px' }}>{piste.titre}</h2>
            <p style={{ fontSize: '12px', color: '#888', marginBottom: '16px' }}>{piste.sheikh}</p>
            <div onClick={e => { const rect = e.currentTarget.getBoundingClientRect(); seeker(((e.clientX - rect.left) / rect.width) * 100) }} style={{ height: '4px', background: '#eee', borderRadius: '2px', cursor: 'pointer', marginBottom: '6px' }}>
              <div style={{ width: progression + '%', height: '100%', background: 'var(--bleu)', borderRadius: '2px', transition: 'width 0.1s' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#aaa', marginBottom: '14px' }}>
              <span>{formaterTemps(tempsActuel)}</span>
              <span>{formaterTemps(dureeTotal)}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <button onClick={() => precedente && jouer({ id: precedente.id, titre: precedente.titre, sheikh: precedente.sheikh, url: precedente.url_audio, duree: precedente.duree, href: '/conferences' })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--texte)', opacity: precedente ? 1 : 0.3 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" /></svg>
              </button>
              <button onClick={reculer} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--texte)' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 2v6h6M2.66 15.57a10 10 0 1 0 .57-8.38" /><text x="7.5" y="15" fontSize="6.5" fill="currentColor" stroke="none" fontWeight="700">15</text></svg>
              </button>
              <button onClick={toggleLecture} style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--bleu)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {enLecture ? <div style={{ display: 'flex', gap: '4px' }}><div style={{ width: '3px', height: '16px', background: 'white', borderRadius: '2px' }} /><div style={{ width: '3px', height: '16px', background: 'white', borderRadius: '2px' }} /></div> : <div style={{ width: 0, height: 0, borderTop: '9px solid transparent', borderBottom: '9px solid transparent', borderLeft: '16px solid white', marginLeft: '3px' }} />}
              </button>
              <button onClick={avancer} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--texte)' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38" /><text x="7.5" y="15" fontSize="6.5" fill="currentColor" stroke="none" fontWeight="700">15</text></svg>
              </button>
              <button onClick={() => suivante && jouer({ id: suivante.id, titre: suivante.titre, sheikh: suivante.sheikh, url: suivante.url_audio, duree: suivante.duree, href: '/conferences' })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--texte)', opacity: suivante ? 1 : 0.3 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zm8.5-6v6h2V6h-2v6z" /></svg>
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#aaa' }}>Chargement...</div>
        ) : filtres.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>🔍</div>
            <p style={{ fontSize: '16px', color: '#aaa' }}>{recherche ? 'Aucune conférence pour "' + recherche + '"' : 'Les conférences arrivent bientot'}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filtres.map(c => {
              const est = piste?.id === c.id
              return (
                <div key={c.id} onClick={() => jouer({ id: c.id, titre: c.titre, sheikh: c.sheikh, url: c.url_audio, duree: c.duree, href: '/conferences' })}
                  style={{ background: est ? '#e8f0f8' : 'white', border: '1px solid ' + (est ? 'var(--bleu)' : 'var(--bordure)'), borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={e => { if (!est) e.currentTarget.style.borderColor = 'var(--bleu)' }}
                  onMouseLeave={e => { if (!est) e.currentTarget.style.borderColor = 'var(--bordure)' }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: est ? 'var(--bleu)' : '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {est && enLecture ? <div style={{ display: 'flex', gap: '2px' }}><div style={{ width: '3px', height: '12px', background: 'white', borderRadius: '2px' }} /><div style={{ width: '3px', height: '12px', background: 'white', borderRadius: '2px' }} /></div> : <div style={{ width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: '10px solid ' + (est ? 'white' : '#aaa'), marginLeft: '2px' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <TitreDefilant
                      texte={c.titre}
                      style={{ fontSize: '14px', fontWeight: 600, color: est ? 'var(--bleu)' : 'var(--texte)', marginBottom: '4px' }}
                    />                    <p style={{ fontSize: '12px', color: '#999' }}>{c.sheikh}</p>
                  </div>
                  {c.duree && <span style={{ fontSize: '12px', color: '#bbb', flexShrink: 0 }}>{c.duree}</span>}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <footer style={{ background: 'var(--footer-bg)', padding: '32px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginTop: 'auto' }}>
        <div style={{ fontSize: '16px', fontWeight: 700, color: 'white' }}>Jàng sa <span style={{ color: 'var(--or)' }}>Diné</span></div>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>© {new Date().getFullYear()} — Tous droits réservés</div>
      </footer>
    </main>
  )
}

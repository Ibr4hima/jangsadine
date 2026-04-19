'use client'
import { useEffect, useState, useRef } from 'react'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'

type Khoutbah = { id: string; titre: string; sheikh: string; duree: string; url_audio: string; serie: string | null; numero_serie: number | null }

function formaterTemps(s: number) {
  if (!s || isNaN(s)) return '0:00'
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = Math.floor(s % 60)
  if (h > 0) return h + ':' + m.toString().padStart(2,'0') + ':' + sec.toString().padStart(2,'0')
  return m + ':' + sec.toString().padStart(2,'0')
}

export default function Khoutbah() {
  const [khoutbahs, setKhoutbahs] = useState<Khoutbah[]>([])
  const [recherche, setRecherche] = useState('')
  const [loading, setLoading] = useState(true)
  const [actif, setActif] = useState<Khoutbah | null>(null)
  const [enLecture, setEnLecture] = useState(false)
  const [progression, setProgression] = useState(0)
  const [dureeTotal, setDureeTotal] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    async function charger() {
      const { data } = await supabase.from('khoutbahs').select('*').order('serie').order('numero_serie').order('created_at', { ascending: false })
      if (data) setKhoutbahs(data)
      setLoading(false)
    }
    charger()
  }, [])

  useEffect(() => {
    if (audioRef.current && actif) {
      audioRef.current.load()
      audioRef.current.play().then(() => setEnLecture(true)).catch(() => {})
      setProgression(0)
      setDureeTotal(0)
    }
  }, [actif?.id])

  function toggleLecture() {
    if (!audioRef.current) return
    if (enLecture) { audioRef.current.pause(); setEnLecture(false) }
    else { audioRef.current.play(); setEnLecture(true) }
  }

  const idx = khoutbahs.findIndex(k => k.id === actif?.id)
  const precedente = idx > 0 ? khoutbahs[idx - 1] : null
  const suivante = idx < khoutbahs.length - 1 ? khoutbahs[idx + 1] : null

  const filtres = khoutbahs.filter(k =>
    k.titre.toLowerCase().includes(recherche.toLowerCase()) ||
    k.sheikh.toLowerCase().includes(recherche.toLowerCase()) ||
    (k.serie && k.serie.toLowerCase().includes(recherche.toLowerCase()))
  )

  return (
    <main style={{ minHeight: '100vh', background: 'var(--fond-creme)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <section style={{ background: 'var(--bleu)', padding: '48px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', color: 'var(--or)', textTransform: 'uppercase', marginBottom: '8px' }}>Bibliotheque</p>
        <h1 style={{ fontSize: '40px', fontWeight: 700, color: 'white', marginBottom: '12px' }}>Khoutbah</h1>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', maxWidth: '480px', margin: '0 auto 24px' }}>Sermons du vendredi</p>
        <div style={{ maxWidth: '480px', margin: '0 auto', position: 'relative' }}>
          <input value={recherche} onChange={e => setRecherche(e.target.value)} placeholder="Rechercher par titre, sheikh ou serie..." style={{ width: '100%', padding: '12px 20px 12px 44px', borderRadius: '50px', border: 'none', fontSize: '14px', fontFamily: 'inherit', outline: 'none', background: 'rgba(255,255,255,0.15)', color: 'white', boxSizing: 'border-box' }} />
          <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', opacity: 0.6 }}>🔍</span>
        </div>
      </section>
      <div style={{ height: '3px', background: 'linear-gradient(90deg, transparent, #d9ac2a 30%, #d9ac2a 70%, transparent)' }} />

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px', flex: 1, width: '100%' }}>

        {/* Lecteur */}
        {actif && (
          <div style={{ background: 'white', border: '1px solid var(--bordure)', borderRadius: '16px', padding: '24px', marginBottom: '28px' }}>
            <audio ref={audioRef} src={actif.url_audio}
              onPlay={() => setEnLecture(true)}
              onPause={() => setEnLecture(false)}
              onTimeUpdate={() => setProgression(audioRef.current ? (audioRef.current.currentTime / audioRef.current.duration) * 100 : 0)}
              onLoadedMetadata={() => setDureeTotal(audioRef.current?.duration || 0)}
              onEnded={() => { setEnLecture(false); if (suivante) setActif(suivante) }}
            />
            <p style={{ fontSize: '11px', color: 'var(--or)', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>En cours d'écoute</p>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--texte)', marginBottom: '16px' }}>{actif.titre}</h2>
            <p style={{ fontSize: '12px', color: '#888', marginBottom: '16px' }}>{actif.sheikh}</p>

            <div onClick={e => {
              if (!audioRef.current) return
              const rect = e.currentTarget.getBoundingClientRect()
              audioRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * audioRef.current.duration
            }} style={{ height: '4px', background: '#eee', borderRadius: '2px', cursor: 'pointer', marginBottom: '6px', position: 'relative' }}>
              <div style={{ width: progression + '%', height: '100%', background: 'var(--bleu)', borderRadius: '2px', transition: 'width 0.1s' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#aaa', marginBottom: '14px' }}>
              <span>{formaterTemps(audioRef.current?.currentTime || 0)}</span>
              <span>{formaterTemps(dureeTotal)}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <button onClick={() => precedente && setActif(precedente)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--texte)', opacity: precedente ? 1 : 0.3 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
              </button>
              <button onClick={() => { if (audioRef.current) audioRef.current.currentTime -= 15 }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--texte)' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.5 2v6h6M2.66 15.57a10 10 0 1 0 .57-8.38"/>
                  <text x="7.5" y="15" fontSize="6.5" fill="currentColor" stroke="none" fontWeight="700">15</text>
                </svg>
              </button>
              <button onClick={toggleLecture} style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--bleu)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {enLecture
                  ? <div style={{ display: 'flex', gap: '4px' }}><div style={{ width: '3px', height: '16px', background: 'white', borderRadius: '2px' }} /><div style={{ width: '3px', height: '16px', background: 'white', borderRadius: '2px' }} /></div>
                  : <div style={{ width: 0, height: 0, borderTop: '9px solid transparent', borderBottom: '9px solid transparent', borderLeft: '16px solid white', marginLeft: '3px' }} />
                }
              </button>
              <button onClick={() => { if (audioRef.current) audioRef.current.currentTime += 15 }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--texte)' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38"/>
                  <text x="7.5" y="15" fontSize="6.5" fill="currentColor" stroke="none" fontWeight="700">15</text>
                </svg>
              </button>
              <button onClick={() => suivante && setActif(suivante)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--texte)', opacity: suivante ? 1 : 0.3 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zm8.5-6v6h2V6h-2v6z"/></svg>
              </button>
            </div>
          </div>
        )}

        {/* Liste */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#aaa' }}>Chargement...</div>
        ) : filtres.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>🕌</div>
            <p style={{ fontSize: '16px', color: '#aaa' }}>{recherche ? 'Aucune khoutbah trouvee pour "' + recherche + '"' : 'Les khoutbahs arrivent bientot'}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filtres.map(k => {
              const est = actif?.id === k.id
              return (
                <div key={k.id} onClick={() => setActif(k)}
                  style={{ background: est ? '#e8f0f8' : 'white', border: '1px solid ' + (est ? 'var(--bleu)' : 'var(--bordure)'), borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={e => { if (!est) e.currentTarget.style.borderColor = 'var(--bleu)' }}
                  onMouseLeave={e => { if (!est) e.currentTarget.style.borderColor = 'var(--bordure)' }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: est ? 'var(--bleu)' : '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {est && enLecture
                      ? <div style={{ display: 'flex', gap: '2px' }}><div style={{ width: '3px', height: '12px', background: 'white', borderRadius: '2px' }} /><div style={{ width: '3px', height: '12px', background: 'white', borderRadius: '2px' }} /></div>
                      : <div style={{ width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: '10px solid ' + (est ? 'white' : '#aaa'), marginLeft: '2px' }} />
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: est ? 'var(--bleu)' : 'var(--texte)', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{k.titre}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>{k.sheikh}</p>
                      {k.serie && <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px', background: '#faf3dc', color: '#b8911f' }}>{k.serie}{k.numero_serie ? ' · ' + k.numero_serie : ''}</span>}
                    </div>
                  </div>
                  {k.duree && <span style={{ fontSize: '12px', color: '#bbb', flexShrink: 0 }}>{k.duree}</span>}
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

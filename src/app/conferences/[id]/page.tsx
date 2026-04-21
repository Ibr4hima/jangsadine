'use client'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

type Conference = { id: string; titre: string; sheikh: string; duree: string; url_audio: string }

function formaterTemps(s: number) {
  if (!s || isNaN(s)) return '0:00'
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = Math.floor(s % 60)
  if (h > 0) return h + ':' + m.toString().padStart(2, '0') + ':' + sec.toString().padStart(2, '0')
  return m + ':' + sec.toString().padStart(2, '0')
}

export default function PageConference() {
  const { id } = useParams()
  const router = useRouter()
  const [conference, setConference] = useState<Conference | null>(null)
  const [toutes, setToutes] = useState<Conference[]>([])
  const [loading, setLoading] = useState(true)
  const [enLecture, setEnLecture] = useState(false)
  const [progression, setProgression] = useState(0)
  const [dureeTotal, setDureeTotal] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    async function charger() {
      const { data: conf } = await supabase.from('conferences').select('*').eq('id', id).single()
      const { data: all } = await supabase.from('conferences').select('*').order('created_at', { ascending: false })
      if (conf) setConference(conf)
      if (all) setToutes(all)
      setLoading(false)
    }
    charger()
  }, [id])

  useEffect(() => {
    if (audioRef.current && conference) {
      audioRef.current.load()
      setEnLecture(false)
      setProgression(0)
      setDureeTotal(0)
    }
  }, [conference])

  function toggleLecture() {
    if (!audioRef.current) return
    if (enLecture) { audioRef.current.pause(); setEnLecture(false) }
    else { audioRef.current.play(); setEnLecture(true) }
  }

  const idx = toutes.findIndex(c => c.id === id)
  const precedente = idx > 0 ? toutes[idx - 1] : null
  const suivante = idx < toutes.length - 1 ? toutes[idx + 1] : null

  if (loading) return <main style={{ minHeight: '100vh', background: 'var(--fond-creme)' }}><Navbar /><div style={{ textAlign: 'center', padding: '100px 24px', color: '#aaa' }}>Chargement...</div></main>
  if (!conference) return <main style={{ minHeight: '100vh', background: 'var(--fond-creme)' }}><Navbar /><div style={{ textAlign: 'center', padding: '100px 24px', color: '#aaa' }}>Introuvable</div></main>

  return (
    <main style={{ minHeight: '100vh', background: 'var(--fond-creme)' }}>
      <Navbar />
      <section style={{ background: 'var(--bleu)', padding: '40px 24px 36px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Link href="/conferences" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', display: 'inline-block', marginBottom: '16px' }}>← Retour aux conférences</Link>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'white', marginBottom: '6px', lineHeight: 1.3 }}>{conference.titre}</h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>{conference.sheikh}</p>
        </div>
      </section>
      <div style={{ height: '3px', background: 'linear-gradient(90deg, transparent, #d9ac2a 30%, #d9ac2a 70%, transparent)' }} />

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ background: 'white', border: '1px solid var(--bordure)', borderRadius: '16px', padding: '24px', marginBottom: '28px' }}>
          <p style={{ fontSize: '11px', color: 'var(--or)', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>En cours d'écoute</p>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--texte)', marginBottom: '16px' }}>{conference.titre}</h2>

          <audio ref={audioRef} src={conference.url_audio} onPlay={() => setEnLecture(true)} onPause={() => setEnLecture(false)}
            onTimeUpdate={() => setProgression(audioRef.current ? (audioRef.current.currentTime / audioRef.current.duration) * 100 : 0)}
            onLoadedMetadata={() => setDureeTotal(audioRef.current?.duration || 0)}
            onEnded={() => { setEnLecture(false); if (suivante) router.push('/conferences/' + suivante.id) }} />

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

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '14px' }}>
            <button onClick={() => precedente && router.push('/conferences/' + precedente.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--texte)', opacity: precedente ? 1 : 0.3 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" /></svg>
            </button>
            <button onClick={() => { if (audioRef.current) audioRef.current.currentTime -= 10 }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <img src="/icons/replay_10.svg" width="26" height="26" />
            </button>
            <button onClick={toggleLecture} style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--bleu)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {enLecture ? (
                <div style={{ display: 'flex', gap: '4px' }}>
                  <div style={{ width: '3px', height: '16px', background: 'white', borderRadius: '2px' }} />
                  <div style={{ width: '3px', height: '16px', background: 'white', borderRadius: '2px' }} />
                </div>
              ) : (
                <div style={{ width: 0, height: 0, borderTop: '9px solid transparent', borderBottom: '9px solid transparent', borderLeft: '16px solid white', marginLeft: '3px' }} />
              )}
            </button>
            <button onClick={() => { if (audioRef.current) audioRef.current.currentTime += 10 }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <img src="/icons/forward_10.svg" width="26" height="26" />
            </button>
            <button onClick={() => suivante && router.push('/conferences/' + suivante.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--texte)', opacity: suivante ? 1 : 0.3 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zm8.5-6v6h2V6h-2v6z" /></svg>
            </button>
          </div>
        </div>

        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--texte)', marginBottom: '14px' }}>Toutes les conférences</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {toutes.map(c => {
            const actif = c.id === id
            return (
              <Link key={c.id} href={'/conferences/' + c.id} style={{ background: actif ? '#e8f0f8' : 'white', border: '1px solid ' + (actif ? 'var(--bleu)' : 'var(--bordure)'), borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', transition: 'all 0.15s' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: actif ? 'var(--bleu)' : '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <div style={{ width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: '9px solid ' + (actif ? 'white' : '#aaa'), marginLeft: '2px' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '13px', fontWeight: actif ? 600 : 500, color: actif ? 'var(--bleu)' : 'var(--texte)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.titre}</p>
                  <p style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>{c.sheikh}</p>
                </div>
                {c.duree && <span style={{ fontSize: '11px', color: '#bbb', flexShrink: 0 }}>{c.duree}</span>}
              </Link>
            )
          })}
        </div>
      </div>

      <footer style={{ background: 'var(--footer-bg)', padding: '32px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginTop: '40px' }}>
        <div style={{ fontSize: '16px', fontWeight: 700, color: 'white' }}>Jàng sa <span style={{ color: 'var(--or)' }}>Diné</span></div>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>© {new Date().getFullYear()} — Tous droits réservés</div>
      </footer>
    </main>
  )
}

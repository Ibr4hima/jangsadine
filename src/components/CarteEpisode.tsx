'use client'
import MiniEgaliseur from './MiniEgaliseur'
import TitreDefilant from './TitreDefilant'

const BLEU = '#2d578c'

type Ep = { id: string; titre: string; numero?: number; duree?: string; description?: string | null }

// Carte épisode identique à l'app (audio/[id].tsx) :
// pastille 38px (numéro / play / égaliseur), titre défilant, durée, bouton info + description.
export default function CarteEpisode({ ep, numero, actif, enLecture, descOuverte, onPlay, onToggleDesc }: {
  ep: Ep
  numero: number
  actif: boolean
  enLecture: boolean
  descOuverte: boolean
  onPlay: () => void
  onToggleDesc: () => void
}) {
  return (
    <div>
      <div
        onClick={onPlay}
        className="carte-piste"
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: actif ? '#f5f9fe' : '#fff',
          borderRadius: descOuverte ? '18px 18px 0 0' : 18,
          padding: 12,
          border: actif ? `1.5px solid ${BLEU}` : '1.5px solid transparent',
          boxShadow: '0 4px 10px rgba(58,74,92,0.06)',
          cursor: 'pointer',
        }}
      >
        <div style={{
          width: 38, height: 38, borderRadius: 19, flexShrink: 0,
          background: actif ? BLEU : '#edf2f8',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: actif ? '0 3px 6px rgba(45,87,140,0.30)' : 'none',
        }}>
          {actif && enLecture ? (
            <MiniEgaliseur />
          ) : actif ? (
            <svg width="15" height="15" viewBox="0 -960 960 960"><path d="M320-200v-560l440 280-440 280Z" fill="white" /></svg>
          ) : (
            <span style={{ fontSize: 12, fontWeight: 600, color: BLEU, fontVariantNumeric: 'tabular-nums' }}>{numero}</span>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <TitreDefilant texte={ep.titre} style={{ fontSize: 14, fontWeight: 600, color: actif ? BLEU : 'var(--texte)' }} />
          {ep.duree ? (
            <p style={{ fontSize: 11, fontWeight: 500, color: '#aab4c0', margin: '2px 0 0', fontVariantNumeric: 'tabular-nums' }}>{ep.duree}</p>
          ) : null}
        </div>

        {ep.description ? (
          <button
            onClick={e => { e.stopPropagation(); onToggleDesc() }}
            style={{
              width: 30, height: 30, borderRadius: 15, flexShrink: 0,
              background: descOuverte ? BLEU : '#edf2f8',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <span style={{ fontFamily: 'serif', fontWeight: 700, fontSize: 13, fontStyle: 'italic', color: descOuverte ? '#fff' : BLEU }}>i</span>
          </button>
        ) : null}
      </div>

      {descOuverte && ep.description ? (
        <div style={{
          background: '#f5f9fe',
          border: `1.5px solid ${BLEU}`, borderTop: 'none',
          borderRadius: '0 0 18px 18px',
          padding: '12px 16px',
        }}>
          <div className="ep-description" style={{ fontSize: 13, color: '#5b6675', lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: ep.description }} />
        </div>
      ) : null}
    </div>
  )
}

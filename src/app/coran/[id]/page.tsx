'use client'
import Bismillah from '@/components/Bismillah'
import souratesHafs from '@/data/quran/sourates.json'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'

// Couleurs fixes — pas de mode nuit/jour. Papier crème ivoire (chaud,
// moins de fatigue en lecture longue, met l'or en valeur) + noir chaud.
const BG = '#F8F4EA'
const TEXTE = '#2E2C28'
const OR = '#b8932a'
const OR_CHIP = '#d6ad3a'

// Dégradé bleu du héros (cohérent avec les autres pages)
const HERO_TOP = '#3d6ba3'
const HERO_MID = '#2d578c'
const HERO_BOT = '#234a7a'

// Taille de lecture fixe : compacte et régulière, comme un Mushaf imprimé.
const TAILLE_LECTURE = 30

type Riwaya = 'hafs' | 'warsh' | 'qaloon'
function versRiwaya(v?: string | null): Riwaya {
  return v === 'warsh' || v === 'qaloon' ? v : 'hafs'
}

// Police KFGQPC par riwaya
const policeParRiwaya: Record<Riwaya, string> = {
  hafs: 'UthmanicHafs', warsh: 'Warsh', qaloon: 'Qaloon',
}
// Riwayas au décompte kufi : la basmala EST le verset 1 de la Fatiha
const BASMALA_VERSET_UN: Riwaya[] = ['hafs']
const RIWAYA_LABELS: Record<Riwaya, string> = { hafs: 'Hafs', warsh: 'Warsh', qaloon: 'Qaloon' }

// Police SuraNames (quran.com) : ligatures par identifiant — « 026 » → nom
// calligraphié, « surah » → le mot « سورة ».
function nomSourate(idx: number) {
  return `${String(idx).padStart(3, '0')}surah`
}

// Chiffres arabes (٠١٢…) pour les marqueurs de fin de verset, comme dans le Mushaf
function chiffresArabes(n: number) {
  return String(n).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[Number(d)])
}

type Divisions = { juz: Record<string, number>; hizb?: Record<string, number> }
type Verset = { numero: number; texte: string }
type SourateInfo = { index: number; nom: string; nomAr: string; versets: number; page: number }

// Une lecture = UNE sourate ou UN juz. La liste contient les en-têtes
// (basmala) des sourates qui commencent dans la lecture, puis leurs blocs.
type Item =
  | { type: 'entete'; cle: string; sourate: number; basmala: string | null }
  | { type: 'bloc'; cle: string; sourate: number; versets: Verset[] }
  | { type: 'page'; cle: string; sourate: number; page: number }

// ─── chargement des données (fetch + cache module) ───────────
const cacheJson: Record<string, Promise<unknown>> = {}
function chargerJson<T>(url: string): Promise<T> {
  if (!cacheJson[url]) cacheJson[url] = fetch(url).then(r => r.json())
  return cacheJson[url] as Promise<T>
}
function urlSourate(riw: Riwaya, idx: number) { return `/quran/${riw}_${idx}.json` }
function urlPages(riw: Riwaya) { return riw === 'hafs' ? '/quran/pages.json' : `/quran/${riw}_pages.json` }
function urlDivisions(riw: Riwaya) { return riw === 'hafs' ? '/quran/divisions.json' : `/quran/${riw}_divisions.json` }
function urlListe(riw: Riwaya) { return riw === 'hafs' ? '/quran/sourates.json' : `/quran/${riw}_sourates.json` }

// Étiquette inline d'un début de Juz / Hizb. Renvoie le libellé arabe ou null.
function libelleDivision(divisions: Divisions, sourate: number, numero: number): string | null {
  const cle = `${sourate}:${numero}`
  const j = divisions.juz[cle]
  if (j) return `الجزء ${j}`
  const h = divisions.hizb?.[cle]
  if (h) return `الحزب ${h}`
  return null
}

// ─── Bordure de mushaf ────────────────────────────────────────
function BordureMushaf({ cote }: { cote: 'gauche' | 'droite' }) {
  const ext = cote === 'gauche' ? 'left' : 'right'
  return (
    <div style={{ position: 'fixed', top: 0, bottom: 0, [ext]: 7, width: 7, pointerEvents: 'none', zIndex: 5 }}>
      <div style={{ position: 'absolute', top: 0, bottom: 0, [ext]: 0, width: 1.4, background: OR, opacity: 0.40 }} />
      <div style={{ position: 'absolute', top: 0, bottom: 0, [ext]: 5, width: 0.7, background: OR, opacity: 0.22 }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 110, background: `linear-gradient(${BG}, rgba(248,244,234,0))` }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 110, background: `linear-gradient(rgba(248,244,234,0), ${BG})` }} />
    </div>
  )
}

// ─── Bloc de texte continu (une page du Mushaf) ───────────────
function BlocTexte({ item, taille, divisions, police }: {
  item: Extract<Item, { type: 'bloc' }>; taille: number; divisions: Divisions; police: string
}) {
  return (
    <p dir="rtl" style={{
      fontFamily: police,
      fontSize: taille,
      lineHeight: 2.0,
      color: TEXTE,
      textAlign: 'center',
      margin: 0,
    }}>
      {item.versets.map(v => {
        const badge = libelleDivision(divisions, item.sourate, v.numero)
        const texte = badge && v.texte.charCodeAt(0) === 0x06DE ? v.texte.slice(1) : v.texte
        return (
          <span key={v.numero}>
            {badge && (
              <span style={{ whiteSpace: 'nowrap' }}>
                {' '}
                <span style={{ fontSize: taille * 0.88, color: '#000' }}>۞</span>
                <sup style={{ fontFamily: police, fontSize: taille * 0.42, color: '#80838A' }}>{badge}</sup>
                {'  '}
              </span>
            )}
            {texte}{' '}
            <span style={{ fontSize: taille * 1.1 }}>{chiffresArabes(v.numero)}</span>
            {'  '}
          </span>
        )
      })}
    </p>
  )
}

// ─── Bouton de fin de lecture (cartouche doré, style Mushaf) ─
function BoutonFin({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="coran-fin-btn" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flex: '1 1 130px', maxWidth: 210,
      border: '1px solid rgba(184,147,42,0.55)', borderRadius: 16,
      padding: '12px 14px', background: 'rgba(184,147,42,0.06)',
      textDecoration: 'none', textAlign: 'center',
    }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: OR }}>{label}</span>
    </Link>
  )
}

function Lecteur() {
  const params = useParams<{ id: string }>()
  const search = useSearchParams()
  const index = parseInt(params.id)
  const riw = versRiwaya(search.get('riwaya'))
  const cleParam = search.get('cle')
  const juzParam = search.get('juz') ? parseInt(search.get('juz')!) : null
  const policeCoran = policeParRiwaya[riw]
  const taille = TAILLE_LECTURE

  const [items, setItems] = useState<Item[]>([])
  const [sourateActive, setSourateActive] = useState(index)
  const [chromeVisible, setChromeVisible] = useState(true)
  const [voile, setVoile] = useState(true)
  const [infoDivision, setInfoDivision] = useState<{ n: number; pct: number } | null>(null)

  const [pageEnds, setPageEnds] = useState<Record<string, number> | null>(null)
  const [divisions, setDivisions] = useState<Divisions | null>(null)
  const [listeSourates, setListeSourates] = useState<{ index: number; versets: number }[] | null>(null)

  const conteneurRef = useRef<HTMLDivElement>(null)
  const cibleCleRef = useRef<string | null>(cleParam)
  const repriseRef = useRef<{ sourate: number; cle?: string; riwaya: Riwaya } | null>(null)
  const derniereSauvegardeRef = useRef(0)

  // ── données de la riwaya ──
  useEffect(() => {
    chargerJson<Record<string, number>>(urlPages(riw)).then(setPageEnds)
    chargerJson<Divisions>(urlDivisions(riw)).then(setDivisions)
    chargerJson<{ index: number; versets: number }[]>(urlListe(riw)).then(setListeSourates)
  }, [riw])

  // ── bornes des 30 juz (triées) ──
  const bornesJuz = useMemo(() => {
    if (!divisions) return null
    return Object.entries(divisions.juz)
      .map(([cle, n]) => { const [so, ay] = cle.split(':').map(Number); return { n, so, ay } })
      .sort((a, b) => a.n - b.n)
  }, [divisions])

  // Construit les items d'une sourate, bornés à [min, max[ (versets)
  const construireSourate = useCallback(async (idx: number, min = 1, max = Infinity): Promise<Item[]> => {
    if (!pageEnds || !divisions) return []
    const data = await chargerJson<{ verse: Record<string, string> }>(urlSourate(riw, idx))
    const versets: Verset[] = []
    let basm: string | null = null
    for (const [cle, texte] of Object.entries(data.verse)) {
      const num = parseInt(cle.replace('verse_', ''))
      if (num === 0) { basm = texte; continue }
      if (BASMALA_VERSET_UN.includes(riw) && idx === 1 && num === 1) { basm = texte; continue }
      if (num < min || num >= max) continue
      versets.push({ numero: num, texte })
    }
    const out: Item[] = []
    // En-tête (nom calligraphié + basmala) seulement si la sourate commence ici
    if (min <= 1) out.push({ type: 'entete', cle: `s${idx}_e`, sourate: idx, basmala: basm })
    // Un bloc = le contenu d'UNE page du Mushaf.
    let courant: Verset[] = []
    let blocIdx = 0
    const fermerBloc = () => {
      if (courant.length) {
        out.push({ type: 'bloc', cle: `s${idx}_b${blocIdx++}`, sourate: idx, versets: courant })
        courant = []
      }
    }
    for (const v of versets) {
      if (courant.length && divisions.juz[`${idx}:${v.numero}`]) fermerBloc()
      courant.push(v)
      const page = pageEnds[`${idx}:${v.numero}`]
      if (page) {
        fermerBloc()
        out.push({ type: 'page', cle: `s${idx}_p${v.numero}`, sourate: idx, page })
      }
    }
    fermerBloc()
    return out
  }, [riw, pageEnds, divisions])

  // ── contenu de la lecture : UNE sourate, ou UN juz ──
  useEffect(() => {
    if (!pageEnds || !divisions) return
    let actif = true
    setVoile(true)
    conteneurRef.current?.scrollTo({ top: 0 })

    async function construire(): Promise<Item[]> {
      if (juzParam && bornesJuz) {
        const debut = bornesJuz.find(b => b.n === juzParam)
        if (!debut) return []
        const fin = bornesJuz.find(b => b.n === juzParam + 1) ?? null
        // dernière sourate incluse : celle où commence le juz suivant
        // (exclue si le juz suivant démarre à son verset 1)
        const derniere = fin ? (fin.ay === 1 ? fin.so - 1 : fin.so) : 114
        const morceaux: Item[][] = []
        for (let so = debut.so; so <= derniere; so++) {
          const min = so === debut.so ? debut.ay : 1
          const max = fin && so === fin.so ? fin.ay : Infinity
          morceaux.push(await construireSourate(so, min, max))
        }
        return morceaux.flat()
      }
      return construireSourate(index)
    }

    construire().then(its => {
      if (!actif) return
      setItems(its)
      setSourateActive(juzParam && bornesJuz ? (bornesJuz.find(b => b.n === juzParam)?.so ?? index) : index)
    })
    return () => { actif = false }
  }, [index, juzParam, construireSourate, pageEnds, divisions, bornesJuz])

  // ── positionnement (reprise via ?cle=) puis levée du voile ──
  useEffect(() => {
    if (!items.length) return
    const cle = cibleCleRef.current
    cibleCleRef.current = null
    requestAnimationFrame(() => {
      if (cle) {
        const el = document.querySelector(`[data-cle="${cle}"]`)
        if (el) {
          const y = (el as HTMLElement).offsetTop - 78
          conteneurRef.current?.scrollTo({ top: Math.max(0, y) })
        }
      }
      setTimeout(() => setVoile(false), cle ? 450 : 250)
    })
  }, [items])

  // ── progression dans le juz courant ──
  const bornesEtCumuls = useMemo(() => {
    if (!listeSourates || !divisions) return null
    const avant: Record<number, number> = {}
    let total = 0
    for (const so of listeSourates) { avant[so.index] = total; total += so.versets }
    const global = (sora: number, aya: number) => (avant[sora] ?? 0) + aya
    const bornes: { n: number; debut: number }[] = []
    for (const [cleB, n] of Object.entries(divisions.juz)) {
      const [so, ay] = cleB.split(':').map(Number)
      bornes.push({ n, debut: global(so, ay) })
    }
    bornes.sort((a, b) => a.debut - b.debut)
    return { bornes, global, total }
  }, [listeSourates, divisions])

  const majDivision = useCallback((sora: number, aya: number) => {
    if (!bornesEtCumuls) return
    const { bornes, global, total } = bornesEtCumuls
    if (!bornes.length) return
    const g = global(sora, aya)
    let i = 0
    for (let k = bornes.length - 1; k >= 0; k--) {
      if (g >= bornes[k].debut) { i = k; break }
    }
    const debut = bornes[i].debut
    const fin = i + 1 < bornes.length ? bornes[i + 1].debut : total + 1
    const pct = Math.min(100, Math.max(0, Math.round(((g - debut) / Math.max(1, fin - debut)) * 100)))
    setInfoDivision(prev => prev && prev.n === bornes[i].n && prev.pct === pct ? prev : { n: bornes[i].n, pct })
  }, [bornesEtCumuls])

  // ── suivi du scroll : bloc visible en haut → héros + reprise ──
  const onScroll = useCallback(() => {
    const el = conteneurRef.current
    if (!el || voile) return
    const y = el.scrollTop

    const enfants = el.querySelectorAll<HTMLElement>('[data-cle]')
    let haut: HTMLElement | null = null
    for (const c of enfants) {
      if (c.offsetTop + c.offsetHeight > y + 100) { haut = c; break }
    }
    if (haut) {
      const sourate = parseInt(haut.dataset.sourate || '0')
      const cle = haut.dataset.cle || ''
      const premierVerset = parseInt(haut.dataset.verset || '1')
      if (sourate) {
        setSourateActive(sourate)
        majDivision(sourate, premierVerset)
        // Reprise : en lecture de sourate on mémorise le bloc exact ; en
        // lecture de juz, seulement la sourate (les clés de blocs diffèrent).
        repriseRef.current = juzParam ? { sourate, riwaya: riw } : { sourate, cle, riwaya: riw }
        const maintenant = Date.now()
        if (maintenant - derniereSauvegardeRef.current > 1500) {
          derniereSauvegardeRef.current = maintenant
          try { localStorage.setItem('jsd_reprise_coran', JSON.stringify(repriseRef.current)) } catch { }
        }
      }
    }
  }, [voile, riw, juzParam, majDivision])

  // initialisation du héros (sourate + juz %) dès la levée du voile
  const onScrollRef = useRef<() => void>(() => { })
  useEffect(() => { onScrollRef.current = onScroll }, [onScroll])
  useEffect(() => {
    if (!voile) requestAnimationFrame(() => onScrollRef.current())
  }, [voile])

  // sauvegarde finale en quittant le lecteur
  useEffect(() => () => {
    if (repriseRef.current) {
      try { localStorage.setItem('jsd_reprise_coran', JSON.stringify(repriseRef.current)) } catch { }
    }
  }, [])

  // tap simple → bascule le chrome (pas pendant une sélection de texte)
  const basculerChrome = useCallback(() => {
    if (window.getSelection()?.toString()) return
    setChromeVisible(v => !v)
  }, [])

  const infos = souratesHafs as SourateInfo[]
  const infoActive = infos[sourateActive - 1]

  // ── navigation de fin de lecture ──
  const finNavigation = (() => {
    if (juzParam && bornesJuz) {
      const prec = bornesJuz.find(b => b.n === juzParam - 1)
      const suiv = bornesJuz.find(b => b.n === juzParam + 1)
      return (
        <>
          {prec && <BoutonFin href={`/coran/${prec.so}?riwaya=${riw}&juz=${prec.n}`} label={`Juz ${prec.n}`} />}
          {suiv && <BoutonFin href={`/coran/${suiv.so}?riwaya=${riw}&juz=${suiv.n}`} label={`Juz ${suiv.n}`} />}
        </>
      )
    }
    const prec = index > 1 ? infos[index - 2] : null
    const suiv = index < 114 ? infos[index] : null
    return (
      <>
        {prec && <BoutonFin href={`/coran/${prec.index}?riwaya=${riw}`} label={`${prec.index}. ${prec.nom}`} />}
        {suiv && <BoutonFin href={`/coran/${suiv.index}?riwaya=${riw}`} label={`${suiv.index}. ${suiv.nom}`} />}
      </>
    )
  })()

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: BG }}>

      {/* Une lecture = une sourate ou un juz */}
      <div
        ref={conteneurRef}
        onScroll={onScroll}
        onClick={basculerChrome}
        style={{ position: 'absolute', inset: 0, overflowY: 'auto', padding: '0 20px', WebkitOverflowScrolling: 'touch' }}
      >
        <div style={{ maxWidth: 640, margin: '0 auto', paddingTop: 78 }}>
          {items.map(item => {
            if (item.type === 'entete') {
              return (
                <div key={item.cle} data-cle={item.cle} data-sourate={item.sourate} data-verset="1"
                  style={{ paddingTop: taille * 0.7, paddingBottom: Math.round(taille * 0.5), textAlign: 'center' }}>
                  <div style={{ fontFamily: 'SuraNames', fontSize: taille * 1.6, lineHeight: 1.35, color: '#000', direction: 'ltr' }}>
                    {nomSourate(item.sourate)}
                  </div>
                  {item.basmala && (
                    <div style={{ marginTop: taille * 0.6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: taille * 0.4 }}>
                      {item.sourate === 1 && BASMALA_VERSET_UN.includes(riw) && (
                        <span style={{ fontFamily: policeCoran, fontSize: taille * 1.1, color: TEXTE, transform: `translateY(${taille * 0.22}px)`, display: 'inline-block' }}>
                          {chiffresArabes(1)}
                        </span>
                      )}
                      <Bismillah width={Math.min(taille * 8.1, 500)} color={TEXTE} />
                    </div>
                  )}
                </div>
              )
            }
            if (item.type === 'page') {
              return (
                <div key={item.cle} data-cle={item.cle} data-sourate={item.sourate}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: `${Math.round(taille * 0.6)}px 0` }}>
                  <div style={{ flex: 1, height: 1, background: 'rgba(184,147,42,0.35)' }} />
                  <div style={{ border: '1px solid rgba(184,147,42,0.55)', borderRadius: 999, padding: '2px 13px', background: 'rgba(184,147,42,0.06)' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: OR, letterSpacing: '1px' }}>{item.page}</span>
                  </div>
                  <div style={{ flex: 1, height: 1, background: 'rgba(184,147,42,0.35)' }} />
                </div>
              )
            }
            return (
              <div key={item.cle} data-cle={item.cle} data-sourate={item.sourate} data-verset={item.versets[0].numero}>
                {divisions && <BlocTexte item={item} taille={taille} divisions={divisions} police={policeCoran} />}
              </div>
            )
          })}

          {/* Fin de lecture : sourate/juz précédent et suivant */}
          {items.length > 0 && (
            <div onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', padding: '26px 0 44px' }}>
              {finNavigation}
            </div>
          )}
        </div>
      </div>

      {/* Cadre doré du Mushaf, par-dessus le texte */}
      <BordureMushaf cote="gauche" />
      <BordureMushaf cote="droite" />

      {/* Chrome flottant — héros bleu en dégradé */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        borderBottomLeftRadius: 22, borderBottomRightRadius: 22, overflow: 'hidden',
        background: `linear-gradient(180deg, ${HERO_TOP} 0%, ${HERO_MID} 60%, ${HERO_BOT} 100%)`,
        opacity: chromeVisible ? 1 : 0,
        transform: chromeVisible ? 'none' : 'translateY(-18px)',
        transition: `opacity ${chromeVisible ? 280 : 650}ms ease, transform ${chromeVisible ? 280 : 650}ms ease`,
        pointerEvents: chromeVisible ? 'auto' : 'none',
      }}>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '7px 16px 9px', display: 'flex', alignItems: 'center' }}>
          {/* riwaya */}
          <div style={{ width: 74, textAlign: 'center' }}>
            <p style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '1.5px', color: 'rgba(255,255,255,0.55)', margin: 0 }}>RIWAYAH</p>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#fff', margin: 0 }}>{RIWAYA_LABELS[riw]}</p>
          </div>

          {/* centre : nom de la sourate — ramène à la liste */}
          <Link href="/coran" onClick={e => e.stopPropagation()} style={{ flex: 1, textAlign: 'center', minWidth: 0, textDecoration: 'none' }}>
            <div style={{ display: 'inline-block', background: 'rgba(214,173,58,0.16)', borderRadius: 999, padding: '2px 11px', marginBottom: 1 }}>
              <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '1.7px', color: OR_CHIP, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                {infoActive?.nom}
              </span>
            </div>
            <div style={{ fontFamily: 'SuraNames', fontSize: 19, color: '#fff', lineHeight: '27px', direction: 'ltr', whiteSpace: 'nowrap', overflow: 'hidden' }}>
              {nomSourate(sourateActive)}
            </div>
          </Link>

          {/* Progression dans le juz */}
          <div style={{ width: 74, textAlign: 'center' }}>
            {infoDivision && (
              <>
                <p style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '1.5px', color: 'rgba(255,255,255,0.55)', margin: 0 }}>JUZ {infoDivision.n}</p>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#fff', margin: 0, fontVariantNumeric: 'tabular-nums' }}>{infoDivision.pct}%</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Voile d'ouverture */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 20, background: BG,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: voile ? 1 : 0, transition: 'opacity 0.2s ease',
        pointerEvents: 'none',
      }}>
        <div className="coran-spinner" style={{ width: 30, height: 30, borderRadius: 15, border: `3px solid rgba(184,147,42,0.2)`, borderTopColor: OR }} />
      </div>

      <style>{`
        .coran-spinner { animation: coranSpin 0.9s linear infinite; }
        @keyframes coranSpin { to { transform: rotate(360deg); } }
        .coran-fin-btn { transition: background 0.15s, transform 0.15s; }
        .coran-fin-btn:hover { background: rgba(184,147,42,0.12); }
        .coran-fin-btn:active { transform: scale(0.97); }
      `}</style>
    </div>
  )
}

export default function LectureSourate() {
  return (
    <Suspense fallback={<div style={{ position: 'fixed', inset: 0, background: BG }} />}>
      <Lecteur />
    </Suspense>
  )
}

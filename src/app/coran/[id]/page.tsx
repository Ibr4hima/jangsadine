'use client'
import Bismillah from '@/components/Bismillah'
import souratesHafs from '@/data/quran/sourates.json'
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

// Taille de lecture fixe : confortable et régulière, comme un Mushaf imprimé.
const TAILLE_LECTURE = 35

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

// Police SuraNames (quran.com) : deux ligatures distinctes — les 3 chiffres
// « 026 » → le nom calligraphié de la sourate, et « surah » → le mot « سورة ».
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

// Lecture « au fil » : la liste contient, à la suite, l'en-tête (basmala) de
// chaque sourate puis ses blocs de versets. On enchaîne les sourates au scroll.
type Item =
  | { type: 'entete'; cle: string; sourate: number; basmala: string | null; premier: boolean }
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
// Cadre minimaliste : un double filet doré continu de chaque côté, fondu
// dans la page aux extrémités. Sobre, précis, sans ornement.
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
        // ۞ (U+06DE) en tête de verset = marque rub-el-hizb : remplacée par
        // le badge aux débuts de Juz/Hizb.
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

function Lecteur() {
  const params = useParams<{ id: string }>()
  const search = useSearchParams()
  const index = parseInt(params.id)
  const riw = versRiwaya(search.get('riwaya'))
  const cleParam = search.get('cle')
  const versetParam = search.get('verset')
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
  const chargeesRef = useRef<number[]>([])
  const enChargementRef = useRef(false)
  const cibleRef = useRef<{ cle: string | null; verset: number | null }>({
    cle: cleParam, verset: versetParam ? parseInt(versetParam) : null,
  })
  const repriseRef = useRef<{ sourate: number; cle: string; riwaya: Riwaya } | null>(null)
  const derniereSauvegardeRef = useRef(0)
  const dernierYRef = useRef(0)

  // ── données de la riwaya ──
  useEffect(() => {
    chargerJson<Record<string, number>>(urlPages(riw)).then(setPageEnds)
    chargerJson<Divisions>(urlDivisions(riw)).then(setDivisions)
    chargerJson<{ index: number; versets: number }[]>(urlListe(riw)).then(setListeSourates)
  }, [riw])

  // Construit les items d'une sourate : en-tête (basmala) + blocs par page du Mushaf
  const construireSourate = useCallback(async (idx: number): Promise<Item[]> => {
    if (!pageEnds || !divisions) return []
    const data = await chargerJson<{ verse: Record<string, string> }>(urlSourate(riw, idx))
    const versets: Verset[] = []
    let basm: string | null = null
    for (const [cle, texte] of Object.entries(data.verse)) {
      const num = parseInt(cle.replace('verse_', ''))
      // verse_0 = basmala séparée → affichée en en-tête, hors flux numéroté.
      if (num === 0) { basm = texte; continue }
      // al-Fatiha en décompte kufi (Hafs) : la basmala EST le verset 1.
      if (BASMALA_VERSET_UN.includes(riw) && idx === 1 && num === 1) { basm = texte; continue }
      versets.push({ numero: num, texte })
    }
    const out: Item[] = [{ type: 'entete', cle: `s${idx}_e`, sourate: idx, basmala: basm, premier: false }]
    // Un bloc = le contenu d'UNE page du Mushaf : on ne coupe qu'aux fins
    // de pages (bandeau « numéro de page » intercalé).
    let courant: Verset[] = []
    let blocIdx = 0
    const fermerBloc = () => {
      if (courant.length) {
        out.push({ type: 'bloc', cle: `s${idx}_b${blocIdx++}`, sourate: idx, versets: courant })
        courant = []
      }
    }
    for (const v of versets) {
      // Début de juz en pleine page : on coupe le bloc juste avant.
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

  // ── chargement initial ──
  useEffect(() => {
    if (!pageEnds || !divisions) return
    let actif = true
    chargeesRef.current = [index]
    construireSourate(index).then(its => {
      if (!actif) return
      setItems(its.map((it, i) => it.type === 'entete' && i === 0 ? { ...it, premier: true } : it))
      setSourateActive(index)
    })
    return () => { actif = false }
  }, [index, construireSourate, pageEnds, divisions])

  // ── positionnement cible (cle ou verset) puis levée du voile ──
  useEffect(() => {
    if (!items.length) return
    const { cle, verset } = cibleRef.current
    let cleCible: string | null = null
    if (cle && items.some(it => it.cle === cle)) cleCible = cle
    else if (verset != null) {
      const it = items.find(it => it.type === 'bloc' && it.sourate === index && it.versets.some(v => v.numero === verset)) as Extract<Item, { type: 'bloc' }> | undefined
      if (it) cleCible = it.cle
    }
    cibleRef.current = { cle: null, verset: null }
    requestAnimationFrame(() => {
      if (cleCible) {
        const el = document.querySelector(`[data-cle="${cleCible}"]`)
        if (el) {
          const y = (el as HTMLElement).offsetTop - 96
          conteneurRef.current?.scrollTo({ top: Math.max(0, y) })
        }
      }
      // petit délai : laisser les polices/mises en page se poser
      setTimeout(() => setVoile(false), cleCible ? 450 : 250)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length > 0])

  // ── enchaînement : sourate suivante en fin de scroll ──
  const chargerSuivante = useCallback(async () => {
    if (enChargementRef.current) return
    const ch = chargeesRef.current
    const dernier = ch[ch.length - 1]
    if (dernier >= 114) return
    enChargementRef.current = true
    const its = await construireSourate(dernier + 1)
    chargeesRef.current = [...ch, dernier + 1]
    setItems(prev => [...prev, ...its])
    enChargementRef.current = false
  }, [construireSourate])

  // ── et vers le haut : sourate(s) précédente(s), scroll compensé ──
  const chargerPrecedente = useCallback(async () => {
    if (enChargementRef.current || !listeSourates) return
    const ch = chargeesRef.current
    if (ch[0] <= 1) return
    enChargementRef.current = true
    // Par LOT : assez de sourates pour ~2 écrans (≥ 40 versets) — indispensable
    // pour les petites sourates de la fin (Naas, Falaq…).
    const versetsDe = (n: number) => listeSourates.find(x => x.index === n)?.versets ?? 20
    const nouvelles: number[] = []
    let premier = ch[0]
    let cumul = 0
    while (premier > 1 && cumul < 40) {
      premier -= 1
      nouvelles.unshift(premier)
      cumul += versetsDe(premier)
    }
    const blocs = await Promise.all(nouvelles.map(n => construireSourate(n)))
    chargeesRef.current = [...nouvelles, ...ch]
    const el = conteneurRef.current
    const avantH = el?.scrollHeight ?? 0
    const avantY = el?.scrollTop ?? 0
    setItems(prev => {
      const nouveaux = [...blocs.flat(), ...prev.map(it => it.type === 'entete' ? { ...it, premier: false } : it)]
      return nouveaux.map((it, i) => it.type === 'entete' && i === 0 ? { ...it, premier: true } : it)
    })
    // compense l'insertion en tête : la lecture ne bouge pas d'un pixel
    requestAnimationFrame(() => {
      if (el) el.scrollTop = avantY + (el.scrollHeight - avantH)
      enChargementRef.current = false
    })
  }, [construireSourate, listeSourates])

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

  // ── suivi du scroll : bloc visible en haut → héros + reprise + préchargements ──
  const onScroll = useCallback(() => {
    const el = conteneurRef.current
    if (!el || voile) return
    const y = el.scrollTop
    const delta = y - dernierYRef.current
    dernierYRef.current = y

    // bloc dont le contenu occupe le haut de l'écran
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
        // position exacte de lecture (throttlée à ~1,5 s)
        repriseRef.current = { sourate, cle, riwaya: riw }
        const maintenant = Date.now()
        if (maintenant - derniereSauvegardeRef.current > 1500) {
          derniereSauvegardeRef.current = maintenant
          try { localStorage.setItem('jsd_reprise_coran', JSON.stringify(repriseRef.current)) } catch { }
        }
      }
    }

    // préchargements
    if (el.scrollHeight - y - el.clientHeight < 1800) chargerSuivante()
    if (delta < -4 && y < 900) chargerPrecedente()
  }, [voile, riw, majDivision, chargerSuivante, chargerPrecedente])

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

  const infoActive = (souratesHafs as SourateInfo[])[sourateActive - 1]

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: BG }}>

      {/* Lecture « au fil » : toutes les sourates s'enchaînent */}
      <div
        ref={conteneurRef}
        onScroll={onScroll}
        onClick={basculerChrome}
        style={{ position: 'absolute', inset: 0, overflowY: 'auto', padding: '0 22px', WebkitOverflowScrolling: 'touch' }}
      >
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          {items.map(item => {
            if (item.type === 'entete') {
              return (
                <div key={item.cle} data-cle={item.cle} data-sourate={item.sourate} data-verset="1"
                  style={{ paddingTop: item.premier ? 110 : taille * 1.2, paddingBottom: Math.round(taille * 0.5), textAlign: 'center' }}>
                  {/* Nom calligraphié (police SuraNames — ligature par identifiant) */}
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
                      <Bismillah width={Math.min(taille * 8.1, 560)} color={TEXTE} />
                    </div>
                  )}
                </div>
              )
            }
            if (item.type === 'page') {
              // Bandeau de fin de page : numéro dans un cartouche, encadré de
              // deux filets dorés, comme dans un Mushaf imprimé.
              return (
                <div key={item.cle} data-cle={item.cle} data-sourate={item.sourate}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: `${Math.round(taille * 0.7)}px 0` }}>
                  <div style={{ flex: 1, height: 1, background: 'rgba(184,147,42,0.35)' }} />
                  <div style={{ border: '1px solid rgba(184,147,42,0.55)', borderRadius: 999, padding: '3px 14px', background: 'rgba(184,147,42,0.06)' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: OR, letterSpacing: '1px' }}>{item.page}</span>
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
          <div style={{ height: 90 }} />
        </div>
      </div>

      {/* Cadre doré du Mushaf, par-dessus le texte */}
      <BordureMushaf cote="gauche" />
      <BordureMushaf cote="droite" />

      {/* Chrome flottant — héros bleu en dégradé, comme les autres pages */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        borderBottomLeftRadius: 28, borderBottomRightRadius: 28, overflow: 'hidden',
        background: `linear-gradient(180deg, ${HERO_TOP} 0%, ${HERO_MID} 60%, ${HERO_BOT} 100%)`,
        opacity: chromeVisible ? 1 : 0,
        transform: chromeVisible ? 'none' : 'translateY(-18px)',
        transition: `opacity ${chromeVisible ? 280 : 650}ms ease, transform ${chromeVisible ? 280 : 650}ms ease`,
        pointerEvents: chromeVisible ? 'auto' : 'none',
      }}>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '10px 16px 12px', display: 'flex', alignItems: 'center' }}>
          {/* retour + riwaya */}
          <div style={{ width: 92, display: 'flex', alignItems: 'center', gap: 8 }}>
            <a href={`/coran`} aria-label="Retour" onClick={e => e.stopPropagation()} style={{
              width: 34, height: 34, borderRadius: 17, flexShrink: 0,
              background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.28)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none',
            }}>
              <svg width={17} height={17} viewBox="0 -960 960 960"><path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" fill="#fff" /></svg>
            </a>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.6px', color: 'rgba(255,255,255,0.55)', margin: 0 }}>RIWAYAH</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: 0 }}>{RIWAYA_LABELS[riw]}</p>
            </div>
          </div>

          <div style={{ flex: 1, textAlign: 'center', minWidth: 0 }}>
            {/* Chip doré (nom FR) */}
            <div style={{ display: 'inline-block', background: 'rgba(214,173,58,0.16)', borderRadius: 999, padding: '3px 12px', marginBottom: 2 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.8px', color: OR_CHIP, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                {infoActive?.nom}
              </span>
            </div>
            {/* Nom calligraphié (blanc, sur le héros bleu) */}
            <div style={{ fontFamily: 'SuraNames', fontSize: 21, color: '#fff', lineHeight: '30px', direction: 'ltr', whiteSpace: 'nowrap', overflow: 'hidden' }}>
              {nomSourate(sourateActive)}
            </div>
          </div>

          {/* Progression dans le juz */}
          <div style={{ width: 92, textAlign: 'center' }}>
            {infoDivision && (
              <>
                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.6px', color: 'rgba(255,255,255,0.55)', margin: 0 }}>JUZ {infoDivision.n}</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: 0, fontVariantNumeric: 'tabular-nums' }}>{infoDivision.pct}%</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Voile d'ouverture : masque le remplissage progressif de la liste */}
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

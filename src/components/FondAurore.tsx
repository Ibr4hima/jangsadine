'use client'

// Fond « aurore » — réplique EXACTE du FondAurore compact de l'app :
// trois nappes bleues nettes qui dérivent très lentement (17 s / 23 s / 29 s,
// aller-retour), transforms + opacité uniquement. Les keyframes sont
// globales (globals.css).
export default function FondAurore() {
  return (
    <>
      <div className="aurore aurore-1" style={{ width: 380, height: 380, background: 'rgb(120,165,220)', top: -160, right: -120 }} />
      <div className="aurore aurore-2" style={{ width: 300, height: 300, background: 'rgb(90,140,200)', bottom: -120, left: -90 }} />
      <div className="aurore aurore-3" style={{ width: 340, height: 340, background: 'rgb(30,64,106)', bottom: -170, right: -80 }} />
    </>
  )
}

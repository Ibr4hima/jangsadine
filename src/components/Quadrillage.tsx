'use client'

// Quadrillage « plan d'architecte » : trois couches superposées qui fondent
// depuis un coin — une grille fine, une grille majeure (une cellule sur
// quatre), et des points lumineux posés sur les intersections majeures.
// La profondeur vient de la superposition, pas de l'opacité brute.
export default function Quadrillage({ coin = '78% -10%' }: { coin?: string }) {
  const masque = `radial-gradient(ellipse 95% 90% at ${coin}, rgba(0,0,0,0.9) 0%, transparent 68%)`
  const masqueSerre = `radial-gradient(ellipse 70% 65% at ${coin}, rgba(0,0,0,0.9) 0%, transparent 60%)`
  return (
    <>
      {/* grille fine */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)',
        backgroundSize: '36px 36px',
        maskImage: masque, WebkitMaskImage: masque,
      }} />
      {/* grille majeure : une cellule sur quatre, à peine plus marquée */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)',
        backgroundSize: '144px 144px',
        maskImage: masque, WebkitMaskImage: masque,
      }} />
      {/* points lumineux aux intersections majeures */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.30) 1px, transparent 1.8px)',
        backgroundSize: '144px 144px',
        backgroundPosition: '-0.5px -0.5px',
        maskImage: masqueSerre, WebkitMaskImage: masqueSerre,
      }} />
    </>
  )
}

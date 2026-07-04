'use client'

// Quadrillage « plan d'architecte » : une grille fine et une grille majeure
// (une cellule sur quatre) sur toute la surface, très subtiles. Un léger
// fondu vertical adoucit le bas pour laisser respirer le contenu.
export default function Quadrillage({ fine = 0.05, majeure = 0.08 }: { fine?: number; majeure?: number }) {
  const masque = 'linear-gradient(180deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 55%, rgba(0,0,0,0.5) 100%)'
  return (
    <>
      {/* grille fine */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `linear-gradient(rgba(255,255,255,${fine}) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,${fine}) 1px, transparent 1px)`,
        backgroundSize: '36px 36px',
        maskImage: masque, WebkitMaskImage: masque,
      }} />
      {/* grille majeure : une cellule sur quatre, à peine plus marquée */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `linear-gradient(rgba(255,255,255,${majeure}) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,${majeure}) 1px, transparent 1px)`,
        backgroundSize: '144px 144px',
        maskImage: masque, WebkitMaskImage: masque,
      }} />
    </>
  )
}

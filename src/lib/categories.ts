// Couleurs de catégories — identiques à l'app (constants/theme.ts)
// Palette « manuscrit » : encres profondes sur lavis doux, accordées au
// bleu #2d578c, à l'or #d6ad3a et au fond crème — teintes distinctes,
// saturation et luminosité harmonisées.
export const couleurBg: Record<string, string> = {
  Aqeedah: '#e9eff6',
  Fiqh: '#f6eed6',
  Hadith: '#e6efe8',
  'Tafsir & Sciences du Coran': '#f6e7eb',
  Seerah: '#f7eae2',
  Invocations: '#e3efee',
  'Éthique & Bons comportements': '#eeeaf5',
  'Séries de cours': '#f0e9dd',
}

export const couleurTxt: Record<string, string> = {
  Aqeedah: '#2c5382',              // bleu ardoise (le bleu de l'app)
  Fiqh: '#96751c',                 // or doux (l'or de l'app)
  Hadith: '#2f6b4f',               // vert émeraude profond
  'Tafsir & Sciences du Coran': '#93374f', // bordeaux des reliures
  Seerah: '#a2552d',               // terre cuite
  Invocations: '#2b6b6b',          // bleu-vert serein
  'Éthique & Bons comportements': '#6d5296', // violet feutré
  'Séries de cours': '#7a5b3a',    // brun bronze
}

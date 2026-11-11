export type ShapeQuestion = {
  id: string
  shape: 'triangle' | 'square' | 'circle' | 'rectangle'
  symbol: string
  object: string
  prompt: string
  options: string[]
  answer: string
  explanation: string
  illustration?: 'clock' | 'house' | 'tile' | 'door' | 'wheel'
}

const levelOne: ShapeQuestion[] = [
  { id: 'l1-q1', shape: 'triangle', symbol: '▲', object: 'Segitiga', prompt: 'Manakah gambar yang berbentuk segitiga?', options: ['● Lingkaran', '▲ Segitiga', '■ Persegi', '▰ Persegi panjang'], answer: '▲ Segitiga', explanation: 'Segitiga memiliki tiga sisi lurus.' },
  { id: 'l1-q2', shape: 'circle', symbol: '●', object: 'Lingkaran', prompt: 'Bangun datar manakah yang berbentuk bulat?', options: ['▲ Segitiga', '■ Persegi', '● Lingkaran', '▰ Persegi panjang'], answer: '● Lingkaran', explanation: 'Lingkaran berbentuk bulat dan tidak memiliki titik sudut.' },
  { id: 'l1-q3', shape: 'square', symbol: '■', object: 'Persegi', prompt: 'Pilih gambar yang merupakan persegi.', options: ['● Lingkaran', '▰ Persegi panjang', '▲ Segitiga', '■ Persegi'], answer: '■ Persegi', explanation: 'Persegi memiliki empat sisi sama panjang.' },
  { id: 'l1-q4', shape: 'triangle', symbol: '▲', object: 'Segitiga', prompt: 'Bentuk apa yang memiliki tiga sisi?', options: ['Lingkaran', 'Persegi', 'Segitiga', 'Persegi panjang'], answer: 'Segitiga', explanation: 'Segitiga mempunyai tiga sisi.' },
  { id: 'l1-q5', shape: 'square', symbol: '■', object: 'Persegi', prompt: 'Bangun datar apa yang memiliki empat sisi sama panjang?', options: ['Segitiga', 'Persegi', 'Lingkaran', 'Persegi panjang'], answer: 'Persegi', explanation: 'Keempat sisi persegi sama panjang.' },
]
const levelTwo: ShapeQuestion[] = [
  { id: 'l2-q1', shape: 'triangle', symbol: '▲', object: 'Segitiga', prompt: 'Berapa jumlah sisi pada segitiga?', options: ['2 sisi', '3 sisi', '4 sisi', '5 sisi'], answer: '3 sisi', explanation: 'Segitiga memiliki tiga sisi.' },
  { id: 'l2-q2', shape: 'square', symbol: '■', object: 'Persegi', prompt: 'Berapa jumlah titik sudut pada persegi?', options: ['2 titik sudut', '3 titik sudut', '4 titik sudut', 'Tidak ada'], answer: '4 titik sudut', explanation: 'Persegi memiliki empat titik sudut.' },
  { id: 'l2-q3', shape: 'circle', symbol: '●', object: 'Lingkaran', prompt: 'Berapa jumlah titik sudut pada lingkaran?', options: ['0', '1', '3', '4'], answer: '0', explanation: 'Lingkaran tidak memiliki titik sudut.' },
  { id: 'l2-q4', shape: 'square', symbol: '■', object: 'Segi empat', prompt: 'Bangun datar apa yang memiliki empat sisi?', options: ['Lingkaran', 'Segitiga', 'Persegi', 'Keduanya A dan B'], answer: 'Persegi', explanation: 'Persegi memiliki empat sisi.' },
  { id: 'l2-q5', shape: 'circle', symbol: '●', object: 'Lingkaran', prompt: 'Bangun datar apa yang tidak memiliki titik sudut?', options: ['Segitiga', 'Persegi', 'Persegi panjang', 'Lingkaran'], answer: 'Lingkaran', explanation: 'Lingkaran tidak memiliki titik sudut.' },
]
const levelThree: ShapeQuestion[] = [
  { id: 'l3-q1', shape: 'circle', symbol: '●', object: 'Jam dinding', prompt: 'Jam dinding berbentuk bulat menyerupai bangun datar apa?', options: ['Segitiga', 'Persegi', 'Lingkaran', 'Persegi panjang'], answer: 'Lingkaran', explanation: 'Bagian muka jam berbentuk lingkaran.', illustration: 'clock' },
  { id: 'l3-q2', shape: 'triangle', symbol: '▲', object: 'Atap rumah', prompt: 'Atap rumah pada gambar menyerupai bentuk apa?', options: ['Segitiga', 'Lingkaran', 'Persegi', 'Persegi panjang'], answer: 'Segitiga', explanation: 'Bagian atap rumah menyerupai segitiga.', illustration: 'house' },
  { id: 'l3-q3', shape: 'square', symbol: '■', object: 'Ubin', prompt: 'Ubin dengan empat sisi sama panjang menyerupai bentuk apa?', options: ['Lingkaran', 'Persegi', 'Segitiga', 'Persegi panjang'], answer: 'Persegi', explanation: 'Ubin dengan empat sisi sama panjang berbentuk persegi.', illustration: 'tile' },
  { id: 'l3-q4', shape: 'rectangle', symbol: '▰', object: 'Pintu', prompt: 'Pintu berbentuk persegi panjang memiliki berapa sisi?', options: ['2 sisi', '3 sisi', '4 sisi', '5 sisi'], answer: '4 sisi', explanation: 'Persegi panjang memiliki empat sisi.', illustration: 'door' },
  { id: 'l3-q5', shape: 'circle', symbol: '●', object: 'Roda sepeda', prompt: 'Roda sepeda jika dilihat dari samping berbentuk apa?', options: ['Persegi', 'Lingkaran', 'Segitiga', 'Persegi panjang'], answer: 'Lingkaran', explanation: 'Roda sepeda berbentuk lingkaran.', illustration: 'wheel' },
]

const shapes = ['Segitiga', 'Persegi', 'Lingkaran', 'Persegi panjang']
const shapeVisuals: Record<string, ShapeQuestion['shape']> = { Segitiga: 'triangle', Persegi: 'square', Lingkaran: 'circle', 'Persegi panjang': 'rectangle' }
const shapeSymbols: Record<string, string> = { Segitiga: '▲', Persegi: '■', Lingkaran: '●', 'Persegi panjang': '▰' }
function numberOptions(answer: number, suffix: string, level: number) {
  const candidates = [answer, answer + 2, Math.max(1, answer - 1), answer + 4]
  const unique = [...new Set(candidates)].slice(0, 4)
  const shift = level % unique.length
  return [...unique.slice(shift), ...unique.slice(0, shift)].map(value => `${value} ${suffix}`)
}

// Isi level lain dipertahankan memakai bank soal yang sudah ada di project.
function existingQuestions(level: number): ShapeQuestion[] {
  const objects = [
    { name: 'Atap rumah', shape: 'Segitiga', illustration: 'house' as const }, { name: 'Jendela taman', shape: 'Persegi' },
    { name: 'Roda gerobak', shape: 'Lingkaran' }, { name: 'Papan petunjuk', shape: 'Persegi panjang' },
    { name: 'Bendera bukit', shape: 'Segitiga' }, { name: 'Ubin teras', shape: 'Persegi' },
    { name: 'Piring piknik', shape: 'Lingkaran' }, { name: 'Buku cerita', shape: 'Persegi panjang' },
  ]
  const object = objects[(level - 1) % objects.length]
  const sideCount = 3 + (level % 2); const sideName = sideCount === 3 ? 'segitiga' : 'persegi'
  const length = 3 + (level % 5); const width = 2 + (level % 3); const perimeter = 2 * (length + width)
  const areaLength = 2 + (level % 4); const areaWidth = 2 + ((level + 1) % 3); const area = areaLength * areaWidth
  const patterns = [
    { seq: 'Segitiga, Persegi, Segitiga, Persegi, ...', answer: 'Segitiga' },
    { seq: 'Lingkaran, Lingkaran, Persegi, Lingkaran, Lingkaran, Persegi, ...', answer: 'Lingkaran' },
    { seq: 'Persegi panjang, Segitiga, Lingkaran, Persegi panjang, Segitiga, ...', answer: 'Lingkaran' },
    { seq: 'Persegi, Lingkaran, Persegi, Lingkaran, ...', answer: 'Persegi' },
  ]
  const pattern = patterns[(level - 1) % patterns.length]
  const numeric = (answer: number, unit: string) => numberOptions(answer, unit, level)
  return [
    { id: `object-${level}`, shape: shapeVisuals[object.shape], symbol: shapeSymbols[object.shape], object: object.name, prompt: `${object.name} pada gambar ini paling mirip bentuk apa?`, options: [...shapes].sort((a, b) => ((shapes.indexOf(a) + level) % 4) - ((shapes.indexOf(b) + level) % 4)), answer: object.shape, explanation: `${object.name} menyerupai ${object.shape.toLowerCase()}.`, ...(object.illustration ? { illustration: object.illustration } : {}) },
    { id: `sides-${level}`, shape: sideName === 'segitiga' ? 'triangle' : 'square', symbol: sideName === 'segitiga' ? '▲' : '■', object: 'Tebing bentuk', prompt: `${sideName === 'segitiga' ? 'Segitiga' : 'Persegi'} memiliki berapa sisi?`, options: ['2 sisi', '3 sisi', '4 sisi', '5 sisi'], answer: `${sideCount} sisi`, explanation: `${sideName === 'segitiga' ? 'Segitiga' : 'Persegi'} memiliki ${sideCount} sisi lurus.` },
    { id: `perimeter-${level}`, shape: 'rectangle', symbol: '▰', object: 'Pagar taman', prompt: `Pagar persegi panjang panjangnya ${length} m dan lebarnya ${width} m. Berapa kelilingnya?`, options: numeric(perimeter, 'm'), answer: `${perimeter} m`, explanation: `Keliling = 2 × (panjang + lebar), jadi 2 × (${length} + ${width}) = ${perimeter} m.` },
    { id: `pattern-${level}`, shape: shapeVisuals[pattern.answer], symbol: shapeSymbols[pattern.answer], object: 'Jejak ajaib', prompt: `Bentuk apa yang melanjutkan pola ini? ${pattern.seq}`, options: [...shapes].sort((a, b) => ((shapes.indexOf(a) + level) % 4) - ((shapes.indexOf(b) + level) % 4)), answer: pattern.answer, explanation: 'Perhatikan urutan bentuk yang berulang untuk menemukan bentuk berikutnya.' },
    { id: `area-${level}`, shape: 'square', symbol: '▦', object: 'Lantai taman baca', prompt: `Lantai berbentuk persegi panjang berukuran ${areaLength} m × ${areaWidth} m. Berapa luasnya?`, options: numeric(area, 'm²'), answer: `${area} m²`, explanation: `Luas = panjang × lebar, jadi ${areaLength} × ${areaWidth} = ${area} m².` },
  ]
}

export type TargetItem = { id: string; label: string; shape: ShapeQuestion['shape']; symbol: string; x: number; platform: number; offset?: number }
export function questionsForLevel(level: number): ShapeQuestion[] {
  if (level === 1) return levelOne
  if (level === 2) return levelTwo
  if (level === 3) return levelThree
  return existingQuestions(Math.max(4, Math.floor(level)))
}
export function targetsForLevel(level: number): TargetItem[] {
  if (level === 1) return [
    { id: 'triangle', label: 'Segitiga', shape: 'triangle', symbol: '▲', x: .29, platform: 3, offset: .72 },
    { id: 'circle', label: 'Lingkaran', shape: 'circle', symbol: '●', x: .44, platform: 2 },
    { id: 'square', label: 'Persegi', shape: 'square', symbol: '■', x: .74, platform: 4 },
  ]
  if (level === 2) return [
    { id: 'l2-side', label: '3 sisi', shape: 'triangle', symbol: '▲', x: .29, platform: 1 },
    { id: 'l2-four', label: '4 sisi', shape: 'square', symbol: '■', x: .44, platform: 2 },
    { id: 'l2-corner', label: 'Titik sudut', shape: 'triangle', symbol: '▲', x: .59, platform: 3 },
    { id: 'l2-round', label: 'Tanpa sudut', shape: 'circle', symbol: '●', x: .74, platform: 4 },
  ]
  if (level === 3) return [
    { id: 'l3-clock', label: 'Jam', shape: 'circle', symbol: '●', x: .29, platform: 3 },
    { id: 'l3-roof', label: 'Atap rumah', shape: 'triangle', symbol: '▲', x: .44, platform: 2 },
    { id: 'l3-tile', label: 'Ubin', shape: 'square', symbol: '■', x: .74, platform: 4 },
  ]
  return existingQuestions(level).map((q, i) => ({ id: q.id, label: q.object, shape: q.shape, symbol: q.symbol, x: i % 2 ? .79 : .34, platform: i + 1 }))
}
export function titleForLevel(level: number): string { return ['Gerbang Pulau Bentuk', 'Lembah Bentuk', 'Hutan Bentuk'][level - 1] ?? `Level ${level}` }

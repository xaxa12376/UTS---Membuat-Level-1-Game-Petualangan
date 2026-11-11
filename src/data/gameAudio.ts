let context: AudioContext | null = null
let musicTimer: number | null = null
let noteIndex = 0

function getContext() {
  if (typeof window === 'undefined' || !('AudioContext' in window)) return null
  if (!context) context = new AudioContext()
  if (context.state === 'suspended') void context.resume().catch(() => undefined)
  return context
}

export function startBackgroundMusic() {
  const audio = getContext()
  if (!audio || musicTimer !== null) return
  const tune = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880, 698.46, 523.25, 659.25, 783.99, 1046.5]
  const beat = () => {
    if (!context || context.state !== 'running') return
    const now = audio.currentTime
    const frequency = tune[noteIndex % tune.length]
    const melody = audio.createOscillator(); const melodyGain = audio.createGain()
    melody.type = 'triangle'; melody.frequency.setValueAtTime(frequency, now)
    melodyGain.gain.setValueAtTime(.0001, now); melodyGain.gain.exponentialRampToValueAtTime(.065, now + .025); melodyGain.gain.exponentialRampToValueAtTime(.0001, now + .30)
    melody.connect(melodyGain); melodyGain.connect(audio.destination); melody.start(now); melody.stop(now + .32)
    if (noteIndex % 3 === 0) {
      const bass = audio.createOscillator(); const bassGain = audio.createGain()
      bass.type = 'sine'; bass.frequency.setValueAtTime(frequency / 2, now)
      bassGain.gain.setValueAtTime(.0001, now); bassGain.gain.exponentialRampToValueAtTime(.025, now + .03); bassGain.gain.exponentialRampToValueAtTime(.0001, now + .35)
      bass.connect(bassGain); bassGain.connect(audio.destination); bass.start(now); bass.stop(now + .37)
    }
    noteIndex++
  }
  beat()
  musicTimer = window.setInterval(beat, 360)
}

export function playGameSound(kind: 'click' | 'collect' | 'coin' | 'fall' | 'select' | 'correct' | 'wrong' | 'finish') {
  const audio = getContext()
  if (!audio) return
  startBackgroundMusic()
  const tones: Record<typeof kind, number[]> = {
    click: [720], collect: [880, 1175], coin: [1047, 1319], fall: [390, 260], select: [660], correct: [784, 988, 1175], wrong: [280, 220], finish: [659, 784, 988, 1319],
  }
  const volume: Record<typeof kind, number> = { click: .12, collect: .15, coin: .18, fall: .16, select: .13, correct: .17, wrong: .15, finish: .19 }
  tones[kind].forEach((frequency, index) => {
    const now = audio.currentTime + index * .075
    const oscillator = audio.createOscillator(); const gain = audio.createGain()
    oscillator.type = kind === 'fall' || kind === 'wrong' ? 'triangle' : 'sine'
    oscillator.frequency.setValueAtTime(frequency, now)
    gain.gain.setValueAtTime(.0001, now); gain.gain.exponentialRampToValueAtTime(volume[kind], now + .012); gain.gain.exponentialRampToValueAtTime(.0001, now + .19)
    oscillator.connect(gain); gain.connect(audio.destination); oscillator.start(now); oscillator.stop(now + .21)
  })
}

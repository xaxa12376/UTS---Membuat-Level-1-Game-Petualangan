import { useEffect, useMemo, useRef, useState } from 'react'
import GameStatusBar from './GameStatusBar'
import QuizObjectIllustration from './QuizObjectIllustration'
import { questionsForLevel, targetsForLevel, titleForLevel } from '../data/questions'
import { playGameSound, startBackgroundMusic } from '../data/gameAudio'
import spriteUrl from '../assets/satik-animations.png'
import floatingPlatformUrl from '../assets/floating-platform.png'

type Result = { score: number; earned: number; correct: number; total: number; rewardCoins: number; coinBonus: number }
type Props = { level: number; score: number; coins: number; onBack: () => void; onComplete: (result: Result) => void }
type Direction = 'left' | 'right' | 'jump'
type Sim = { x: number; y: number; vy: number; grounded: boolean; jumpHeld: boolean; last: number; collected: string[]; coins: number[]; flagged: boolean; routeStep: number; facing: 1 | -1 }
const fresh = (): Sim => ({ x: 24, y: -1, vy: 0, grounded: false, jumpHeld: false, last: 0, collected: [], coins: [], flagged: false, routeStep: -1, facing: 1 })

function drawCollectible(ctx: CanvasRenderingContext2D, shape: string, x: number, y: number, size: number) {
  ctx.save(); ctx.translate(x, y); ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.shadowColor = '#1b42643d'; ctx.shadowBlur = 5; ctx.shadowOffsetY = 3
  ctx.beginPath()
  if (shape === 'triangle') {
    const fill = ctx.createLinearGradient(0, -size / 2, 0, size / 2); fill.addColorStop(0, '#ffe878'); fill.addColorStop(1, '#f5b918')
    ctx.moveTo(0, -size / 2); ctx.lineTo(size / 2, size / 2); ctx.lineTo(-size / 2, size / 2); ctx.closePath(); ctx.fillStyle = fill; ctx.strokeStyle = '#e87918'
  } else if (shape === 'square') {
    const fill = ctx.createLinearGradient(0, -size / 2, 0, size / 2); fill.addColorStop(0, '#72d5ff'); fill.addColorStop(1, '#1597e0')
    ctx.roundRect(-size / 2, -size / 2, size, size, 6); ctx.fillStyle = fill; ctx.strokeStyle = '#1378bc'
  } else if (shape === 'circle') {
    const fill = ctx.createLinearGradient(0, -size / 2, 0, size / 2); fill.addColorStop(0, '#ffb3d0'); fill.addColorStop(1, '#f15b99')
    ctx.arc(0, 0, size / 2, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.strokeStyle = '#d93c7d'
  } else {
    ctx.roundRect(-size / 2, -size / 3, size, size * 2 / 3, 5); ctx.fillStyle = '#58c878'; ctx.strokeStyle = '#259d50'
  }
  ctx.fill(); ctx.stroke(); ctx.restore()
}

function drawFloatingIsland(ctx: CanvasRenderingContext2D, image: HTMLImageElement, platform: { x: number; y: number; w: number }) {
  if (!image.complete || !image.naturalWidth) return
  const { x, y, w } = platform
  const islandHeight = w * image.naturalHeight / image.naturalWidth
  ctx.save()
  ctx.shadowColor = '#19436155'; ctx.shadowBlur = 7; ctx.shadowOffsetY = 4
  // Scale both dimensions uniformly and align the central grass surface with the collision plane.
  ctx.drawImage(image, x, y - islandHeight * .04, w, islandHeight)
  ctx.restore()
}

function drawTriangleHazard(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save()
  ctx.shadowColor = '#71351666'; ctx.shadowBlur = 4; ctx.shadowOffsetY = 2
  const fill = ctx.createLinearGradient(0, y - 26, 0, y)
  fill.addColorStop(0, '#ffcf42'); fill.addColorStop(1, '#f07821')
  ctx.beginPath(); ctx.moveTo(x, y - 26); ctx.lineTo(x + 13, y); ctx.lineTo(x - 13, y); ctx.closePath()
  ctx.fillStyle = fill; ctx.fill(); ctx.shadowColor = 'transparent'; ctx.strokeStyle = '#bd4d24'; ctx.lineWidth = 2; ctx.stroke()
  ctx.restore()
}

export default function Gameplay({ level, score, coins, onBack, onComplete }: Props) {
  const beginnerLevel = level >= 1 && level <= 3
  const quizzes = useMemo(() => questionsForLevel(level), [level])
  const targets = useMemo(() => targetsForLevel(level), [level])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sim = useRef<Sim>(fresh())
  const directions = useRef<Record<Direction, boolean>>({ left: false, right: false, jump: false })
  const [lives, setLives] = useState(3)
  const [collected, setCollected] = useState<string[]>([])
  const [coinEarned, setCoinEarned] = useState(0)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [flagReached, setFlagReached] = useState(false)
  const [quizIndex, setQuizIndex] = useState(0)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [choice, setChoice] = useState<string | null>(null)
  const [hint, setHint] = useState('')
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const quizOpen = beginnerLevel ? collected.length === targets.length && sim.current.coins.length === 5 && flagReached && !gameOver : activeId !== null
  const question = beginnerLevel ? quizzes[quizIndex] : quizzes[Math.max(0, targets.findIndex(target => target.id === activeId))]

  useEffect(() => { if (lives === 0) setGameOver(true) }, [lives])
  useEffect(() => {
    if (gameOver) return
    const timer = window.setInterval(() => setElapsedSeconds(value => value + 1), 1000)
    return () => window.clearInterval(timer)
  }, [gameOver])
  useEffect(() => {
    if (!beginnerLevel) return
    const unlockMusic = () => startBackgroundMusic()
    startBackgroundMusic()
    window.addEventListener('pointerdown', unlockMusic)
    window.addEventListener('keydown', unlockMusic)
    return () => { window.removeEventListener('pointerdown', unlockMusic); window.removeEventListener('keydown', unlockMusic) }
  }, [beginnerLevel])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const sprite = new Image(); sprite.src = spriteUrl
    const floatingPlatform = new Image(); floatingPlatform.src = floatingPlatformUrl
    let width = 0, height = 0, frame = 0
    const playerW = 44, playerH = 58
    const resize = () => {
      const rect = canvas.getBoundingClientRect(); const dpr = Math.min(devicePixelRatio || 1, 3)
      width = rect.width; height = rect.height
      canvas.width = Math.max(1, Math.round(width * dpr)); canvas.height = Math.max(1, Math.round(height * dpr)); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'
      if (sim.current.y < 0) {
        const terrainWidth = beginnerLevel ? Math.min(width * .92, Math.max(340, height * 1.05)) : width
        const terrainStartX = (width - terrainWidth) / 2
        sim.current.x = beginnerLevel ? terrainStartX + terrainWidth * (level === 2 ? .87 : .035) : width * .06
        sim.current.y = height - 42 - playerH
      }
    }
    const observer = new ResizeObserver(resize); observer.observe(canvas); resize()
    const loop = (time: number) => {
      frame = requestAnimationFrame(loop)
      if (!width || !height) return
      const s = sim.current; const dt = s.last ? Math.min((time - s.last) / 1000, .034) : 0; s.last = time
      const rightToLeft = level === 2
      const terrainWidth = beginnerLevel ? Math.min(width * .92, Math.max(340, height * 1.05)) : width
      const terrainStartX = (width - terrainWidth) / 2
      const ground = beginnerLevel
        ? { x: terrainStartX + terrainWidth * (rightToLeft ? .77 : 0), y: height - 42, w: terrainWidth * .23, h: 48 }
        : { x: 0, y: height - 42, w: width * .28, h: 50 }
      const stairX = level === 1 ? [.02, .21, .40, .59, .78] : level === 2 ? [.78, .59, .40, .21, .02] : level === 3 ? [.05, .28, .08, .31, .11] : []
      const steps = beginnerLevel
        ? stairX.map((x, i) => ({ x: terrainStartX + terrainWidth * x, y: height * (.83 - i * .09), w: terrainWidth * .17, h: 15 }))
        : Array.from({ length: 5 }, (_, i) => ({ x: width * (i % 2 ? .53 : .08), y: height * (.82 - i * .13), w: width * .38, h: 13 }))
      const platforms = beginnerLevel ? [ground, ...steps] : [ground, ...steps, { x: width * .72, y: height - 42, w: width * .28, h: 50 }]
      const hazardStepIndex = level === 1 ? 4 : -1
      const hazardPlatform = beginnerLevel && hazardStepIndex >= 0 ? steps[hazardStepIndex] : undefined
      const hazard = hazardPlatform ? { x: hazardPlatform.x + hazardPlatform.w * .45, y: hazardPlatform.y } : undefined
      const coinPositions = beginnerLevel ? steps.map((step, index) => ({ x: step.x + step.w * .5, y: step.y - 54, index })) : []
      const allItemsFound = beginnerLevel && s.collected.length === targets.length && s.coins.length === coinPositions.length

      if (!quizOpen && !gameOver) {
        if (allItemsFound && !s.flagged) {
          if (s.routeStep < 0) {
            let nearest = 0; let nearestDistance = Number.POSITIVE_INFINITY
            steps.forEach((step, index) => {
              const distance = Math.abs(s.x + playerW / 2 - (step.x + step.w / 2)) + Math.abs(s.y + playerH - step.y)
              if (distance < nearestDistance) { nearest = index; nearestDistance = distance }
            })
            s.routeStep = nearest
          }
          const nextStep = Math.min(4, s.routeStep + 1)
          const finishX = Math.max(0, Math.min(width * .95, steps[4].x + steps[4].w * .88))
          const targetX = nextStep < 4 ? steps[nextStep].x + steps[nextStep].w / 2 - playerW / 2 : finishX - playerW / 2
          if (targetX !== s.x) s.facing = targetX > s.x ? 1 : -1
          s.x += Math.sign(targetX - s.x) * Math.min(Math.abs(targetX - s.x), 150 * dt)
          directions.current.left = false; directions.current.right = false; directions.current.jump = false
        } else {
          const horizontal = Number(directions.current.right) - Number(directions.current.left)
          if (horizontal !== 0) s.facing = horizontal > 0 ? 1 : -1
          s.x = Math.max(0, Math.min(width - playerW, s.x + horizontal * 195 * dt))
        }
        if (!allItemsFound && directions.current.jump && !s.jumpHeld && s.grounded) { s.vy = -490; s.grounded = false }
        s.jumpHeld = !allItemsFound && directions.current.jump
        const priorBottom = s.y + playerH; s.vy += 1350 * dt; s.y += s.vy * dt; s.grounded = false
        if (s.vy >= 0) for (let i = 0; i < platforms.length; i++) {
          const p = platforms[i]
          const supportedWidth = s.x + playerW * .72 > p.x && s.x + playerW * .28 < p.x + p.w
          if (supportedWidth && priorBottom <= p.y + 5 && s.y + playerH >= p.y) {
            s.y = p.y - playerH; s.vy = 0; s.grounded = true
            if (beginnerLevel && allItemsFound && i > 0 && i <= 5) s.routeStep = Math.max(s.routeStep, i - 1)
            break
          }
        }

        if ((beginnerLevel && s.y > height + 25) || (!beginnerLevel && s.y > height + 35)) {
          s.x = beginnerLevel ? terrainStartX + terrainWidth * (level === 2 ? .87 : .035) : width * .06
          s.y = height - 42 - playerH; s.vy = 0; s.grounded = false
          setLives(value => Math.max(0, value - 1)); playGameSound('fall')
        }

        if (hazard && !allItemsFound) {
          // Use the character's foot point against the triangular shape, not a wide rectangular box.
          const footX = s.x + playerW / 2
          const footY = s.y + playerH * .82
          const hazardTop = hazard.y - 26
          const overlapsHazardHeight = footY >= hazardTop && footY <= hazard.y
          const triangleHalfWidth = overlapsHazardHeight ? 13 * ((footY - hazardTop) / 26) : 0
          const hitHazard = overlapsHazardHeight && Math.abs(footX - hazard.x) <= triangleHalfWidth
          if (hitHazard) {
            if (s.grounded) {
              // A top landing remains supported by the platform; stop at the obstacle until jumped over.
              s.x = s.facing > 0 ? hazard.x - playerW - 14 : hazard.x + 14
              s.y = hazard.y - playerH; s.vy = 0; s.jumpHeld = false
            } else {
              s.x = terrainStartX + terrainWidth * (level === 2 ? .87 : .035)
              s.y = height - 42 - playerH; s.vy = 0; s.grounded = false; s.jumpHeld = false
              setLives(value => Math.max(0, value - 1)); playGameSound('fall')
            }
          }
        }

        targets.forEach(target => {
          const p = platforms[target.platform]; if (!p) return
          const tx = beginnerLevel ? p.x + p.w * (target.offset ?? .5) : width * target.x; const ty = p.y - 19
          const overlap = s.x + playerW > tx - 18 && s.x < tx + 18 && s.y + playerH > ty - 18 && s.y < ty + 18
          if (!s.collected.includes(target.id) && overlap) {
            if (beginnerLevel) {
              s.collected.push(target.id); setCollected([...s.collected]); playGameSound('collect')
            } else {
              setActiveId(target.id); setQuizIndex(targets.findIndex(item => item.id === target.id))
              directions.current.left = false; directions.current.right = false; directions.current.jump = false
            }
          }
        })
        coinPositions.forEach(coin => {
          const overlap = s.x + playerW > coin.x - 12 && s.x < coin.x + 12 && s.y + playerH > coin.y - 12 && s.y < coin.y + 12
          if (!s.coins.includes(coin.index) && overlap) { s.coins.push(coin.index); setCoinEarned(s.coins.length); playGameSound('coin') }
        })
        const finishX = Math.max(0, Math.min(width * .95, steps[4].x + steps[4].w * .88))
        if (allItemsFound && !s.flagged && s.grounded && s.x + playerW >= finishX - width * .025 && s.y <= steps[4].y - playerH + 6) {
          s.flagged = true; setFlagReached(true); playGameSound('finish')
        } else if (allItemsFound && !s.flagged && s.grounded) {
          // Once every shape and coin is collected, Satik automatically hops up the close stairs to the flag.
          s.vy = -435; s.grounded = false
        }
      }

      // Keep the canvas transparent so the single full-screen CSS background remains continuous.
      ctx.clearRect(0, 0, width, height)
      platforms.forEach(platform => drawFloatingIsland(ctx, floatingPlatform, platform))
      if (hazard) drawTriangleHazard(ctx, hazard.x, hazard.y)
      if (beginnerLevel) {
        const top = steps[4]; const fx = Math.max(0, Math.min(width * .95, top.x + top.w * .88)); const fy = top.y
        ctx.strokeStyle = '#805333'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(fx, fy - 57); ctx.stroke()
        ctx.fillStyle = '#f25252'; ctx.beginPath(); ctx.moveTo(fx + 2, fy - 56); ctx.lineTo(fx + 31, fy - 46); ctx.lineTo(fx + 2, fy - 36); ctx.closePath(); ctx.fill()
        coinPositions.forEach(coin => { if (!s.coins.includes(coin.index)) { ctx.font = '22px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('🪙', coin.x, coin.y); ctx.textAlign = 'start' } })
      } else {
        ctx.fillStyle = '#70cb4e'; ctx.fillRect(width * .72, height - 42, width * .28, 11); ctx.fillStyle = '#825535'; ctx.fillRect(width * .72, height - 31, width * .28, 31)
      }
      targets.forEach(target => { if (!s.collected.includes(target.id)) { const p = platforms[target.platform]; if (!p) return; const x = beginnerLevel ? p.x + p.w * (target.offset ?? .5) : width * target.x; if (beginnerLevel) drawCollectible(ctx, target.shape, x, p.y - 18, 31); else { ctx.font = '30px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(target.symbol, x, p.y - 12) }; if (!beginnerLevel) { ctx.font = '10px sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#174879'; ctx.fillText(target.label, x, p.y + 2); ctx.fillStyle = '#fff'; ctx.textAlign = 'start' } } })
      if (sprite.complete && sprite.naturalWidth) {
        const cellW = sprite.naturalWidth / 3
        const airborne = !s.grounded
        const frameIndex = airborne ? 2 : Math.floor(time / 180) % 2
        const sourceY = airborne ? 1184 : 1396
        const sourceHeight = airborne ? 1388 : 1432
        ctx.save(); ctx.translate(s.x + playerW / 2, s.y); ctx.scale(s.facing, 1)
        ctx.drawImage(sprite, frameIndex * cellW, sourceY, cellW, sourceHeight, -playerW / 2, 0, playerW, playerH)
        ctx.restore()
      }
      else { ctx.fillStyle = '#ffc12c'; ctx.beginPath(); ctx.moveTo(s.x + playerW / 2, s.y); ctx.lineTo(s.x + playerW, s.y + playerH); ctx.lineTo(s.x, s.y + playerH); ctx.closePath(); ctx.fill() }
    }
    frame = requestAnimationFrame(loop)
    const release = () => { directions.current.left = false; directions.current.right = false; directions.current.jump = false }
    const keydown = (e: KeyboardEvent) => { if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') { directions.current.left = true; sim.current.facing = -1 }; if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') { directions.current.right = true; sim.current.facing = 1 }; if (e.key === ' ' || e.key === 'ArrowUp') directions.current.jump = true }
    window.addEventListener('keydown', keydown); window.addEventListener('keyup', release); window.addEventListener('blur', release)
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener('keydown', keydown); window.removeEventListener('keyup', release); window.removeEventListener('blur', release) }
  }, [targets, quizOpen, gameOver, level, beginnerLevel, flagReached])

  function answer(option: string) {
    if (choice !== null) return
    setChoice(option)
    if (option === question.answer) { setCorrectAnswers(value => value + 1); playGameSound('correct') }
    else { setHint(`Petunjuk: ${question.explanation} Coba lagi.`); playGameSound('wrong') }
  }
  function nextQuestion() {
    if (!beginnerLevel) {
      if (choice === null || activeId === null) return
      const nextCollected = [...collected, activeId]; sim.current.collected.push(activeId)
      setCollected(nextCollected); setActiveId(null); setChoice(null); setHint(''); return
    }
    if (choice !== question.answer) { setChoice(null); return }
    if (quizIndex === quizzes.length - 1) {
      onComplete({ score: score + 100, earned: 100, correct: quizzes.length, total: quizzes.length, rewardCoins: 100 + coinEarned, coinBonus: coinEarned }); return
    }
    setQuizIndex(index => index + 1); setChoice(null); setHint('')
  }
  function finishLegacyLevel() {
    onComplete({ score: score + 100, earned: 100, correct: correctAnswers, total: quizzes.length, rewardCoins: 100 + coinEarned, coinBonus: coinEarned })
  }
  function retry() { sim.current = fresh(); directions.current = { left: false, right: false, jump: false }; setCollected([]); setCoinEarned(0); setLives(3); setFlagReached(false); setGameOver(false); setQuizIndex(0); setActiveId(null); setChoice(null); setHint(''); setCorrectAnswers(0); setElapsedSeconds(0) }
  function hold(direction: Direction, active: boolean) {
    if (active && beginnerLevel) startBackgroundMusic()
    if (active && direction === 'left') sim.current.facing = -1
    if (active && direction === 'right') sim.current.facing = 1
    directions.current[direction] = active
  }

  return <section className={`gameplay-screen${beginnerLevel ? ' gameplay-screen--mobile' : ''}`} aria-label={`Eksplorasi level ${level}`}>
    <GameStatusBar score={score} coins={coins + coinEarned} lives={lives} elapsedSeconds={elapsedSeconds} onBack={onBack} />
    <div className="gameplay-title"><span>{beginnerLevel ? `LEVEL ${level} · ${titleForLevel(level).toUpperCase()}` : `LEVEL ${level} · EKSPLORASI`}</span><strong>{beginnerLevel ? (quizOpen ? 'Jawab 5 soal!' : flagReached ? 'Bendera tercapai!' : 'Kumpulkan bentuk dan koin, lalu menuju bendera!') : 'Jelajahi pulau dan sentuh tantangannya!'}</strong><div className="gameplay-progress"><i style={{ width: `${collected.length / targets.length * 100}%` }} /></div><small>{beginnerLevel ? `${collected.length}/${targets.length} bentuk · ${coinEarned}/5 koin` : `${collected.length}/${targets.length} tantangan ditemukan`}</small></div>
    <canvas ref={canvasRef} className="gameplay-canvas" aria-label="Gerakkan karakter dengan tombol di layar atau tombol panah, lompat menaiki tangga, kumpulkan semua bentuk dan koin, lalu capai bendera." />
    <div className="gameplay-controls" aria-label="Kontrol permainan">{(['left', 'right', 'jump'] as Direction[]).map(direction => <button key={direction} className={direction === 'jump' ? 'gameplay-controls__jump' : ''} type="button" onPointerDown={() => hold(direction, true)} onPointerUp={() => hold(direction, false)} onPointerLeave={() => hold(direction, false)} aria-label={direction === 'left' ? 'Kiri' : direction === 'right' ? 'Kanan' : 'Lompat'}>{direction === 'left' ? '◀' : direction === 'right' ? '▶' : <>⬆<small>LOMPAT</small></>}</button>)}</div>
    {quizOpen && !gameOver && <div className={`quiz-backdrop${beginnerLevel ? ' quiz-backdrop--big' : ''}`}><section className={`quiz-card${beginnerLevel ? ' quiz-card--big' : ''}`} role="dialog" aria-modal="true" aria-labelledby="quiz-title"><div className="quiz-card__handle"/><div className="quiz-card__celebration" aria-hidden="true">⭐　🎉　⭐</div><p className="quiz-card__eyebrow">{beginnerLevel ? `GERBANG SOAL · ${quizIndex + 1}/${quizzes.length}` : `TANTANGAN · ${collected.length + 1}/${quizzes.length}`}</p><div className="quiz-card__progress"><i style={{ width: `${((quizIndex + 1) / quizzes.length) * 100}%` }} /></div>{level === 3 && question.illustration ? <QuizObjectIllustration kind={question.illustration} label={question.object} /> : question.illustration === 'house' ? <div className="quiz-card__illustration quiz-card__illustration--house" aria-label="Atap rumah berbentuk segitiga"><span>🏠</span></div> : <div className={`quiz-card__shape quiz-card__shape--${question.shape}`}>{question.symbol}</div>}<h2 id="quiz-title">{question.prompt}</h2><div className="quiz-options">{question.options.map(option => <button data-sfx-handled="true" key={option} type="button" onClick={() => answer(option)} className={`quiz-option${choice === option ? (choice === question.answer ? ' is-answer' : ' is-wrong') : ''}`}><span>{choice === option ? (choice === question.answer ? '✓' : '×') : ''}</span>{option}</button>)}</div>{choice && <div className={`quiz-feedback ${choice === question.answer ? 'is-right' : 'is-wrong'}`} role="status"><strong>{choice === question.answer ? 'Benar! +100 poin 🎉' : 'Belum tepat, poin tetap aman.'}</strong><span>{choice === question.answer ? question.explanation : (beginnerLevel ? hint : `Jawaban yang tepat: ${question.answer}. ${question.explanation}`)}</span></div>}<button className="game-action game-action--yellow quiz-continue" onClick={nextQuestion} disabled={choice === null} type="button">{beginnerLevel ? (choice === question.answer ? (quizIndex === quizzes.length - 1 ? 'Selesaikan level' : 'Soal berikutnya') : 'Coba lagi') : 'Lanjutkan'} <span>➜</span></button></section></div>}
    {!beginnerLevel && collected.length === targets.length && !activeId && <button className="gameplay-finish" onClick={finishLegacyLevel} type="button">Selesaikan level <span>→</span></button>}
    {gameOver && <div className="quiz-backdrop"><section className="quiz-card" role="dialog" aria-modal="true"><div className="quiz-card__shape">💛</div><h2>Game Over</h2><p>Nyawa habis. Coba lagi dari awal level ini.</p><button className="game-action game-action--yellow quiz-continue" onClick={retry} type="button">Ulangi Lagi ↻</button><button className="game-action game-action--white quiz-continue" onClick={onBack} type="button">Kembali</button></section></div>}
  </section>
}

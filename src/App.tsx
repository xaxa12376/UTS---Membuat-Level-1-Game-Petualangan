import { useEffect, useState } from 'react'
import './App.css'
import AdventureMap from './components/AdventureMap'
import AdventureScene from './components/AdventureScene'
import BottomNavigation, { type NavigationItem } from './components/BottomNavigation'
import GameHeader from './components/GameHeader'
import LevelDetail from './components/LevelDetail'
import Gameplay from './components/Gameplay'
import LevelComplete from './components/LevelComplete'
import './components/LevelFlow.css'
import OtherScreens from './components/OtherScreens'
import { playGameSound, startBackgroundMusic } from './data/gameAudio'

type SavedProgress = { unlockedLevel: number; completedLevels: number[]; stars: number; score: number }
const progressKey = 'petualangan-bangun-datar-progress-pulau1-reset-v3'
const previousProgressKey = 'petualangan-bangun-datar-progress-pulau1-reset-v2'

function readProgress(): SavedProgress {
  try {
    const current = localStorage.getItem(progressKey)
    const saved = JSON.parse(current ?? localStorage.getItem(previousProgressKey) ?? 'null') as Partial<SavedProgress> | null
    if (!current && saved) {
      // Reset hanya status level; pertahankan skor yang sudah tersimpan.
      const reset: SavedProgress = { unlockedLevel: 1, completedLevels: [], stars: 0, score: Math.max(0, Number(saved.score) || 0) }
      localStorage.setItem(progressKey, JSON.stringify(reset))
      return reset
    }
    if (saved && Array.isArray(saved.completedLevels)) {
      const completedLevels = [...new Set(saved.completedLevels.filter((level) => Number.isInteger(level) && level >= 1 && level <= 30))]
      let unlockedLevel = 1
      while (completedLevels.includes(unlockedLevel) && unlockedLevel < 30) unlockedLevel += 1
      return {
        unlockedLevel,
        completedLevels,
        // Setiap level selesai memberikan tepat tiga bintang.
        stars: completedLevels.length * 3,
        score: Math.max(0, Number(saved.score) || 0),
      }
    }
  } catch {
    // Mulai dari progres baru jika data tersimpan tidak dapat dibaca.
  }
  return { unlockedLevel: 1, completedLevels: [], stars: 0, score: 0 }
}

function App() {
  const [activeTab, setActiveTab] = useState<NavigationItem>('Beranda')
  const [progress, setProgress] = useState<SavedProgress>(readProgress)
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null)
  const [flowStage, setFlowStage] = useState<'detail' | 'game' | 'result'>('detail')
  const [quizResult, setQuizResult] = useState({ score: 0, earned: 0, correct: 0, total: 5, rewardCoins: 100, coinBonus: 0 })
  const [coins, setCoins] = useState(45)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    startBackgroundMusic()
    const onButtonClick = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return
      const button = target.closest('button')
      if (!button || button.disabled) return
      startBackgroundMusic()
      if (button.dataset.sfxHandled !== 'true') playGameSound('click')
    }
    document.addEventListener('click', onButtonClick, true)
    return () => document.removeEventListener('click', onButtonClick, true)
  }, [])

  function chooseLevel(level: number) {
    if (level > progress.unlockedLevel) {
      setNotice(`Selesaikan level ${progress.unlockedLevel} terlebih dahulu untuk membuka level ${level}.`)
      return
    }
    setNotice('')
    setFlowStage('detail')
    setSelectedLevel(level)
  }

  function finishLevel(level: number) {
    const alreadyCompleted = progress.completedLevels.includes(level)
    setProgress((current) => {
      const alreadyCompleted = current.completedLevels.includes(level)
      const next: SavedProgress = {
        completedLevels: alreadyCompleted ? current.completedLevels : [...current.completedLevels, level].sort((a, b) => a - b),
        unlockedLevel: Math.min(30, Math.max(current.unlockedLevel, level + 1)),
        stars: current.stars + (alreadyCompleted ? 0 : 3),
        score: quizResult.score,
      }
      try { localStorage.setItem(progressKey, JSON.stringify(next)) } catch { /* Progres tetap aktif selama aplikasi terbuka. */ }
      return next
    })
    setSelectedLevel(null)
    setCoins(current => current + quizResult.rewardCoins)
    setActiveTab('Peta')
    setNotice(alreadyCompleted ? `Level ${level} selesai!` : `Hebat! Level ${level} selesai dan 3 bintang didapat.`)
  }

  const isPlaying = selectedLevel !== null
  const isOnMap = activeTab === 'Peta'
  const missionProgress = Math.min(progress.completedLevels.length, 3)

  return (
    <main className={`game-home${isOnMap ? ' game-home--map' : ''}${isPlaying ? ' game-home--playing' : ''}`}>
      {isPlaying ? (
        flowStage === 'detail' ? (
          <LevelDetail level={selectedLevel} completed={progress.completedLevels.includes(selectedLevel)} score={progress.score} coins={coins} onBack={() => setSelectedLevel(null)} onStart={() => setFlowStage('game')} />
        ) : flowStage === 'game' ? (
          <Gameplay level={selectedLevel} score={progress.score} coins={coins} onBack={() => setFlowStage('detail')} onComplete={(result) => { setQuizResult(result); setFlowStage('result') }} />
        ) : (
          <LevelComplete level={selectedLevel} {...quizResult} coins={coins + quizResult.coinBonus} onContinue={() => finishLevel(selectedLevel)} onRetry={() => setFlowStage('game')} />
        )
      ) : isOnMap ? (
        <AdventureMap
          notice={notice}
          unlockedLevel={progress.unlockedLevel}
          completedLevels={progress.completedLevels}
          starCount={120 + progress.stars}
          coinCount={coins}
          onBack={() => { setNotice(''); setActiveTab('Beranda') }}
          onSelectLevel={chooseLevel}
          onShowMission={() => setNotice(`Misi harian: selesaikan 3 level dengan nilai sempurna. Progres ${missionProgress}/3.`)}
          onShowCollection={() => setNotice(`Koleksi bintang: ${progress.stars} bintang terkumpul.`)}
          onDismissNotice={() => setNotice('')}
        />
      ) : (
        <>
          <div className="game-home__landscape" aria-hidden="true" />
          <GameHeader starCount={120 + progress.stars} coinCount={coins} missionProgress={missionProgress} playerLevel={progress.unlockedLevel} />
          {activeTab === 'Beranda' ? (
            <AdventureScene onStartAdventure={() => { setNotice(''); setActiveTab('Peta') }} />
          ) : (
            <OtherScreens
              tab={activeTab}
              stars={120 + progress.stars}
              unlockedLevel={progress.unlockedLevel}
              completedLevels={progress.completedLevels}
            />
          )}
        </>
      )}
      {!isPlaying && <BottomNavigation activeItem={activeTab} onSelect={(item) => { setNotice(''); setActiveTab(item) }} />}
    </main>
  )
}

export default App


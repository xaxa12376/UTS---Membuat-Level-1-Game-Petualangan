type Props = { score: number; coins: number; lives?: number; elapsedSeconds?: number; onBack: () => void }
function formatElapsedTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0')
  const seconds = (totalSeconds % 60).toString().padStart(2, '0')
  return `${minutes}:${seconds}`
}
export default function GameStatusBar({ score, coins, lives, elapsedSeconds, onBack }: Props) {
  return <header className="game-status" aria-label="Status permainan">
    <button className="game-status__back" onClick={onBack} type="button" aria-label="Kembali"><span>‹</span></button>
    {lives !== undefined && <div className="game-status__lives" aria-label={`${lives} dari 3 nyawa tersisa`}>{[0, 1, 2].map(index => <span key={index} aria-hidden="true">{index < lives ? '❤️' : '🤍'}</span>)}</div>}
    {elapsedSeconds !== undefined && <div className="game-status__timer" aria-label={`Waktu bermain ${formatElapsedTime(elapsedSeconds)}`}><span aria-hidden="true">⏱</span><strong>{formatElapsedTime(elapsedSeconds)}</strong></div>}
    <div className="game-status__counter"><span aria-hidden="true">⭐</span><strong>{score}</strong></div>
    <div className="game-status__counter game-status__counter--coin"><span aria-hidden="true">🪙</span><strong>{coins}</strong></div>
  </header>
}

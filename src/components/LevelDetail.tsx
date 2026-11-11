import GameStatusBar from './GameStatusBar'
import explorer from '../assets/game-explorer.png'
import sign from '../assets/game-sign.png'
import { titleForLevel, targetsForLevel } from '../data/questions'

type Props = { level: number; completed: boolean; score: number; coins: number; onBack: () => void; onStart: () => void }
export default function LevelDetail({ level, completed, score, coins, onBack, onStart }: Props) {
  return <section className="level-screen level-detail" aria-label={`Detail level ${level}`}>
    <GameStatusBar score={score} coins={coins} onBack={onBack} />
    <div className="level-detail__heading"><span>{level <= 3 ? 'PULAU BENTUK' : 'GERBANG PULAU'}</span><h1>Level {level}: {level <= 3 ? titleForLevel(level) : 'Gerbang Pulau Bentuk'}</h1></div>
    <article className="level-detail__info">
      <strong>Tujuan pembelajaran</strong><p>{[
        'Siswa mampu mengenali segitiga, persegi, dan lingkaran dari tampilannya.',
        'Siswa mampu menyebutkan jumlah sisi dan titik sudut pada bangun datar sederhana.',
        'Siswa mampu mengidentifikasi bangun datar pada benda-benda sehari-hari.',
      ][level - 1] ?? 'Mengenali persegi, segitiga, persegi panjang, dan lingkaran.'}</p>
      <div className="level-detail__stars" aria-label={level <= 3 ? 'Maksimal tiga bintang' : 'Target empat bintang'}>{level <= 3 ? '☆ ☆ ☆' : '☆ ☆ ☆ ☆'}</div>
      <div className="level-detail__meta"><span>◷ &nbsp;3–5 menit</span><span>◎ &nbsp;{level <= 3 ? `${targetsForLevel(level).length} target · 5 soal` : '3 tantangan'}</span></div>
      {level <= 3 && <div className="level-detail__steps"><span>01 Pahami</span><span>02 Jelajahi</span><span>03 Kumpulkan</span><span>04 Jawab</span></div>}
    </article>
    <div className="level-detail__scene" aria-label="Maskot menuju gerbang istana">
      <img className="level-detail__sign" src={sign} alt="Papan petunjuk" /><img className="level-detail__hero" src={explorer} alt="Maskot segitiga penjelajah" />
    </div>
    <div className="level-detail__bottom">{completed && <p>Level ini sudah pernah diselesaikan. Kamu bisa bermain lagi!</p>}<button className="game-action game-action--yellow" onClick={onStart} type="button">Mulai <span>➜</span></button></div>
  </section>
}

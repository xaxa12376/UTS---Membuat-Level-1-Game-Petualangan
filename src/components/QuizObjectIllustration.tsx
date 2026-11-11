import type { ShapeQuestion } from '../data/questions'

type Props = { kind: NonNullable<ShapeQuestion['illustration']>; label: string }

export default function QuizObjectIllustration({ kind, label }: Props) {
  return <div className={`quiz-object-art quiz-object-art--${kind}`} role="img" aria-label={label}>
    <svg viewBox="0 0 240 120" aria-hidden="true">
      {kind === 'clock' && <>
        <circle cx="120" cy="60" r="43" fill="#fff" stroke="#3d83bd" strokeWidth="8" />
        <circle cx="120" cy="60" r="3.5" fill="#27537b" />
        <path d="M120 60V31M120 60l23 12" fill="none" stroke="#27537b" strokeWidth="5" strokeLinecap="round" />
        <path d="M120 22v5M158 60h-5M120 98v-5M82 60h5" stroke="#86b8dc" strokeWidth="3" strokeLinecap="round" />
      </>}
      {kind === 'house' && <>
        <path d="M55 59 120 14l65 45" fill="#ee9646" stroke="#a9512e" strokeWidth="7" strokeLinejoin="round" />
        <path d="M70 56v48h100V56l-50-35z" fill="#ffe6aa" stroke="#a9512e" strokeWidth="5" strokeLinejoin="round" />
        <rect x="107" y="69" width="27" height="35" rx="3" fill="#8ec9ee" stroke="#fff" strokeWidth="4" />
      </>}
      {kind === 'tile' && <>
        <rect x="65" y="8" width="110" height="104" rx="8" fill="#e89a5b" stroke="#ad6338" strokeWidth="5" />
        <path d="M120 10v100M67 60h106" stroke="#fff1d5" strokeWidth="6" />
        <path d="M72 15h42v40H72zM126 65h43v39h-43z" fill="#f6c17b" opacity=".8" />
      </>}
      {kind === 'door' && <>
        <rect x="77" y="9" width="86" height="103" rx="8" fill="#b76a3c" stroke="#82442d" strokeWidth="6" />
        <rect x="89" y="21" width="62" height="77" rx="4" fill="#e8aa66" stroke="#f8d3a0" strokeWidth="4" />
        <circle cx="139" cy="62" r="4" fill="#fff0a4" />
      </>}
      {kind === 'wheel' && <>
        <circle cx="120" cy="60" r="46" fill="#f7fbff" stroke="#3f5365" strokeWidth="8" />
        <circle cx="120" cy="60" r="7" fill="#f2a72e" stroke="#3f5365" strokeWidth="3" />
        <path d="M120 14v92M74 60h92M88 28l64 64M152 28 88 92" stroke="#71889b" strokeWidth="3" />
      </>}
    </svg>
  </div>
}

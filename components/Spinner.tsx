export default function Spinner({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      style={{ animation: 'btn-spin 0.65s linear infinite', flexShrink: 0, display: 'inline-block' }}
    >
      <style>{`@keyframes btn-spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="8" cy="8" r="6" fill="none" stroke={color} strokeOpacity="0.25" strokeWidth="2.5"/>
      <path d="M8 2 A6 6 0 0 1 14 8" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  )
}

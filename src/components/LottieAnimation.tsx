import { Suspense, lazy, type CSSProperties } from 'react'

const LottiePlayer = lazy(() =>
  import('lottie-react').then(m => ({ default: m.default }))
)

interface LottieAnimationProps {
  animationPath?: string
  animationData?: object
  style?: CSSProperties
  loop?: boolean
  autoplay?: boolean
  className?: string
}

// Placeholder while animation loads or if animation is missing
function AnimationPlaceholder({ style, className }: { style?: CSSProperties; className?: string }) {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    />
  )
}

export function LottieAnimation({
  animationData,
  style,
  loop = true,
  autoplay = true,
  className,
}: LottieAnimationProps) {
  if (!animationData) {
    return <AnimationPlaceholder style={style} className={className} />
  }

  return (
    <Suspense fallback={<AnimationPlaceholder style={style} className={className} />}>
      <LottiePlayer
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        style={style}
        className={className}
      />
    </Suspense>
  )
}

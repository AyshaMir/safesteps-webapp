import {
  WarningCircle,
  Tray,
  WifiSlash,
} from '@phosphor-icons/react'

export function LoadingState() {
  return (
    <div className="loading-state" role="status" aria-label="Loading">
      <div className="skeleton skeleton-heading" />
      <div className="skeleton skeleton-card" />
      <div className="skeleton skeleton-card" />
      <div className="skeleton skeleton-card" />
    </div>
  )
}

export function EmptyState({
  title = 'Nothing here yet',
  message,
  actionLabel,
  onAction,
}) {
  return (
    <div className="ui-state empty-state">
      <Tray size={48} weight="duotone" />

      <h3>{title}</h3>
      <p>{message}</p>

      {actionLabel && onAction && (
        <button onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export function ErrorState({
  message = 'Something went wrong. Please try again.',
  onRetry,
}) {
  return (
    <div className="ui-state error-state" role="alert">
      <WarningCircle size={48} weight="duotone" />

      <h3>Unable to load</h3>
      <p>{message}</p>

      {onRetry && (
        <button onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  )
}

export function OfflineState() {
  return (
    <div className="offline-state" role="status">
      <WifiSlash size={24} weight="duotone" />

      <div>
        <strong>You're offline</strong>
        <p>Some features may be unavailable.</p>
      </div>
    </div>
  )
}
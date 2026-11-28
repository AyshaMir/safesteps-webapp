import Button from './Button';

// Warning amber box with "!". Pass onRetry to show "Try again".
export default function WarningBox({ title, children, onRetry }) {
  return (
    <div className="warning-box" role="alert">
      <span className="bang bang--lg" aria-hidden="true">!</span>
      <div>
        {title && <p className="warning-box__title">{title}</p>}
        {children && <div className="warning-box__body">{children}</div>}
        {onRetry && (
          <Button variant="secondary" className="btn--small" onClick={onRetry}>
            Try again
          </Button>
        )}
      </div>
    </div>
  );
}

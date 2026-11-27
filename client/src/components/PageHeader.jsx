import { ArrowLeft } from '@phosphor-icons/react'

function PageHeader({ title, subtitle, onBack }) {
  return (
    <div className="shared-page-header">
      {onBack && (
        <button
          className="back-button"
          aria-label="Go back"
          onClick={onBack}
          type="button"
        >
          <ArrowLeft size={26} weight="bold" />
        </button>
      )}

      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
  )
}

export default PageHeader
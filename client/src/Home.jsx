import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from './components/Layout'
import { useAuth } from './context/useAuth'
import { api } from './api/api'

import {
  PhoneCall,
  X,
  CaretDown,
  CaretRight,
  UserCircle,
} from '@phosphor-icons/react'

function Home() {
  const navigate = useNavigate()
  const { user, ready } = useAuth()

  const [showContacts, setShowContacts] = useState(false)
  const [prepResult, setPrepResult] = useState(null)

  const sheetRef = useRef(null)
  const contactButtonRef = useRef(null)

  const userId = user?.id

  // Fetch preparedness data for the signed-in user
  useEffect(() => {
    if (!userId) return

    let cancelled = false

    api('/prepare')
      .then(data => {
        if (!cancelled) {
          setPrepResult({ userId, data })
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPrepResult({ userId, data: null })
        }
      })

    return () => {
      cancelled = true
    }
  }, [userId])

  const prep =
    userId && prepResult?.userId === userId
      ? prepResult.data
      : null

  const preparedness = prep?.score ?? null
  const contacts = prep?.contacts ?? []

  // Contact bottom sheet accessibility
  useEffect(() => {
    if (!showContacts) return

    const contactButton = contactButtonRef.current
    const previousOverflow = document.body.style.overflow

    document.body.style.overflow = 'hidden'

    sheetRef.current?.querySelector('button')?.focus()

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setShowContacts(false)
      }

      if (e.key === 'Tab') {
        const elements = sheetRef.current?.querySelectorAll(
          'button:not([disabled]), a[href]'
        )

        if (!elements?.length) return

        const first = elements[0]
        const last = elements[elements.length - 1]

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      contactButton?.focus()
    }
  }, [showContacts])

  return (
    <Layout>
      <section className="home-page">

        {/* Greeting */}
        <div className="home-greeting">
          <h2>
            {user
              ? `Hi, ${user.name.trim().split(' ')[0]}`
              : 'Welcome to SafeSteps'}
          </h2>

          <p>
            {user
              ? 'Welcome back.'
              : 'Stay safe. Stay prepared.'}
          </p>
        </div>

        {/* Emergency Mode — available to everyone */}
        <button
          className="emergency-button"
          onClick={() => navigate('/emergency')}
        >
          <span>I need</span>
          <span>help now</span>
        </button>

        {/* Signed-out experience */}
        {ready && !user && (
          <div className="home-signin">
            <div className="home-signin__head">
              <div className="home-signin__icon">
                <UserCircle size={28} />
              </div>

              <div>
                <h3 className="home-signin__title">
                  Be prepared
                </h3>

                <p className="home-signin__text">
                  Sign in to save your emergency plan,
                  kit checklist and emergency contacts.
                </p>
              </div>
            </div>

            <div className="home-signin__actions">
              <button
                className="shared-button primary"
                onClick={() => navigate('/login')}
              >
                Sign in
              </button>

              <button
                className="shared-button secondary"
                onClick={() => navigate('/signup')}
              >
                Create account
              </button>
            </div>
          </div>
        )}

        {/* Signed-in experience */}
        {user && (
          <>
            {/* Emergency readiness */}
            <button
              className="home-card readiness-card"
              onClick={() => navigate('/prepare')}
            >
              <div
                className="readiness-ring"
                style={{
                  '--progress': `${preparedness ?? 0}%`,
                }}
              >
                <span>
                  {preparedness === null
                    ? '—'
                    : `${preparedness}%`}
                </span>
              </div>

              <div className="home-card-text">
                <span className="card-label">
                  Emergency readiness
                </span>

                <strong>
                  {preparedness === null
                    ? 'View your preparedness'
                    : `You are ${preparedness}% ready`}
                </strong>
              </div>

              <CaretRight
                size={24}
                weight="duotone"
                className="card-arrow"
              />
            </button>

            {/* Contact shortcut */}
            <button
              ref={contactButtonRef}
              className="home-card contact-card"
              onClick={() => setShowContacts(true)}
            >
              <div className="contact-avatars">
                {contacts.length > 0 ? (
                  <>
                    {contacts.slice(0, 2).map(contact => (
                      <span key={contact._id}>
                        {contact.name[0].toUpperCase()}
                      </span>
                    ))}

                    {contacts.length > 2 && (
                      <span>+{contacts.length - 2}</span>
                    )}
                  </>
                ) : (
                  <span>
                    <PhoneCall size={24} />
                  </span>
                )}
              </div>

              <div className="home-card-text">
                <strong>Call someone</strong>
                <span className="card-label">
                  Choose from your contacts
                </span>
              </div>

              <CaretDown
                size={24}
                weight="duotone"
                className="card-arrow"
              />
            </button>
          </>
        )}

      </section>

      {/* Contact bottom sheet */}
      {user && showContacts && (
        <div
          className="contact-overlay"
          onClick={() => setShowContacts(false)}
        >
          <section
            ref={sheetRef}
            className="contact-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-sheet-title"
            onClick={e => e.stopPropagation()}
          >
            <div className="sheet-handle" />

            <div className="sheet-header">
              <h2 id="contact-sheet-title">
                Call someone
              </h2>

              <button
                className="sheet-close"
                aria-label="Close contacts"
                onClick={() => setShowContacts(false)}
              >
                <X size={24} weight="bold" />
              </button>
            </div>

            <p>Choose from your emergency contacts.</p>

            {!prep ? (
              <p>Saved contacts are currently unavailable.</p>
            ) : contacts.length === 0 ? (
              <>
                <p>You have no saved emergency contacts.</p>

                <button
                  className="shared-button primary"
                  onClick={() => {
                    setShowContacts(false)
                    navigate('/prepare/contacts')
                  }}
                >
                  Add emergency contacts
                </button>
              </>
            ) : (
              contacts.map(contact => (
                <div
                  className="sheet-contact"
                  key={contact._id}
                >
                  <div className="contact-avatar">
                    {contact.name[0].toUpperCase()}
                  </div>

                  <div className="sheet-contact-details">
                    <strong>{contact.name}</strong>
                    <small>{contact.relation}</small>
                  </div>

                  <a
                    className="sheet-call-button"
                    href={`tel:${contact.phone}`}
                    aria-label={`Call ${contact.name}`}
                  >
                    <PhoneCall size={22} weight="fill" />
                  </a>
                </div>
              ))
            )}

            <button
              className="sheet-cancel"
              onClick={() => setShowContacts(false)}
            >
              Cancel
            </button>

          </section>
        </div>
      )}

    </Layout>
  )
}

export default Home
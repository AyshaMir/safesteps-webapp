import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PhoneCall } from '@phosphor-icons/react'

import Layout from '../../components/Layout'
import { emergencyNumbers } from '../../config/emergencyNumbers'
import { useAuth } from '../../context/useAuth'
import { api } from '../../api/api'

function WhatNow() {
  const navigate = useNavigate()
  const { slug } = useParams()
  const { user, ready } = useAuth()

  const [contactResult, setContactResult] = useState(null)
  const [retryCount, setRetryCount] = useState(0)

  const userId = user?.id

  // Load saved contacts only for authenticated users
  useEffect(() => {
    if (!userId) return

    let cancelled = false

    api('/prepare')
      .then(data => {
        if (cancelled) return

        const contacts = [...(data.contacts ?? [])].sort(
          (a, b) => Number(b.first) - Number(a.first)
        )

        setContactResult({
          userId,
          retryCount,
          contacts,
          error: '',
        })
      })
      .catch(() => {
        if (cancelled) return

        setContactResult({
          userId,
          retryCount,
          contacts: [],
          error: 'Saved contacts are currently unavailable.',
        })
      })

    return () => {
      cancelled = true
    }
  }, [userId, retryCount])

  const result =
    userId &&
    contactResult?.userId === userId &&
    contactResult?.retryCount === retryCount
      ? contactResult
      : null

  const contacts = result?.contacts ?? []
  const loading = !!userId && !result
  const error = result?.error ?? ''

  return (
    <Layout>
      <section className="what-now-content">

        <div className="what-now-heading">
          <h1>What now?</h1>
          <p>Find additional help and support below.</p>
        </div>

        {/* Other emergency numbers — available to everyone */}
        <section className="what-now-section">
          <h2>Other emergency numbers</h2>

          {emergencyNumbers.map(service => (
            <a
              key={service.name}
              className="emergency-number-card"
              href={`tel:${service.phone}`}
            >
              <div>
                <strong>{service.name}</strong>
                <small>{service.phone}</small>
              </div>

              <span className="what-now-call">
                <PhoneCall size={22} weight="duotone" />
                Call
              </span>
            </a>
          ))}
        </section>

        {/* Saved emergency contacts */}
        <section className="what-now-section">
          <h2>Your contacts</h2>

          {/* Signed-out users */}
          {ready && !user && (
            <p>
              Sign in from the home page to access your
              saved emergency contacts.
            </p>
          )}

          {/* Loading */}
          {(!ready || loading) && (
            <div
              className="loading-state"
              role="status"
              aria-busy="true"
            >
              <div className="skeleton skeleton-card" />
            </div>
          )}

          {/* Error */}
          {user && error && (
            <div className="ui-state error-state" role="alert">
              <p>{error}</p>

              <button
                onClick={() =>
                  setRetryCount(count => count + 1)
                }
              >
                Try again
              </button>
            </div>
          )}

          {/* No saved contacts */}
          {user && !loading && !error &&
            contacts.length === 0 && (
              <div className="ui-state empty-state">
                <h3>No emergency contacts yet</h3>

                <p>
                  Add people you trust to your emergency contacts.
                </p>

                <button
                  onClick={() =>
                    navigate('/prepare/contacts')
                  }
                >
                  Add contacts
                </button>
              </div>
            )}

          {/* Actual saved contacts */}
          {user && contacts.map(contact => (
            <div
              key={contact._id}
              className="contact-call-card"
            >
              <div>
                <strong>
                  {contact.name}

                  {contact.first && (
                    <span className="first-contact">
                      First
                    </span>
                  )}
                </strong>

                <small>{contact.phone}</small>
              </div>

              <a
                className="what-now-call"
                href={`tel:${contact.phone}`}
                aria-label={`Call ${contact.name}`}
              >
                <PhoneCall size={22} weight="duotone" />
                Call
              </a>
            </div>
          ))}
        </section>

        {/* Navigation */}
        <section className="what-now-actions">

          <button
            className="what-now-button primary"
            onClick={() => navigate(`/guides/${slug}`)}
          >
            Read the full guide
          </button>

          <button
            className="what-now-button secondary"
            onClick={() => navigate('/')}
          >
            Back to home
          </button>

        </section>
      </section>
    </Layout>
  )
}

export default WhatNow
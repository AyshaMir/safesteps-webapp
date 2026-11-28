import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import Layout from '../../components/Layout'
import { api } from '../../api/api'

import {
  ClipboardText,
  ListChecks,
  AddressBook,
  CaretRight,
} from '@phosphor-icons/react'

function PrepareHome() {
  const navigate = useNavigate()

  const [prep, setPrep] = useState(null)
  const [items, setItems] = useState([])

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  // Load preparedness data and published checklist
  useEffect(() => {
    let cancelled = false

    Promise.all([
      api('/prepare'),
      api('/checklist'),
    ])
      .then(([prepData, checklistData]) => {
        if (cancelled) return

        setPrep(prepData)
        setItems(checklistData.items ?? [])
        setLoadError('')
      })
      .catch(err => {
        if (!cancelled) {
          setLoadError(err.message)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [retryCount])

  function retryLoad() {
    setLoading(true)
    setLoadError('')
    setRetryCount(count => count + 1)
  }

  const publishedIds = new Set(
    items.map(item => item._id)
  )

  const checkedItems = [
    ...new Set(prep?.checkedItems ?? []),
  ].filter(id => publishedIds.has(id)).length

  const totalItems = items.length

  const preparedness = totalItems
    ? Math.round((checkedItems / totalItems) * 100)
    : 0

  const meetingPoints = prep?.plan?.meetingPoints ?? []
  const contacts = prep?.contacts ?? []

  const firstContact = contacts.find(
    contact => contact.first
  )

  return (
    <Layout>
      <section className="prepare-page">

        <div className="prepare-heading">
          <h2>Prepare</h2>
          <p>
            Your plan, kit and contacts. Saved to your account.
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <div
            className="loading-state"
            role="status"
            aria-busy="true"
          >
            <div className="skeleton skeleton-card" />
            <div className="skeleton skeleton-card" />
            <div className="skeleton skeleton-card" />
            <div className="skeleton skeleton-card" />
          </div>
        )}

        {/* Loading error */}
        {!loading && loadError && (
          <div className="ui-state error-state" role="alert">
            <h3>Couldn't load your preparedness data</h3>
            <p>{loadError}</p>

            <button onClick={retryLoad}>
              Try again
            </button>
          </div>
        )}

        {!loading && !loadError && (
          <>
            {/* Preparedness progress */}
            <div className="preparedness-card">

              <div className="preparedness-heading">
                <strong>Your preparedness</strong>
                <strong>{preparedness}%</strong>
              </div>

              <div
                className="preparedness-track"
                role="progressbar"
                aria-label="Emergency preparedness"
                aria-valuenow={preparedness}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="preparedness-fill"
                  style={{ width: `${preparedness}%` }}
                />
              </div>

            </div>

            {/* Emergency plan */}
            <button
              className="prepare-card"
              onClick={() => navigate('/prepare/plan')}
            >
              <span className="prepare-icon">
                <ClipboardText size={24} weight="duotone" />
              </span>

              <div className="prepare-card-text">
                <strong>Emergency plan</strong>

                <small>
                  {meetingPoints.length === 0
                    ? 'No meeting points added yet'
                    : meetingPoints.length === 1
                      ? `Meeting point: ${meetingPoints[0]}`
                      : `${meetingPoints.length} meeting points saved`}
                </small>
              </div>

              <span className="card-arrow">
                <CaretRight size={24} weight="duotone" />
              </span>
            </button>

            {/* Kit checklist */}
            <button
              className="prepare-card"
              onClick={() => navigate('/prepare/checklist')}
            >
              <span className="prepare-icon">
                <ListChecks size={24} weight="duotone" />
              </span>

              <div className="prepare-card-text">
                <strong>Kit checklist</strong>

                <small>
                  {checkedItems} of {totalItems} items ticked
                </small>
              </div>

              <span className="card-arrow">
                <CaretRight size={24} weight="duotone" />
              </span>
            </button>

            {/* Emergency contacts */}
            <button
              className="prepare-card"
              onClick={() => navigate('/prepare/contacts')}
            >
              <span className="prepare-icon">
                <AddressBook size={24} weight="duotone" />
              </span>

              <div className="prepare-card-text">
                <strong>Emergency contacts</strong>

                <small>
                  {firstContact
                    ? `${firstContact.name} is your first contact`
                    : contacts.length === 0
                      ? 'No emergency contacts added yet'
                      : `${contacts.length} saved ${
                          contacts.length === 1
                            ? 'contact'
                            : 'contacts'
                        }`}
                </small>
              </div>

              <span className="card-arrow">
                <CaretRight size={24} weight="duotone" />
              </span>
            </button>
          </>
        )}

      </section>
    </Layout>
  )
}

export default PrepareHome
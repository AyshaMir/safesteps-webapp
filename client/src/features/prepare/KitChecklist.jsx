import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from '@phosphor-icons/react'
import { useAuth } from '../../context/useAuth'
import Layout from '../../components/Layout'
import { api } from '../../api/api'
import useOnlineStatus from '../../hooks/useOnlineStatus'

function KitChecklist() {
  const navigate = useNavigate()
  const { offlineSession } = useAuth()
  const networkOnline = useOnlineStatus()
  const isOnline = networkOnline && !offlineSession

  const [items, setItems] = useState([])
  const [checked, setChecked] = useState([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  // Load published checklist items and user's progress
  useEffect(() => {
    let cancelled = false

    Promise.all([
      api('/checklist'),
      api('/prepare'),
    ])
      .then(([checklistData, prepData]) => {
        if (cancelled) return

        const publishedItems = checklistData.items ?? []
        const publishedIds = new Set(
          publishedItems.map(item => item._id)
        )

        setItems(publishedItems)

        setChecked(
          [...new Set(prepData.checkedItems ?? [])]
            .filter(id => publishedIds.has(id))
        )

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

  // Group checklist items by category
  const groupedItems = items.reduce((groups, item) => {
    if (!groups.has(item.category)) {
      groups.set(item.category, [])
    }

    groups.get(item.category).push(item)
    return groups
  }, new Map())

  const total = items.length

  const percentage = total
    ? Math.round((checked.length / total) * 100)
    : 0

  // Automatically save whenever an item is checked
  async function toggle(itemId) {
    if (saving || !isOnline) return

    const previousChecked = [...checked]

    const updatedChecked = checked.includes(itemId)
      ? checked.filter(id => id !== itemId)
      : [...checked, itemId]

    setChecked(updatedChecked)
    setSaving(true)
    setSaveError('')

    try {
      const data = await api('/prepare/checklist', {
        method: 'PUT',
        body: {
          checkedItems: updatedChecked,
        },
      })

      setChecked(data.checkedItems)
    } catch (err) {
      // Restore previous progress if saving fails
      setChecked(previousChecked)
      setSaveError(
        `Couldn't save your progress. ${err.message}`
      )
    } finally {
      setSaving(false)
    }
  }

  function formatCategory(category) {
    return category
      .split(' ')
      .map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join(' ')
  }

  return (
    <Layout>
      <section className="checklist-page">

        <button
          className="back-button"
          onClick={() => navigate('/prepare')}
          aria-label="Back to Prepare"
        >
          <ArrowLeft size={26} weight="bold" />
        </button>

        <div className="prepare-heading">
          <h2>Kit checklist</h2>
          <p>Get your emergency essentials ready.</p>
        </div>

        {/* Loading state */}
        {loading && (
          <div
            className="loading-state"
            role="status"
            aria-busy="true"
          >
            <div className="skeleton skeleton-heading" />
            <div className="skeleton skeleton-card" />
            <div className="skeleton skeleton-card" />
          </div>
        )}

        {/* Loading error */}
        {!loading && loadError && (
          <div className="ui-state error-state" role="alert">
            <h3>Couldn't load your checklist</h3>
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
                <strong>{percentage}%</strong>
              </div>

              <div
                className="preparedness-track"
                role="progressbar"
                aria-label="Emergency preparedness"
                aria-valuenow={percentage}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="preparedness-fill"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <p className="checklist-count">
                {checked.length} of {total} items packed
              </p>

              {saving && (
                <p className="checklist-count" role="status">
                  Saving progress...
                </p>
              )}

            </div>

            {/* Offline state */}
            {!isOnline && (
              <p className="card-label">
                Connect to the internet to update your checklist.
              </p>
            )}

            {/* Save error */}
            {saveError && (
              <div className="ui-state error-state" role="alert">
                <p>{saveError}</p>
                <p>Check the item again to retry.</p>
              </div>
            )}

            {/* Empty checklist */}
            {items.length === 0 && (
              <div className="ui-state empty-state">
                <h3>No checklist items available</h3>
                <p>Check back later for emergency kit essentials.</p>
              </div>
            )}

            {/* Checklist categories */}
            {[...groupedItems.entries()].map(
              ([category, categoryItems]) => (
                <section
                  className="checklist-category"
                  key={category}
                >
                  <h3>{formatCategory(category)}</h3>

                  {categoryItems.map(item => (
                    <label
                      key={item._id}
                      className={`checklist-row ${
                        checked.includes(item._id)
                          ? 'checked'
                          : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked.includes(item._id)}
                        disabled={saving || !isOnline}
                        onChange={() => toggle(item._id)}
                      />

                      <span>{item.name}</span>
                    </label>
                  ))}
                </section>
              )
            )}
          </>
        )}

      </section>
    </Layout>
  )
}

export default KitChecklist
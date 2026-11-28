import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import Layout from '../../components/Layout'
import Button from '../../components/Button'
import Card from '../../components/Card'
import PageHeader from '../../components/PageHeader'
import { api } from '../../api/api'
import useOnlineStatus from '../../hooks/useOnlineStatus'

function EmergencyPlan() {
  const navigate = useNavigate()
  const { offlineSession } = useAuth()
  const networkOnline = useOnlineStatus()
  const isOnline = networkOnline && !offlineSession

  const [meetingPoints, setMeetingPoints] = useState([])
  const [notes, setNotes] = useState('')
  const [newPoint, setNewPoint] = useState('')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  // Load saved emergency plan
  useEffect(() => {
    let cancelled = false

    api('/prepare')
      .then(data => {
        if (cancelled) return

        setMeetingPoints(data.plan?.meetingPoints ?? [])
        setNotes(data.plan?.notes ?? '')
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

  function clearSaveStatus() {
    setSaved(false)
    setSaveError('')
  }

  function addMeetingPoint() {
    if (!newPoint.trim()) return

    setMeetingPoints([...meetingPoints, newPoint.trim()])
    setNewPoint('')
    clearSaveStatus()
  }

  function updateMeetingPoint(index, value) {
    setMeetingPoints(
      meetingPoints.map((point, i) => i === index ? value : point)
    )
    clearSaveStatus()
  }

  function removeMeetingPoint(index) {
    setMeetingPoints(
      meetingPoints.filter((_, i) => i !== index)
    )
    clearSaveStatus()
  }

  // Save emergency plan to the backend
  async function savePlan() {
    if (saving || !isOnline || loading || loadError) return

    setSaving(true)
    clearSaveStatus()

    const cleanedPoints = meetingPoints
      .map(point => point.trim())
      .filter(Boolean)

    try {
      const data = await api('/prepare/plan', {
        method: 'PUT',
        body: {
          meetingPoints: cleanedPoints,
          notes: notes.trim(),
        },
      })

      setMeetingPoints(data.plan.meetingPoints)
      setNotes(data.plan.notes)
      setSaved(true)
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Layout>
      <section className="plan-page">

        <PageHeader
          title="Emergency plan"
          subtitle="Make a plan before an emergency happens."
          onBack={() => navigate('/prepare')}
        />

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
            <h3>Couldn't load your emergency plan</h3>
            <p>{loadError}</p>

            <button onClick={retryLoad}>
              Try again
            </button>
          </div>
        )}

        {!loading && !loadError && (
          <>
            {/* Meeting points */}
            <Card className="plan-section">
              <h3>Meeting points</h3>

              <p>
                Choose safe places where your family can meet.
              </p>

              {meetingPoints.map((point, index) => (
                <div className="meeting-point-row" key={index}>
                  <input
                    aria-label={`Meeting point ${index + 1}`}
                    value={point}
                    disabled={saving || !isOnline}
                    onChange={e =>
                      updateMeetingPoint(index, e.target.value)
                    }
                  />

                  <button
                    className="remove-point-button"
                    aria-label={`Remove meeting point ${index + 1}`}
                    disabled={saving || !isOnline}
                    onClick={() => removeMeetingPoint(index)}
                  >
                    &times;
                  </button>
                </div>
              ))}

              <div className="meeting-point-row">
                <input
                  aria-label="New meeting point"
                  placeholder="Enter a meeting point"
                  value={newPoint}
                  disabled={saving || !isOnline}
                  onChange={e => setNewPoint(e.target.value)}
                />

                <button
                  className="add-point-button"
                  onClick={addMeetingPoint}
                  disabled={
                    !newPoint.trim() || saving || !isOnline
                  }
                >
                  + Add
                </button>
              </div>
            </Card>

            {/* Additional notes */}
            <Card className="plan-section">
              <h3>Additional notes</h3>

              <p>
                Include anything important for your emergency plan.
              </p>

              <textarea
                aria-label="Additional notes"
                placeholder="Write your notes here..."
                value={notes}
                disabled={saving || !isOnline}
                onChange={e => {
                  setNotes(e.target.value)
                  clearSaveStatus()
                }}
                rows={5}
              />
            </Card>

            {/* Save plan */}
            <Button
              className="prepare-save-button"
              onClick={savePlan}
              disabled={saving || !isOnline || !!newPoint.trim()}
            >
              {saving ? 'Saving...' : 'Save plan'}
            </Button>

            {newPoint.trim() && (
              <p className="card-label">
                Add your new meeting point before saving.
              </p>
            )}

            {!isOnline && (
              <p className="card-label">
                Connect to the internet to edit and save your plan.
              </p>
            )}

            {saved && (
              <p className="save-message" role="status">
                Emergency plan saved successfully.
              </p>
            )}

            {saveError && (
              <div className="ui-state error-state" role="alert">
                <p>{saveError}</p>

                <button
                  onClick={savePlan}
                  disabled={!isOnline}
                >
                  Try again
                </button>
              </div>
            )}
          </>
        )}

      </section>
    </Layout>
  )
}

export default EmergencyPlan
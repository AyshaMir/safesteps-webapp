import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Layout from '../../components/Layout'
import Button from '../../components/Button'
import Card from '../../components/Card'
import PageHeader from '../../components/PageHeader'

function EmergencyPlan() {
  const navigate = useNavigate()

  const [meetingPoints, setMeetingPoints] = useState(['Front gate'])
  const [notes, setNotes] = useState('')
  const [newPoint, setNewPoint] = useState('')
  const [saved, setSaved] = useState(false)

  function addMeetingPoint() {
    if (!newPoint.trim()) return

    setMeetingPoints([...meetingPoints, newPoint.trim()])
    setNewPoint('')
    setSaved(false)
  }

  function updateMeetingPoint(index, value) {
    setMeetingPoints(
      meetingPoints.map((point, i) => i === index ? value : point)
    )
    setSaved(false)
  }

  function removeMeetingPoint(index) {
    setMeetingPoints(
      meetingPoints.filter((_, i) => i !== index)
    )
    setSaved(false)
  }

  function savePlan() {
    setMeetingPoints(
      meetingPoints.map(point => point.trim()).filter(Boolean)
    )
    setSaved(true)
  }

  return (
    <Layout>
      <section className="plan-page">

        <PageHeader
          title="Emergency plan"
          subtitle="Make a plan before an emergency happens."
          onBack={() => navigate('/prepare')}
        />

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
                onChange={e =>
                  updateMeetingPoint(index, e.target.value)
                }
              />

              <button
                className="remove-point-button"
                aria-label={`Remove meeting point ${index + 1}`}
                onClick={() => removeMeetingPoint(index)}
              >
                ×
              </button>
            </div>
          ))}

          <div className="meeting-point-row">
            <input
              aria-label="New meeting point"
              placeholder="Enter a meeting point"
              value={newPoint}
              onChange={e => setNewPoint(e.target.value)}
            />

            <button
              className="add-point-button"
              onClick={addMeetingPoint}
              disabled={!newPoint.trim()}
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
            onChange={e => {
              setNotes(e.target.value)
              setSaved(false)
            }}
            rows={5}
          />
        </Card>

        {/* Save plan */}
        <Button
          className="prepare-save-button"
          onClick={savePlan}
        >
          Save plan
        </Button>

        {saved && (
          <p className="save-message" role="status">
            Plan updated for this page.
          </p>
        )}

      </section>
    </Layout>
  )
}

export default EmergencyPlan
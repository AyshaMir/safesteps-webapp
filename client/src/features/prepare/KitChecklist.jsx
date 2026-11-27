import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import { ArrowLeft } from '@phosphor-icons/react'



// Temporary checklist until Person 3's API is ready
const items = {
  'Water & Food': [
    'Drinking water',
    'Non-perishable food',
    'Can opener',
  ],
  'Medical': [
    'First aid kit',
    'Essential medication',
    'Bandages',
  ],
  'Equipment': [
    'Flashlight',
    'Extra batteries',
    'Power bank',
    'Whistle',
  ],
  'Documents & Essentials': [
    'Copies of identification',
    'Emergency cash',
    'Emergency contact list',
    'Extra clothes',
    'Hygiene supplies',
  ],
}

function KitChecklist() {
  const navigate = useNavigate()
  const [checked, setChecked] = useState([])

  const total = Object.values(items).flat().length
  const percentage = Math.round((checked.length / total) * 100)

  function toggle(item) {
    setChecked(previous =>
      previous.includes(item)
        ? previous.filter(value => value !== item)
        : [...previous, item]
    )
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

        <div className="preparedness-card">
          <div className="preparedness-heading">
            <strong>Your preparedness</strong>
            <strong>{percentage}%</strong>
          </div>

          <div className="preparedness-track">
            <div
              className="preparedness-fill"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <p className="checklist-count">
            {checked.length} of {total} items packed
          </p>
        </div>

        {Object.entries(items).map(([category, categoryItems]) => (
          <section className="checklist-category" key={category}>
            <h3>{category}</h3>

            {categoryItems.map(item => (
              <label
                key={item}
                className={`checklist-row ${
                  checked.includes(item) ? 'checked' : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked.includes(item)}
                  onChange={() => toggle(item)}
                />

                <span>{item}</span>
              </label>
            ))}
          </section>
        ))}
      </section>
    </Layout>
  )
}

export default KitChecklist
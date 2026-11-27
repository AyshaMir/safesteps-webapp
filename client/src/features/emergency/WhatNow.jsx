import { useNavigate, useParams } from 'react-router-dom'
import Call1122Bar from '../../components/Call1122Bar'
import { ArrowLeft } from '@phosphor-icons/react'

const mockContacts = [
  { name: 'Mum', phone: '03001234567', first: true },
  { name: 'Sara', phone: '03111234567', first: false },
]

function WhatNow() {
  const navigate = useNavigate()
  const { slug } = useParams()

  const contacts = [...mockContacts].sort(
    (a, b) => Number(b.first) - Number(a.first),
  )

  return (
    <div className="what-now-page">
      <header className="panic-header">
        <button
          className="back-button"
          type="button"
          onClick={() => navigate(`/emergency/${slug}`)}
        >
          <ArrowLeft size={26} weight="bold" />
        </button>
      </header>

      <main className="what-now-content">
        <div className="what-now-heading">
          <h1>What now?</h1>
          <p>Stay with them and keep monitoring the situation.</p>
        </div>

        <section className="what-now-section">
          <h2>Other emergency numbers</h2>

          <a className="emergency-number-card" href="tel:15">
            <span>
              <strong>Police</strong>
              <small>15</small>
            </span>
            <span>Call</span>
          </a>

          <a className="emergency-number-card" href="tel:16">
            <span>
              <strong>Fire</strong>
              <small>16</small>
            </span>
            <span>Call</span>
          </a>

          <a className="emergency-number-card" href="tel:115">
            <span>
              <strong>Edhi</strong>
              <small>115</small>
            </span>
            <span>Call</span>
          </a>
        </section>

        <section className="what-now-section">
          <h2>Your contacts</h2>

          {contacts.map((contact) => (
            <a
              key={contact.phone}
              className="contact-call-card"
              href={`tel:${contact.phone}`}
            >
              <div>
                <strong>
                  {contact.name}
                  {contact.first && <span className="first-contact"> First</span>}
                </strong>
                <small>{contact.phone}</small>
              </div>

              <span>Call</span>
            </a>
          ))}
        </section>

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
      </main>

      <Call1122Bar />
    </div>
  )
}

export default WhatNow
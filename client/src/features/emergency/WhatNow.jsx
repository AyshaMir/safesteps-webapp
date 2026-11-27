import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../../components/Layout'
import { PhoneCall } from '@phosphor-icons/react'
import { emergencyNumbers } from '../../config/emergencyNumbers'


const mockContacts = [
  { name: 'Mum', phone: '', first: true },
  { name: 'Sara', phone: '', first: false },
]

function WhatNow() {
  const navigate = useNavigate()
  const { slug } = useParams()

  const contacts = [...mockContacts].sort(
    (a, b) => Number(b.first) - Number(a.first)
  )

  return (
    <Layout>
      <section className="what-now-content">

        <div className="what-now-heading">
          <h1>What now?</h1>
          <p>Find additional help and support below.</p>
        </div>

        {/* Other emergency numbers */}
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

          {contacts.map(contact => (
            <div
              key={contact.name}
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

                <small>
                  {contact.phone || 'Demo contact'}
                </small>
              </div>

              {contact.phone ? (
                <a
                  className="what-now-call"
                  href={`tel:${contact.phone}`}
                >
                  <PhoneCall size={22} weight="duotone" />
                  Call
                </a>
              ) : (
                <button
                  className="what-now-call"
                  disabled
                >
                  <PhoneCall size={22} weight="duotone" />
                  Call
                </button>
              )}
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
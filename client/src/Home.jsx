import { useNavigate } from 'react-router-dom'
import Layout from './components/Layout'
import { useState } from 'react'
import {
  PhoneCall,
  X,
  CaretDown,
  CaretRight,
} from '@phosphor-icons/react'

function Home() {
  const navigate = useNavigate()
  const [showContacts, setShowContacts] = useState(false)

  const contacts = [
    { name: 'Mum', relation: 'Mother', phone: '0300XXXXXXX' },
    { name: 'Sara', relation: 'Sister', phone: '0311XXXXXXX' },
    { name: 'Dad', relation: 'Father', phone: '0321XXXXXXX' },
    { name: 'Ali', relation: 'Friend', phone: '0333XXXXXXX' },
  ]

  return (
    <Layout>
      <section className="home-page">
        <div className="home-greeting">
          <h2>Hi, Ayesha</h2>
          <p>Welcome back.</p>
        </div>

        <button
          className="emergency-button"
          onClick={() => navigate('/emergency')}
        >
          <span>I need</span>
          <span>help now</span>
        </button>

        <button
          className="home-card readiness-card"
          onClick={() => navigate('/prepare')}
        >
          <div className="readiness-ring">
            <span>60%</span>
          </div>

          <div className="home-card-text">
            <span className="card-label">Emergency readiness</span>
            <strong>You are 60% ready</strong>
          </div>

          <span className="card-arrow">›</span>
        </button>

        <button
            className="home-card contact-card"
            onClick={() => setShowContacts(true)}
          >
          <div className="contact-avatars">
            <span>M</span>
            <span>S</span>
            <span>+2</span>
          </div>

          <div className="home-card-text">
            <strong>Call someone</strong>
            <span className="card-label">Choose from your contacts</span>
          </div>

          <span className="card-arrow">
            <CaretDown size={24} weight="duotone" />
          </span>
        </button>
      </section>
      {showContacts && (
  <div
    className="contact-overlay"
    onClick={() => setShowContacts(false)}
  >
    <section
      className="contact-sheet"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-sheet-title"
      onClick={e => e.stopPropagation()}
    >
      <div className="sheet-handle" />

      <div className="sheet-header">
        <h2 id="contact-sheet-title">Call someone</h2>

        <button
          className="sheet-close"
          aria-label="Close contacts"
          onClick={() => setShowContacts(false)}
        >
          <X size={24} weight="bold" />
        </button>
      </div>

      <p>Choose from your emergency contacts.</p>

      {contacts.map(contact => (
        <div className="sheet-contact" key={contact.name}>
          <div className="contact-avatar">
            {contact.name[0]}
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
      ))}

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
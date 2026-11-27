import {
  ArrowLeft,
  Heartbeat,
  HouseLine,
  Fire,
  CloudRain,
  Sun,
} from '@phosphor-icons/react'

import { useNavigate } from 'react-router-dom'
import Call1122Bar from '../../components/Call1122Bar'

// Custom choking icon — Option B
function ChokingIcon() {
  return (
    <svg
      viewBox="0 0 64 64"
      className="custom-emergency-icon"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 56V42L14 33V21Q14 7 31 7Q45 7 46 23L53 32H44V40H35V56" />

      <path
        d="M42 33H28V54"
        strokeDasharray="4 4"
        strokeWidth="4"
      />

      <circle
        cx="28"
        cy="39"
        r="7"
        fill="currentColor"
      />

      <path
        d="M25 36L31 42M31 36L25 42"
        stroke="#FFFFFF"
        strokeWidth="2"
      />
    </svg>
  )
}

// Custom bleeding icon — Option D
function BleedingIcon() {
  return (
    <svg
      viewBox="0 0 64 64"
      className="custom-emergency-icon"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path
        d="M25 6Q7 28 7 38A18 18 0 0 0 43 38Q43 28 25 6Z"
        fill="currentColor"
        fillOpacity="0.5"
      />

      <circle
        cx="46"
        cy="43"
        r="15"
        fill="#E5F3F1"
      />

      <path
        d="M46 34V52M37 43H55"
        strokeWidth="5"
      />
    </svg>
  )
}

// Custom burn icon — Option A
function BurnIcon() {
  return (
    <svg
      viewBox="0 0 64 64"
      className="custom-emergency-icon"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path
        d="M14 56V46L6 32Q5 28 9 27L20 36V15Q24 10 28 15V30V9Q32 4 36 9V30V14Q40 10 44 14V34V23Q48 19 52 23V44Q52 54 46 56Z"
        fill="currentColor"
        fillOpacity="0.1"
      />

      <path
        d="M32 51Q21 46 28 37Q28 44 33 39L37 31Q50 45 39 51Z"
        fill="currentColor"
        fillOpacity="0.7"
      />
    </svg>
  )
}

const emergencies = [
  {
    label: 'Choking',
    slug: 'choking',
    icon: ChokingIcon,
    type: 'medical',
    custom: true,
  },
  {
    label: 'Bad bleeding',
    slug: 'severe-bleeding',
    icon: BleedingIcon,
    type: 'medical',
    custom: true,
  },
  {
    label: 'A burn',
    slug: 'burns',
    icon: BurnIcon,
    type: 'medical',
    custom: true,
  },
  {
    label: 'Someone fainted',
    slug: 'fainting',
    icon: Heartbeat,
    type: 'medical',
  },
  {
    label: 'Earthquake',
    slug: 'earthquake',
    icon: HouseLine,
    type: 'disaster',
  },
  {
    label: 'Fire',
    slug: 'fire',
    icon: Fire,
    type: 'disaster',
  },
  {
    label: 'Heavy rain / flood',
    slug: 'heavy-rainfall',
    icon: CloudRain,
    type: 'disaster',
  },
  {
    label: 'Extreme heat',
    slug: 'heatwave',
    icon: Sun,
    type: 'disaster',
  },
]

function EmergencyPicker() {
  const navigate = useNavigate()

  const medical = emergencies.filter(
    item => item.type === 'medical'
  )

  const disasters = emergencies.filter(
    item => item.type === 'disaster'
  )

  return (
    <div className="panic-page emergency-picker-page">

      <header className="panic-header">
        <button
          className="back-button"
          type="button"
          aria-label="Back to Home"
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={26} weight="bold" />
        </button>
      </header>

      <main className="picker-content">
        <h1>What is happening?</h1>

        <EmergencySection
          title="MEDICAL EMERGENCIES"
          items={medical}
          navigate={navigate}
        />

        <EmergencySection
          title="DISASTERS"
          items={disasters}
          navigate={navigate}
        />
      </main>

      <Call1122Bar />

    </div>
  )
}

function EmergencySection({ title, items, navigate }) {
  return (
    <section className="emergency-section">
      <h2>{title}</h2>

      <div className="emergency-grid">
        {items.map(item => (
          <button
            key={item.slug}
            type="button"
            className={`emergency-tile ${item.type}`}
            onClick={() => navigate(`/emergency/${item.slug}`)}
          >
            <span className="emergency-icon">
              {item.custom ? (
                <item.icon />
              ) : (
                <item.icon size={32} weight="duotone" />
              )}
            </span>

            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </section>
  )
}

export default EmergencyPicker
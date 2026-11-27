import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Call1122Bar from '../../components/Call1122Bar'
import { ArrowLeft } from '@phosphor-icons/react'

const mockFlows = {
  choking: [
    {
      type: 'question',
      text: 'Can they cough or talk?',
      yes: 1,
      no: 2,
    },
    {
      type: 'instruction',
      text: 'Encourage them to keep coughing.',
    },
    {
      type: 'instruction',
      text: 'Call for help and begin first-aid steps.',
    },
  ],

  earthquake: [
    {
      type: 'instruction',
      text: 'Drop, cover and hold on.',
    },
    {
      type: 'instruction',
      text: 'Stay away from windows.',
    },
  ],
}

function EmergencySteps() {
  const { slug } = useParams()
  const navigate = useNavigate()

  const steps = useMemo(
    () =>
      mockFlows[slug] || [
        {
          type: 'instruction',
          text: 'Emergency guidance will be added here.',
        },
      ],
    [slug],
  )

  const [currentStep, setCurrentStep] = useState(0)
  const [history, setHistory] = useState([])

  const step = steps[currentStep]

  function goToStep(nextStep) {
    if (nextStep === null || nextStep === undefined || nextStep >= steps.length) {
      navigate(`/emergency/${slug}/done`)
      return
    }

    setHistory((previous) => [...previous, currentStep])
    setCurrentStep(nextStep)
  }

  function handleNext() {
    const nextStep = currentStep + 1

    if (nextStep >= steps.length) {
      navigate(`/emergency/${slug}/done`)
      return
    }

    goToStep(nextStep)
  }

  function handleBack() {
    if (history.length === 0) {
      navigate('/emergency')
      return
    }

    const previousStep = history[history.length - 1]

    setHistory((previous) => previous.slice(0, -1))
    setCurrentStep(previousStep)
  }

  return (
    <div className="panic-page emergency-step-page">
      <header className="panic-header">
        <button
          className="back-button"
          type="button"
          onClick={handleBack}
        >
        <ArrowLeft size={26} weight="bold" />
        </button>

        <div className="progress-dots">
          {steps.map((_, index) => (
            <span
              key={index}
              className={index === currentStep ? 'active' : ''}
            />
          ))}
        </div>
      </header>

      <main className="step-content">
        <div className="step-image-placeholder">
          Illustration
        </div>

        <h1>{step.text}</h1>

        {step.type === 'question' ? (
          <div className="step-actions question-actions">
            <button
              className="step-button primary"
              onClick={() => goToStep(step.yes)}
            >
              YES
            </button>

            <button
              className="step-button secondary"
              onClick={() => goToStep(step.no)}
            >
              NO
            </button>
          </div>
        ) : (
          <button
            className="step-button primary"
            onClick={handleNext}
          >
            NEXT
          </button>
        )}
      </main>

      <Call1122Bar />
    </div>
  )
}

export default EmergencySteps
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import {
  ClipboardText,
  ListChecks,
  AddressBook,
  CaretRight,
} from '@phosphor-icons/react'


function PrepareHome() {
  const navigate = useNavigate()

  // Temporary data until backend integration
  const checkedItems = 9
  const totalItems = 15
  const preparedness = Math.round(
    (checkedItems / totalItems) * 100
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

        <div className="preparedness-card">
          <div className="preparedness-heading">
            <strong>Your preparedness</strong>
            <strong>{preparedness}%</strong>
          </div>

          <div className="preparedness-track">
            <div
              className="preparedness-fill"
              style={{ width: `${preparedness}%` }}
            />
          </div>
        </div>

        <button
          className="prepare-card"
          onClick={() => navigate('/prepare/plan')}
        >
          <span className="prepare-icon">
            <ClipboardText size={24} weight="duotone" />
          </span>

          <div className="prepare-card-text">
            <strong>Emergency plan</strong>
            <small>Meeting point: front gate</small>
          </div>

          <span className="card-arrow">
            <CaretRight size={24} weight="duotone" />
          </span>
        </button>

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

        <button
          className="prepare-card"
          onClick={() => navigate('/prepare/contacts')}
        >
          <span className="prepare-icon">
            <AddressBook size={24} weight="duotone" />
          </span>

          <div className="prepare-card-text">
            <strong>Emergency contacts</strong>
            <small>Mum is your first contact</small>
          </div>

          <span className="card-arrow">
            <CaretRight size={24} weight="duotone" />
          </span>
        </button>
      </section>
    </Layout>
  )
}

export default PrepareHome
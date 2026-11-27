import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import { ArrowLeft } from '@phosphor-icons/react'
import { EmptyState } from '../../components/UIStates'

const emptyForm = {
  name: '',
  phone: '',
  relation: '',
  first: false,
}

function EmergencyContacts() {
  const navigate = useNavigate()

  const [contacts, setContacts] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)

  function updateField(field, value) {
    setForm(previous => ({
      ...previous,
      [field]: value,
    }))
  }

  function saveContact(e) {
    e.preventDefault()

    if (!form.name.trim() || !form.phone.trim()) return

    const contact = {
      ...form,
      name: form.name.trim(),
      phone: form.phone.trim(),
      id: editingId ?? Date.now().toString(),
    }

    setContacts(previous => {
      let updated = previous.filter(item => item.id !== contact.id)

      if (contact.first) {
        updated = updated.map(item => ({
          ...item,
          first: false,
        }))
      }

      return [...updated, contact].sort(
        (a, b) => Number(b.first) - Number(a.first)
      )
    })

    resetForm()
  }

  function editContact(contact) {
    setForm({
      name: contact.name,
      phone: contact.phone,
      relation: contact.relation,
      first: contact.first,
    })

    setEditingId(contact.id)
  }

  function deleteContact(id) {
    if (!window.confirm('Remove this contact?')) return

    setContacts(previous =>
      previous.filter(contact => contact.id !== id)
    )

    if (editingId === id) resetForm()
  }

  function resetForm() {
    setForm(emptyForm)
    setEditingId(null)
  }

  return (
    <Layout>
      <section className="contacts-page">

        <button
          className="back-button"
          onClick={() => navigate('/prepare')}
          aria-label="Back to Prepare"
        >
          <ArrowLeft size={26} weight="bold" />
        </button>

        <div className="prepare-heading">
          <h2>Emergency contacts</h2>
          <p>Keep the people you trust within reach.</p>
        </div>

        {contacts.length === 0 && (
          <EmptyState
            title="No contacts yet"
            message="Add someone you trust using form below"
          />
        )}

        {contacts.map(contact => (
          <div className="saved-contact-card" key={contact.id}>

            <div className="contact-avatar">
              {contact.name.charAt(0).toUpperCase()}
            </div>

            <div className="saved-contact-details">
              <strong>{contact.name}</strong>
              <small>{contact.relation}</small>
              <small>{contact.phone}</small>

              {contact.first && (
                <span className="primary-contact-label">
                  First contact
                </span>
              )}
            </div>

            <div className="contact-actions">
              <button onClick={() => editContact(contact)}>
                Edit
              </button>

              <button onClick={() => deleteContact(contact.id)}>
                Remove
              </button>
            </div>

          </div>
        ))}

        <form className="contact-form" onSubmit={saveContact}>

          <h3>{editingId ? 'Edit contact' : 'Add a person'}</h3>

          <label>Name</label>
          <input
            required
            value={form.name}
            placeholder="Contact name"
            onChange={e => updateField('name', e.target.value)}
          />

          <label>Phone number</label>
          <input
            required
            type="tel"
            inputMode="tel"
            pattern="(\+92|0)3[0-9]{9}"
            title="Enter a Pakistani mobile number, e.g. 03001234567 or +923001234567"
            value={form.phone}
            placeholder="03XXXXXXXXX"
            onChange={e => updateField('phone', e.target.value)}
          />

          <label>Relationship</label>
          <input
            value={form.relation}
            placeholder="Mother, sibling, friend..."
            onChange={e => updateField('relation', e.target.value)}
          />

          <label className="first-contact-checkbox">
            <input
              type="checkbox"
              checked={form.first}
              onChange={e => updateField('first', e.target.checked)}
            />
            Put this person first
          </label>

          <button className="prepare-save-button" type="submit">
            {editingId ? 'Save changes' : 'Save contact'}
          </button>

          {editingId && (
            <button
              className="cancel-edit-button"
              type="button"
              onClick={resetForm}
            >
              Cancel
            </button>
          )}

        </form>
      </section>
    </Layout>
  )
}

export default EmergencyContacts
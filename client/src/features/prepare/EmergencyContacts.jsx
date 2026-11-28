import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from '@phosphor-icons/react'
import { useAuth } from '../../context/useAuth'
import Layout from '../../components/Layout'
import { EmptyState } from '../../components/UIStates'
import { api } from '../../api/api'
import useOnlineStatus from '../../hooks/useOnlineStatus'

const emptyForm = {
  name: '',
  phone: '',
  relation: '',
  first: false,
}

function EmergencyContacts() {
  const navigate = useNavigate()
  const { offlineSession } = useAuth()
  const networkOnline = useOnlineStatus()
  const isOnline = networkOnline && !offlineSession

  const [contacts, setContacts] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [success, setSuccess] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  const disabled = saving || !isOnline

  function sortContacts(items) {
    return [...items].sort(
      (a, b) => Number(b.first) - Number(a.first)
    )
  }

  // Load saved emergency contacts
  useEffect(() => {
    let cancelled = false

    api('/prepare')
      .then(data => {
        if (cancelled) return

        setContacts(sortContacts(data.contacts ?? []))
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

  function updateField(field, value) {
    setForm(previous => ({
      ...previous,
      [field]: value,
    }))

    setSaveError('')
    setSuccess('')
  }

  // Add or update a contact
  async function saveContact(e) {
    e.preventDefault()

    if (disabled) return

    const cleanPhone = form.phone
      .trim()
      .replace(/[\s()-]/g, '')

    if (!form.name.trim()) {
      setSaveError('Enter a contact name.')
      return
    }

    if (!/^\+?\d{7,15}$/.test(cleanPhone)) {
      setSaveError('Enter a valid phone number.')
      return
    }

    const contact = {
      name: form.name.trim(),
      phone: cleanPhone,
      relation: form.relation.trim(),
      first: form.first,
    }

    setSaving(true)
    setSaveError('')
    setSuccess('')

    try {
      const data = await api(
        editingId
          ? `/prepare/contacts/${editingId}`
          : '/prepare/contacts',
        {
          method: editingId ? 'PUT' : 'POST',
          body: contact,
        }
      )

      setContacts(sortContacts(data.contacts))

      setSuccess(
        editingId
          ? 'Contact updated successfully.'
          : 'Contact saved successfully.'
      )

      resetForm()
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  function editContact(contact) {
    if (disabled) return

    setForm({
      name: contact.name,
      phone: contact.phone,
      relation: contact.relation ?? '',
      first: contact.first,
    })

    setEditingId(contact._id)
    setSaveError('')
    setSuccess('')
  }

  // Delete contact from the backend
  async function deleteContact(id) {
    if (disabled) return

    if (!window.confirm('Remove this contact?')) return

    setSaving(true)
    setSaveError('')
    setSuccess('')

    try {
      const data = await api(`/prepare/contacts/${id}`, {
        method: 'DELETE',
      })

      setContacts(sortContacts(data.contacts))

      if (editingId === id) {
        resetForm()
      }

      setSuccess('Contact removed successfully.')
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
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

        {/* Loading state */}
        {loading && (
          <div
            className="loading-state"
            role="status"
            aria-busy="true"
          >
            <div className="skeleton skeleton-card" />
            <div className="skeleton skeleton-card" />
          </div>
        )}

        {/* Loading error */}
        {!loading && loadError && (
          <div className="ui-state error-state" role="alert">
            <h3>Couldn't load your contacts</h3>
            <p>{loadError}</p>

            <button onClick={retryLoad}>
              Try again
            </button>
          </div>
        )}

        {!loading && !loadError && (
          <>
            {/* Offline notice */}
            {!isOnline && (
              <p className="card-label">
                Connect to the internet to edit your contacts.
              </p>
            )}

            {/* Empty state */}
            {contacts.length === 0 && (
              <EmptyState
                title="No contacts yet"
                message="Add someone you trust using the form below."
              />
            )}

            {/* Saved contacts */}
            {contacts.map(contact => (
              <div
                className="saved-contact-card"
                key={contact._id}
              >
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
                  <button
                    disabled={disabled}
                    onClick={() => editContact(contact)}
                  >
                    Edit
                  </button>

                  <button
                    disabled={disabled}
                    onClick={() => deleteContact(contact._id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            {/* Operation feedback */}
            {success && (
              <p className="save-message" role="status">
                {success}
              </p>
            )}

            {saveError && (
              <div className="ui-state error-state" role="alert">
                <p>{saveError}</p>
              </div>
            )}

            {/* Add/edit contact form */}
            <form
              className="contact-form"
              onSubmit={saveContact}
            >
              <h3>
                {editingId ? 'Edit contact' : 'Add a person'}
              </h3>

              <label htmlFor="contact-name">Name</label>
              <input
                id="contact-name"
                required
                disabled={disabled}
                value={form.name}
                placeholder="Contact name"
                onChange={e =>
                  updateField('name', e.target.value)
                }
              />

              <label htmlFor="contact-phone">
                Phone number
              </label>

              <input
                id="contact-phone"
                required
                type="tel"
                inputMode="tel"
                disabled={disabled}
                value={form.phone}
                placeholder="03001234567"
                onChange={e =>
                  updateField('phone', e.target.value)
                }
              />

              <label htmlFor="contact-relation">
                Relationship
              </label>

              <input
                id="contact-relation"
                disabled={disabled}
                value={form.relation}
                placeholder="Mother, sibling, friend..."
                onChange={e =>
                  updateField('relation', e.target.value)
                }
              />

              <label className="first-contact-checkbox">
                <input
                  type="checkbox"
                  disabled={disabled}
                  checked={form.first}
                  onChange={e =>
                    updateField('first', e.target.checked)
                  }
                />

                Put this person first
              </label>

              <button
                className="prepare-save-button"
                type="submit"
                disabled={disabled}
              >
                {saving
                  ? 'Saving...'
                  : editingId
                    ? 'Save changes'
                    : 'Save contact'}
              </button>

              {editingId && (
                <button
                  className="cancel-edit-button"
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    resetForm()
                    setSaveError('')
                  }}
                >
                  Cancel
                </button>
              )}
            </form>
          </>
        )}

      </section>
    </Layout>
  )
}

export default EmergencyContacts
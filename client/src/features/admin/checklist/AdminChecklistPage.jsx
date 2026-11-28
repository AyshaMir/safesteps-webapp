import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import AdminLayout from '../AdminLayout';
import Button from '../../../components/Button';
import TextField from '../../../components/TextField';
import WarningBox from '../../../components/WarningBox';
import { api } from '../../../api/api';
import { KNOWN_CATEGORIES, groupByCategory, sortCategories, titleCase } from './categories';

// Admin: Checklist Items. Items grouped by category, each with a
// Draft / Published toggle and Edit. No delete: unpublish instead.
export default function AdminChecklistPage() {
  const [items, setItems] = useState(null);
  const [loadError, setLoadError] = useState(null);

  const fetchItems = useCallback(
    () =>
      api('/admin/checklist')
        .then((data) => setItems(data.items))
        .catch((err) => setLoadError(err.message)),
    []
  );

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  function retry() {
    setLoadError(null);
    fetchItems();
  }

  const replace = (item) => setItems((prev) => prev.map((i) => (i._id === item._id ? item : i)));
  const add = (item) => setItems((prev) => [...prev, item]);

  const categories = useMemo(
    () => sortCategories([...new Set([...KNOWN_CATEGORIES, ...(items ?? []).map((i) => i.category)])]),
    [items]
  );
  const groups = useMemo(() => groupByCategory(items ?? []), [items]);
  const publishedCount = (items ?? []).filter((i) => i.published).length;

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-page__head">
          <h1 className="h1">Checklist Items</h1>
          {items && (
            <p className="muted">
              {publishedCount} of {items.length} published. Users only see published items.
            </p>
          )}
        </div>

        {loadError && <WarningBox title="Couldn't load checklist items" onRetry={retry}>{loadError}</WarningBox>}

        {!items && !loadError && (
          <div className="skeleton" aria-busy="true" aria-label="Loading">
            <div className="skeleton__block" />
            <div className="skeleton__block" />
            <div className="skeleton__block" />
          </div>
        )}

        {items && items.length === 0 && (
          <p className="empty">No checklist items yet. Add the first one below.</p>
        )}

        {groups.map(({ category, items: rows }) => (
          <section key={category} className="admin-group">
            <h2 className="h2">{titleCase(category)}</h2>
            <ul className="admin-list">
              {rows.map((item) => (
                <ItemRow key={item._id} item={item} categories={categories} onSaved={replace} />
              ))}
            </ul>
          </section>
        ))}

        {items && <AddItemForm categories={categories} onAdded={add} />}
      </div>
    </AdminLayout>
  );
}

function ItemRow({ item, categories, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function save(changes) {
    setBusy(true);
    setError(null);
    try {
      const data = await api(`/admin/checklist/${item._id}`, { method: 'PUT', body: changes });
      onSaved(data.item);
      setEditing(false);
      return null;
    } catch (err) {
      setError(err.message);
      return err;
    } finally {
      setBusy(false);
    }
  }

  if (editing) {
    return (
      <li className="admin-row admin-row--editing">
        <ItemForm
          initial={item}
          categories={categories}
          submitLabel="Save"
          onSubmit={save}
          onCancel={() => setEditing(false)}
        />
      </li>
    );
  }

  return (
    <li className="admin-row">
      <span className="admin-row__name">{item.name}</span>
      <StatusToggle
        published={item.published}
        disabled={busy}
        onChange={(published) => save({ published })}
        label={item.name}
      />
      <button type="button" className="text-btn" onClick={() => setEditing(true)}>
        Edit
      </button>
      {error && (
        <p className="field__error admin-row__error">
          <span className="bang" aria-hidden="true">!</span>
          {error}
        </p>
      )}
    </li>
  );
}

function StatusToggle({ published, onChange, disabled, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={published}
      aria-label={`${label}: ${published ? 'Published' : 'Draft'}`}
      className={`status-toggle ${published ? 'status-toggle--on' : ''}`}
      disabled={disabled}
      onClick={() => onChange(!published)}
    >
      <span className="status-toggle__knob" aria-hidden="true" />
      <span className="status-toggle__label">{published ? 'Published' : 'Draft'}</span>
    </button>
  );
}

function AddItemForm({ categories, onAdded }) {
  const [key, setKey] = useState(0); // remount to clear after adding

  async function add(values) {
    try {
      const data = await api('/admin/checklist', { method: 'POST', body: values });
      onAdded(data.item);
      setKey((k) => k + 1);
      return null;
    } catch (err) {
      return err;
    }
  }

  return (
    <section className="admin-group admin-add">
      <h2 className="h2">Add item</h2>
      <p className="muted">New items start as drafts. Publish them when they&apos;re ready.</p>
      <ItemForm key={key} categories={categories} submitLabel="Save" onSubmit={add} />
    </section>
  );
}

// Shared by Add and Edit. onSubmit returns null on success or an ApiError.
function ItemForm({ initial, categories, submitLabel, onSubmit, onCancel }) {
  const listId = useId();
  const [form, setForm] = useState({ name: initial?.name ?? '', category: initial?.category ?? '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [busy, setBusy] = useState(false);

  const update = (key) => (e) => {
    setForm({ ...form, [key]: e.target.value });
    setErrors({ ...errors, [key]: null });
  };

  async function submit(e) {
    e.preventDefault();
    const found = {};
    if (!form.name.trim()) found.name = 'Enter a name';
    if (!form.category.trim()) found.category = 'Choose a category';
    setErrors(found);
    setFormError(null);
    if (Object.keys(found).length) return;

    setBusy(true);
    const err = await onSubmit({ name: form.name.trim(), category: form.category.trim().toLowerCase() });
    setBusy(false);
    if (err) {
      if (err.fields && Object.keys(err.fields).length) setErrors(err.fields);
      else setFormError(err.message);
    }
  }

  return (
    <form className="item-form" onSubmit={submit} noValidate>
      {formError && <WarningBox title={formError} />}
      <div className="item-form__fields">
        <TextField label="Name" value={form.name} onChange={update('name')} error={errors.name} />
        <TextField
          label="Category"
          list={listId}
          value={form.category}
          onChange={update('category')}
          error={errors.category}
          hint="Pick one or type a new category"
        />
        <datalist id={listId}>
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>
      <div className="item-form__actions">
        <Button type="submit" disabled={busy}>
          {busy ? 'Saving…' : submitLabel}
        </Button>
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

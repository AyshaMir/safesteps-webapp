import { useEffect, useRef } from 'react';
import Call1122Bar from '../../components/Call1122Bar';
import { PhoneIcon } from '../../components/icons';

// Bottom sheet listing saved contacts; tapping a name dials it.
export default function CallSomeoneSheet({ contacts, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    // No close() on cleanup: it fires onClose and would shut the sheet straight
    // away under StrictMode's double mount. Unmounting removes the dialog anyway.
    if (!ref.current.open) ref.current.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      className="sheet"
      aria-labelledby="call-someone-title"
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
    >
      <div className="sheet__body">
        <span className="sheet__grabber" aria-hidden="true" />
        <h2 id="call-someone-title" className="h2">
          Call someone
        </h2>
        <p className="muted">Tap a name to call</p>
        <ul className="sheet__list">
          {contacts.map((c, i) => (
            <li key={c._id ?? i}>
              <a href={`tel:${c.phone}`} className="sheet__row">
                <span className={`avatars__one avatars__one--${i % 2}`} aria-hidden="true">
                  {c.name.trim().charAt(0).toUpperCase()}
                </span>
                <span className="sheet__who">
                  <span className="sheet__name">
                    {c.name}
                    {c.first && <span className="tag">First contact</span>}
                  </span>
                  <span className="muted">{c.phone}</span>
                </span>
                <span className="round-icon round-icon--solid">
                  <PhoneIcon size={20} />
                </span>
              </a>
            </li>
          ))}
        </ul>
        <button type="button" className="btn btn--neutral" onClick={onClose}>
          Cancel
        </button>
      </div>
      {/* The modal covers the page, so it carries its own Call 1122 bar. */}
      <Call1122Bar />
    </dialog>
  );
}

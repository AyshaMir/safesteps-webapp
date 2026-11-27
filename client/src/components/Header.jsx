import { UserCircle } from '@phosphor-icons/react'

function Header() {
  return (
    <header className="app-header">
      <h1>SafeSteps</h1>

      <button
        className="profile-button"
        type="button"
        aria-label="Profile"
      >
        <UserCircle size={30} weight="duotone" />
      </button>
    </header>
  )
}

export default Header
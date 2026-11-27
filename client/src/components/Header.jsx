import { UserCircle } from '@phosphor-icons/react'
import { NavLink, useNavigate } from 'react-router-dom'
function Header() {
  const navigate = useNavigate()
  return (
    <header className="app-header">
      <h1>SafeSteps</h1>

      <nav className="desktop-nav">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/learn">Learn</NavLink>
        <NavLink to="/prepare">Prepare</NavLink>
      </nav>

      <button
        className="profile-button"
        onClick={() => navigate('/profile')}
        type="button"
        aria-label="Profile"
      >
        <UserCircle size={30} weight="duotone" />
      </button>
    </header>
  )
}

export default Header
import { UserCircle } from '@phosphor-icons/react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

function Header() {
  const navigate = useNavigate()
  const { user, ready } = useAuth()

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
        onClick={() => navigate(user ? '/profile' : '/login')}
        type="button"
        disabled={!ready}
        aria-label={user ? 'Profile' : 'Sign in'}
      >
        <UserCircle size={30} weight="duotone" />
      </button>
    </header>
  )
}

export default Header
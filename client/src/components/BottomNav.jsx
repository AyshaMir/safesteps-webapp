import { NavLink } from 'react-router-dom'
import {
  House,
  BookOpen,
  ShieldCheck,
} from '@phosphor-icons/react'

function BottomNav() {
  return (
    <nav className="bottom-nav">
      <NavLink to="/" end>
        <House size={26} weight="duotone" />
        <span>Home</span>
      </NavLink>

      <NavLink to="/learn">
        <BookOpen size={26} weight="duotone" />
        <span>Learn</span>
      </NavLink>

      <NavLink to="/prepare">
        <ShieldCheck size={26} weight="duotone" />
        <span>Prepare</span>
      </NavLink>
    </nav>
  )
}

export default BottomNav
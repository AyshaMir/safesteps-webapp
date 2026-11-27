import Header from './Header'
import Call1122Bar from './Call1122Bar'
import BottomNav from './BottomNav'
import { OfflineState } from './UIStates'
import useOnlineStatus from '../hooks/useOnlineStatus'

function Layout({ children }) {
  const isOnline = useOnlineStatus()

  return (
    <div className="app-shell">
      <Header />

      <main className="page-content">
        {!isOnline && <OfflineState />}
        {children}
      </main>

      <Call1122Bar />
      <BottomNav />
    </div>
  )
}

export default Layout
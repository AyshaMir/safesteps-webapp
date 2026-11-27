import Header from './Header'
import Call1122Bar from './Call1122Bar'
import BottomNav from './BottomNav'

function Layout({ children }) {
  return (
    <div className="app-shell">
      <Header />

      <main className="page-content">
        {children}
      </main>

      <Call1122Bar />
      <BottomNav />
    </div>
  )
}

export default Layout
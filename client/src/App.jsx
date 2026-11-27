import { Routes, Route } from 'react-router-dom'

import Home from './Home'
import EmergencyPicker from './features/emergency/EmergencyPicker'
import EmergencySteps from './features/emergency/EmergencySteps'
import WhatNow from './features/emergency/WhatNow'

import PrepareHome from './features/prepare/PrepareHome'
import EmergencyPlan from './features/prepare/EmergencyPlan'
import KitChecklist from './features/prepare/KitChecklist'
import EmergencyContacts from './features/prepare/EmergencyContacts'
import PrepareIntro from './features/prepare/PrepareIntro'

function App() {
  // Temporary authentication flag
  const isLoggedIn = true
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/emergency" element={<EmergencyPicker />} />
      <Route path="/emergency/:slug" element={<EmergencySteps />} />
      <Route path="/emergency/:slug/done" element={<WhatNow />} />

      <Route
        path="/prepare"
        element={isLoggedIn ? <PrepareHome /> : <PrepareIntro />}
      />

      <Route
        path="/prepare/plan"
        element={isLoggedIn ? <EmergencyPlan /> : <PrepareIntro />}
      />

      <Route
        path="/prepare/checklist"
        element={isLoggedIn ? <KitChecklist /> : <PrepareIntro />}
      />

      <Route
        path="/prepare/contacts"
        element={isLoggedIn ? <EmergencyContacts /> : <PrepareIntro />}
      />
    </Routes>
  )
}

export default App
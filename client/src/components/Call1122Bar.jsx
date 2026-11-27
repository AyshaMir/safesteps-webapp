import { PhoneCall } from '@phosphor-icons/react'
import { RESCUE_NUMBER } from '../config/emergencyNumbers'

function Call1122Bar() {
  return (
    <a
      className="call-1122-bar"
      href={`tel:${RESCUE_NUMBER}`}
    >
      <PhoneCall size={28} weight="fill" />
      <span>Call {RESCUE_NUMBER}</span>
    </a>
  )
}

export default Call1122Bar
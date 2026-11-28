export const RESCUE_NUMBER = '1122'

export const emergencyNumbers = [
  { name: 'Police', phone: '15' },
  { name: 'Fire', phone: '16' },
  { name: 'Edhi', phone: '115' },
]

// Compatibility with Person 3's components
export const RESCUE = {
  number: RESCUE_NUMBER,
  label: 'Rescue',
}

export const OTHER_NUMBERS = emergencyNumbers.map(service => ({
  number: service.phone,
  label: service.name,
}))
export const extractEmailDomain = (email: string): string => email.split('@')[1]?.toLowerCase() || ''

export const extractYearFromDate = (date: string | undefined): string => (date ? new Date(date).getFullYear().toString() : '')

export const formatAddress = (address: string): string => {
  if (!address) return ''

  const formattedAddress = address
    .replace(/<br\s*[\/]?>/gi, ', ') // Replace `<br>` with comma and space.
    .replace(/\n/g, '') // Remove newlines.
    .replace(/  +/g, ' ') // Replace multiple spaces with a single space.
    .trim()

  return formattedAddress === ',' ? '' : formattedAddress
}

export const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000) % 60
  const minutes = Math.floor(ms / (1000 * 60)) % 60
  const hours = Math.floor(ms / (1000 * 60 * 60))

  return [hours, minutes, seconds].map(value => value.toString().padStart(2, '0')).join(':')
}

export const formatName = (fullName: string): string => {
  const nameWithoutSuffix = fullName.split(',')[0].trim()
  const nameParts = nameWithoutSuffix.split(/\s+/)
  const firstNameOrInitial = nameParts[0]
  const firstInitial = firstNameOrInitial.length > 1 ? `${firstNameOrInitial[0]}.` : firstNameOrInitial
  const lastName = nameParts[nameParts.length - 1]

  return `${lastName}, ${firstInitial}`
}

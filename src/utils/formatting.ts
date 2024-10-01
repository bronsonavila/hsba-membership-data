export const extractEmailDomain = (email: string): string => email.split('@')[1]?.toLowerCase() || ''

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

export const formatLawSchool = (lawSchool: string): string => lawSchool.replace('U.', 'University')

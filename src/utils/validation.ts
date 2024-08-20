import { INVALID_ADDRESSES, VALID_COUNTRY_CODES, VALID_US_STATES_AND_TERRITORIES } from '../constants/validation'

export const isAddressFormatValid = (fullAddress: string): boolean => Boolean(fullAddress && !INVALID_ADDRESSES.has(fullAddress))

export const isFormattedNameValid = (formattedName: string): boolean => {
  const regex = /^[^\s,]+(?:\s+[^\s,]+)*,\s[A-Z]\.$/ // Pattern: "LastName, F."

  return regex.test(formattedName)
}

export const isLocationValid = (location: string): boolean => {
  if (!location) return false

  const [country, usStateOrTerritory] = location.split('-')

  if (country === 'US' && VALID_US_STATES_AND_TERRITORIES.has(usStateOrTerritory)) {
    return true
  } else if (VALID_COUNTRY_CODES.has(country)) {
    return true
  }

  return false
}

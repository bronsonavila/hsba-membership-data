import { GOOGLE_GEOCODING_API_KEY } from '../constants/dotenv'
import { isAddressFormatValid } from '../utils/validation'
import { logError } from '../utils/logging'
import { retryOperation, sleep } from '../utils/scraping'
import { GeocodeResponse } from '../types'

const DELAY = 100

export const getAddressComponents = async (address: string, country: string, id: string): Promise<string> => {
  await sleep(DELAY)

  const fullAddress = address + (country ? ` ${country}` : '')

  if (!isAddressFormatValid(fullAddress)) return ''

  try {
    const response = await retryOperation(() =>
      fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${GOOGLE_GEOCODING_API_KEY}`)
    )

    if (!response.ok) throw new Error(`HTTP error: ${response.status}`)

    const data: GeocodeResponse = await response.json()

    if (data.status !== 'OK') throw new Error(`Geocoding API error: ${data.status}`)

    return data.results[0].address_components
      .filter(component => component.types.includes('political'))
      .reverse()
      .map(component => component.long_name)
      .join(' | ')
  } catch (error) {
    logError(error as Error, `ID: ${id}, Address: ${fullAddress}`)

    return ''
  }
}

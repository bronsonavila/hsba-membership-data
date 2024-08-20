import { formatName } from '../utils/formatting'
import { isAddressFormatValid, isFormattedNameValid, isLocationValid } from '../utils/validation'
import { LOCATION_EXTRACTION_PROMPT, NAME_FORMATTING_PROMPT } from '../constants/prompts'
import { logError } from '../utils/logging'
import { OPEN_AI_API_KEY } from '../constants/dotenv'
import { retryOperation } from '../utils/scraping'
import { sleep } from 'openai/core'
import OpenAI from 'openai'

const DELAY = 8640 // Avoid rate limiting on Tier 1 plan (10,000 RPD). TODO: Implement batching of inputs to increase throughput.

const OPEN_AI = new OpenAI({ apiKey: OPEN_AI_API_KEY })

const OPEN_AI_CONFIG = { model: 'gpt-4o-mini', temperature: 0 }

export const getFormattedName = async (rawName: string, id: string): Promise<string> => {
  await sleep(DELAY)

  try {
    const response = await retryOperation(() =>
      OPEN_AI.chat.completions.create({
        ...OPEN_AI_CONFIG,
        messages: [
          { role: 'system', content: NAME_FORMATTING_PROMPT },
          { role: 'user', content: `Format this name: ${rawName}` },
        ],
      })
    )

    const formattedName = response.choices[0].message.content?.trim() || ''

    if (!isFormattedNameValid(formattedName)) {
      throw new Error(`Invalid formatted name: ${formattedName}`)
    }

    return formattedName
  } catch (error) {
    logError(error as Error, `ID: ${id}, Name: ${rawName}`)

    return formatName(rawName) // Fallback to manual formatting, albeit potentially incorrect.
  }
}

export const getLocation = async (address: string, country: string, id: string): Promise<string> => {
  await sleep(DELAY)

  const fullAddress = address + (country ? ` ${country}` : '')

  if (!isAddressFormatValid(fullAddress)) {
    return ''
  }

  try {
    const response = await retryOperation(() =>
      OPEN_AI.chat.completions.create({
        ...OPEN_AI_CONFIG,
        messages: [
          { role: 'system', content: LOCATION_EXTRACTION_PROMPT },
          { role: 'user', content: `Address: ${fullAddress}` },
        ],
      })
    )

    const location = response.choices[0].message.content?.trim() || ''

    if (!isLocationValid(location)) {
      throw new Error(`Invalid location: ${location}`)
    }

    return location
  } catch (error) {
    logError(error as Error, `ID: ${id}, Address: ${fullAddress}`)

    return ''
  }
}

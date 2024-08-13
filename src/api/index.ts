import { HSBA_DIRECTORY_URL, IS_PUPPETEER_HEADLESS, OPEN_AI_API_KEY } from '../constants'
import { isFormattedNameValid, isLocationValid } from '../utils/validation'
import { LOCATION_EXTRACTION_PROMPT, NAME_FORMATTING_PROMPT } from '../prompts'
import OpenAI from 'openai'
import puppeteer, { Browser } from 'puppeteer'

const openAi = new OpenAI({ apiKey: OPEN_AI_API_KEY })

export const getFormattedNameWithAi = async (name: string): Promise<string> => {
  const response = await openAi.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: NAME_FORMATTING_PROMPT },
      { role: 'user', content: `Format this name: ${name}` },
    ],
    temperature: 0,
  })

  const formattedName = response.choices[0].message.content?.trim() || ''

  if (!isFormattedNameValid(formattedName)) {
    throw new Error(`Invalid formatted name: ${formattedName}`)
  }

  return formattedName
}

export const getMemberPage = async (id: string): Promise<string> => {
  let browser: Browser | undefined

  try {
    browser = await puppeteer.launch({ args: ['--start-maximized'], defaultViewport: null, headless: IS_PUPPETEER_HEADLESS })

    const page = await browser.newPage()

    await page.goto(HSBA_DIRECTORY_URL, { waitUntil: 'networkidle0' }) // Initial visit required to set cookies and prevent redirect behavior.
    await page.goto(`${HSBA_DIRECTORY_URL}${id}`, { waitUntil: 'networkidle0' })
    await page.waitForSelector('.PanelFieldValue')

    const content = await page.content()

    return content
  } catch (error) {
    throw new Error(`Error fetching member page: ${error}`)
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

// Google's Geocoding API would technically be a better but more expensive solution. OpenAI's `gpt-4o-mini` model is dirt cheap and more fun.
export const getLocationWithAi = async (address: string): Promise<string> => {
  const response = await openAi.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: LOCATION_EXTRACTION_PROMPT },
      { role: 'user', content: `Address: ${address}` },
    ],
    temperature: 0,
  })

  const location = response.choices[0].message.content?.trim() || ''

  if (!isLocationValid(location)) {
    throw new Error(`Invalid location: ${location}`)
  }

  return location
}

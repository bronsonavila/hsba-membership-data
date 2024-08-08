import { HSBA_DIRECTORY_URL, VALID_COUNTRY_CODES, VALID_US_STATES_AND_TERRITORIES } from '../constants'
import { logErrorToFile } from '../helpers/utilities'
import axios from 'axios'
import dotenv from 'dotenv'
import OpenAI from 'openai'

dotenv.config()

const openAi = new OpenAI({ apiKey: process.env.OPEN_AI_API_KEY })

export const getMemberPage = async (id: string): Promise<string> => {
  try {
    const response = await axios.get<string>(`${HSBA_DIRECTORY_URL}${id}`, { headers: { Cookie: process.env.COOKIE || '' } })

    return response.data
  } catch (error) {
    logErrorToFile(new Error(`Error fetching member page for ID ${id}: ${(error as Error).message}`))

    throw error
  }
}

// Google's Geocoding API would technically be a better choice, but OpenAI's `gpt-4o-mini` model is dirt cheap and more fun.
export const getStateAndCountryFromAddress = async (id: string, address: string): Promise<string> => {
  try {
    const response = await openAi.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a precise geographic information extractor. Follow these rules strictly:

          1. For USA addresses:
            - Provide only the two-letter state code currently in use by the United States Postal Service followed by ', USA'.
            - Format: 'XX, USA' (e.g., 'CA, USA', 'NY, USA').
            - Evaluate U.S. territories ('AS', 'GU', 'VI'), commonwealths ('MP', 'PR'), insular areas ('UM'), and military mail codes ('AA', 'AE', 'AP') as USA addresses.

          2. For non-USA addresses:
            - Provide only the ISO 3166-1 alpha-3 country code.
            - Format: 'XXX' (e.g., 'CAN' for Canada, 'FRA' for France).
            - Evaluate the Marshall Islands ('MHL'), Micronesia ('FSM'), and Palau ('PLW') as non-USA addresses.

          3. For unclear or incomplete addresses:
            - Respond with an empty string.

          4. Never guess or infer missing information.

          5. Respond ONLY with the extracted information or an empty string. Do not include any explanations or additional text. Do not include extra spaces, punctuation, or any characters other than the state abbreviation or country code.

          Examples:
          - '123 Main St, Springfield, IL 62701' → 'IL, USA'
          - '10 Downing Street, London, UK' → 'GBR'
          - 'Sydney Opera House, Australia' → 'AUS'
          - '123 Unknown Place, Nowhere' → ''

          Now, extract the appropriate geographic information from the provided address.`,
        },
        {
          role: 'user',
          content: `Address: ${address}`,
        },
      ],
      temperature: 0,
    })

    const responseContent = response.choices[0].message.content?.trim().replace(/^['"`](.+)['"`]$/, '$1') || '' // Remove quotes from response.

    const [stateOrCountry, country] = responseContent.split(', ')

    if (country === 'USA' && VALID_US_STATES_AND_TERRITORIES.has(stateOrCountry)) {
      return responseContent
    } else if (VALID_COUNTRY_CODES.has(stateOrCountry)) {
      return stateOrCountry
    } else {
      logErrorToFile(new Error(`Invalid response format from OpenAI for ID ${id}: ${responseContent}`), `Address: ${address}`)

      return ''
    }
  } catch (error) {
    logErrorToFile(new Error(`Error processing ID ${id}: ${(error as Error).message}`), `Address: ${address}`)

    return ''
  }
}

import dotenv from 'dotenv'

dotenv.config()

export const GOOGLE_GEOCODING_API_KEY = process.env.GOOGLE_GEOCODING_API_KEY || ''

export const IS_PUPPETEER_HEADLESS = process.env.IS_PUPPETEER_HEADLESS !== 'false'

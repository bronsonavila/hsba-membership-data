import dotenv from 'dotenv'

dotenv.config()

export const IS_PUPPETEER_HEADLESS = process.env.IS_PUPPETEER_HEADLESS !== 'false'

export const OPEN_AI_API_KEY = process.env.OPEN_AI_API_KEY || ''

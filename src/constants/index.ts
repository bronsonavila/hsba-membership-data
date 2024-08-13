import dotenv from 'dotenv'
import path from 'path'

dotenv.config()

const DATA_DIR = path.resolve(__dirname, '../../data')

export const ERROR_LOG_FILE = path.join(__dirname, '../../logs/errors.log')

export const HSBA_DIRECTORY_URL = 'https://hsba.org/HSBA/Directory/Directory_results.aspx?ID='

export const IS_PUPPETEER_HEADLESS = process.env.IS_PUPPETEER_HEADLESS !== 'false'

export const MEMBER_IDENTIFIERS_CSV = path.join(DATA_DIR, 'member-identifiers.csv')

export const MEMBER_RECORDS_CSV = path.join(DATA_DIR, 'member-records.csv')

export const MEMBER_RECORDS_CSV_HEADER = [
  { id: 'id', title: 'id' },
  { id: 'jdNumber', title: 'jdNumber' },
  { id: 'name', title: 'name' },
  { id: 'licenseType', title: 'licenseType' },
  { id: 'employer', title: 'employer' },
  { id: 'location', title: 'location' },
  { id: 'emailDomain', title: 'emailDomain' },
  { id: 'lawSchool', title: 'lawSchool' },
  { id: 'barAdmissionYear', title: 'barAdmissionYear' },
]

export const OPEN_AI_API_KEY = process.env.OPEN_AI_API_KEY || ''

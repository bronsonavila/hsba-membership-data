import dotenv from 'dotenv'
import { createObjectCsvWriter } from 'csv-writer'
import axios from 'axios'
import cheerio from 'cheerio'
import csvParser from 'csv-parser'
import fs from 'fs'
import util from 'util'

dotenv.config()

util.inspect.defaultOptions.maxArrayLength = null // Do not truncate arrays in console output.

// CONSTANTS

const DATA_DIR = './data'
const FULL_MEMBERS_CSV = `${DATA_DIR}/members-full.csv`
const LIMITED_MEMBERS_CSV = `${DATA_DIR}/members-limited.csv`

// Corresponds to the order in which fields are npm displayed on the member's page.
const FIELD_INDEX_MAP = {
  name: 0,
  jd_number: 1,
  license_type: 2,
  employer: 3,
  address: 4,
  country: 5,
  phone: 6,
  fax: 7,
  email: 8,
  law_school: 9,
  graduated: 10,
  admitted_hi_bar: 11,
}

const HSBA_DIRECTORY_URL = 'https://hsba.org/HSBA/Directory/Directory_results.aspx?ID='

// TYPES

type LimitedMemberData = {
  id: string
  jd_number: string
  license_type: string
  name: string
}

type FullMemberData = LimitedMemberData & {
  address: string
  admitted_hi_bar: string
  email: string
  employer: string
  law_school: string
}

// MAIN FUNCTION

const writeFullMemberResultsToCsv = async (): Promise<void> => {
  const startTime = Date.now()

  const csvWriter = createCsvWriter()
  const membersLimited = await readCsvFile(LIMITED_MEMBERS_CSV)
  const records: FullMemberData[] = []

  for (const [index, member] of membersLimited.entries()) {
    try {
      const html = await fetchMemberPage(member.id)
      const fields = parseMemberHtml(html)
      const record = createMemberRecord(member.id, fields)

      records.push(record)

      logProgress(index, membersLimited.length, record)
    } catch (error) {
      console.error(`Error processing member ${member.id}:`, error)
    }

    await delay(1000)
  }

  await csvWriter.writeRecords(records)

  const duration = Date.now() - startTime

  console.log(`Task complete. Duration: ${formatDuration(duration)}`)
}

// HELPER FUNCTIONS

const createCsvWriter = () =>
  createObjectCsvWriter({
    header: [
      { id: 'id', title: 'id' },
      { id: 'name', title: 'name' },
      { id: 'jd_number', title: 'jd_number' },
      { id: 'license_type', title: 'license_type' },
      { id: 'employer', title: 'employer' },
      { id: 'address', title: 'address' },
      { id: 'email', title: 'email' },
      { id: 'law_school', title: 'law_school' },
      { id: 'admitted_hi_bar', title: 'admitted_hi_bar' },
    ],
    path: FULL_MEMBERS_CSV,
  })

const createMemberRecord = (id: string, fields: string[]): FullMemberData => ({
  id,
  name: extractFirstInitialAndLastName(fields[FIELD_INDEX_MAP.name]),
  jd_number: fields[FIELD_INDEX_MAP.jd_number] || '',
  license_type: fields[FIELD_INDEX_MAP.license_type]?.trim() || '',
  employer: fields[FIELD_INDEX_MAP.employer]?.trim() || '',
  address: formatAddress(fields[FIELD_INDEX_MAP.address]),
  email: extractEmailDomain(fields[FIELD_INDEX_MAP.email]),
  law_school: fields[FIELD_INDEX_MAP.law_school]?.trim() || '',
  admitted_hi_bar: formatAdmittedYear(fields[FIELD_INDEX_MAP.admitted_hi_bar]),
})

const decodeEmail = (encodedEmail: string): string => {
  const key = parseInt(encodedEmail.slice(0, 2), 16)
  let uriComponent = ''

  for (let i = 2; i < encodedEmail.length; i += 2) {
    const charCode = parseInt(encodedEmail.slice(i, i + 2), 16) ^ key

    uriComponent += String.fromCharCode(charCode)
  }

  return decodeURIComponent(uriComponent) // Silly Cloudflare… You can't stop me.
}

const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms))

const extractEmailDomain = (email: string | undefined): string => {
  const domain = email?.split('@')[1]

  return domain ? domain.trim().toLowerCase() : ''
}

const extractFirstInitialAndLastName = (fullName: string): string => {
  const nameWithoutSuffix = fullName.split(',')[0].trim()
  const nameParts = nameWithoutSuffix.split(/\s+/)
  const firstNameOrInitial = nameParts[0]
  const firstInitial = firstNameOrInitial.length > 1 ? `${firstNameOrInitial[0]}.` : firstNameOrInitial
  const lastName = nameParts[nameParts.length - 1]

  return `${firstInitial} ${lastName}`
}

const fetchMemberPage = async (memberId: string): Promise<string> => {
  const response = await axios.get<string>(`${HSBA_DIRECTORY_URL}${memberId}`, { headers: { Cookie: process.env.COOKIE || '' } })

  return response.data
}

const formatAddress = (address: string | undefined): string => {
  if (!address) return ''

  const formattedAddress = address
    .replace(/<br\s*[\/]?>/gi, ', ') // Replace `<br>` with comma and space.
    .replace(/\n/g, '') // Remove newlines.
    .replace(/  +/g, ' ') // Replace multiple spaces with a single space.
    .trim()

  return formattedAddress === ',' ? '' : formattedAddress
}

const formatAdmittedYear = (date: string | undefined): string => (date ? new Date(date).getFullYear().toString() : '')

const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000) % 60
  const minutes = Math.floor(ms / (1000 * 60)) % 60
  const hours = Math.floor(ms / (1000 * 60 * 60))

  return [hours, minutes, seconds].map(val => val.toString().padStart(2, '0')).join(':')
}

const logProgress = (index: number, total: number, record: FullMemberData): void => {
  const percentage = ((index + 1) / total) * 100

  console.log(`${index} ${util.inspect(record, { depth: null, colors: true })} ...${percentage.toFixed(3)}%`)
}

const parseMemberHtml = (html: string): string[] => {
  const $ = cheerio.load(html)

  return $('.PanelFieldValue')
    .map((index, element) => {
      const fieldValue = $(element).find('span')

      if (index === FIELD_INDEX_MAP.address) {
        return formatAddress(fieldValue.html() || '')
      }

      if (index === FIELD_INDEX_MAP.email) {
        const encodedEmail = fieldValue.find('.__cf_email__').attr('data-cfemail')

        return encodedEmail ? decodeEmail(encodedEmail) : fieldValue.text()
      }

      return fieldValue.text()
    })
    .get()
}

const readCsvFile = (filePath: string): Promise<LimitedMemberData[]> =>
  new Promise((resolve, reject) => {
    const results: LimitedMemberData[] = []

    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (data: LimitedMemberData) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject)
  })

// INITIALIZATION

writeFullMemberResultsToCsv()

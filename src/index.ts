import dotenv from 'dotenv'
import { createObjectCsvWriter } from 'csv-writer'
import axios, { AxiosResponse } from 'axios'
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
const FIELD_INDEX_MAP: Record<string, number> = {
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

// FUNCTIONS – MAIN

const writeFullMemberResultsToCsv = async (): Promise<void> => {
  const startTime = Date.now()

  const membersLimited = await readCsvFile(LIMITED_MEMBERS_CSV)
  const csvWriter = createObjectCsvWriter({
    path: FULL_MEMBERS_CSV,
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
  })

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

  const endTime = Date.now()
  const duration = endTime - startTime

  console.log(`Task complete. Duration: ${formatDuration(duration)}`)
}

// FUNCTIONS – HELPERS

const createMemberRecord = (id: string, fields: string[]): FullMemberData => ({
  id,
  name: fields[FIELD_INDEX_MAP.name]?.trim() || '',
  jd_number: fields[FIELD_INDEX_MAP.jd_number] || '',
  license_type: fields[FIELD_INDEX_MAP.license_type]?.trim() || '',
  employer: fields[FIELD_INDEX_MAP.employer]?.trim() || '',
  address: formatAddress(fields[FIELD_INDEX_MAP.address]),
  email: extractEmailDomain(fields[FIELD_INDEX_MAP.email]),
  law_school: fields[FIELD_INDEX_MAP.law_school]?.trim() || '',
  admitted_hi_bar: fields[FIELD_INDEX_MAP.admitted_hi_bar]
    ? new Date(fields[FIELD_INDEX_MAP.admitted_hi_bar]).getFullYear().toString()
    : '',
})

const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms))

const extractEmailDomain = (email: string | undefined): string => {
  const domain = email?.split('@')[1]

  return domain ? `${domain.trim().toLowerCase()}` : ''
}

const fetchMemberPage = async (memberId: string): Promise<string> => {
  const response: AxiosResponse<string> = await axios.get<string>(`${HSBA_DIRECTORY_URL}${memberId}`, {
    headers: { Cookie: process.env.COOKIE || '' },
  })

  return response.data
}

const formatAddress = (address: string | undefined): string => {
  const trimmedAddress = address?.trim()

  return trimmedAddress === ',' ? '' : trimmedAddress || ''
}

const formatDuration = (ms: number): string => {
  let seconds = Math.floor(ms / 1000)
  let minutes = Math.floor(seconds / 60)
  let hours = Math.floor(minutes / 60)

  seconds %= 60
  minutes %= 60

  const formattedHours = hours.toString().padStart(2, '0')
  const formattedMinutes = minutes.toString().padStart(2, '0')
  const formattedSeconds = seconds.toString().padStart(2, '0')

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`
}

const logProgress = (index: number, total: number, record: FullMemberData): void => {
  const percentage = ((index + 1) / total) * 100

  console.log(`${index} ${util.inspect(record, { depth: null, colors: true })} ...${percentage.toFixed(3)}%`)
}

const parseMemberHtml = (html: string): string[] => {
  const $ = cheerio.load(html)
  const fields = $('.PanelFieldValue')

  return fields
    .map((index, element) => {
      const fieldValue = $(element).find('span')

      return index === FIELD_INDEX_MAP.address
        ? fieldValue
            .html()
            ?.replace(/<br\s*[\/]?>/gi, ', ') // Replace `<br>` with comma and space.
            .replace(/\n/g, '') // Remove newlines.
            .replace(/  +/g, ' ') || '' // Replace multiple spaces with a single space.
        : fieldValue.text()
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

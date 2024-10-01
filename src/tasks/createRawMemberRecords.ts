import { formatAddress } from '../utils/formatting'
import { HSBA_DIRECTORY_RESULTS_URL } from '../constants/urls'
import { IS_PUPPETEER_HEADLESS } from '../constants/dotenv'
import { logError, logProgress } from '../utils/logging'
import { MEMBER_IDENTIFIERS_PATH, RAW_MEMBER_RECORDS_HEADER, RAW_MEMBER_RECORDS_PATH } from '../constants/csv'
import { MemberIdentifier, MemberRecordFieldOrder, RawMemberRecord } from '../types'
import { readCsv, writeCsv } from '../utils/csv'
import { retryOperation, sleep } from '../utils/scraping'
import cheerio from 'cheerio'
import puppeteer, { Browser, Page } from 'puppeteer'

const DELAY = 3000

export const createRawMemberRecords = async (): Promise<void> => {
  const memberIdentifiers = await readCsv<MemberIdentifier>(MEMBER_IDENTIFIERS_PATH)
  const rawMemberRecords: RawMemberRecord[] = []

  let browser: Browser | undefined

  console.log('Creating raw member records...')

  try {
    browser = await puppeteer.launch({ args: ['--start-maximized'], defaultViewport: null, headless: IS_PUPPETEER_HEADLESS })

    const page = await browser.newPage()

    // Initial visit required to set cookies and avoid redirect when visiting member pages.
    await retryOperation(async () => await page.goto(HSBA_DIRECTORY_RESULTS_URL, { waitUntil: 'networkidle0' }))

    for (const [index, member] of memberIdentifiers.entries()) {
      try {
        const html = await getMemberPageContent(member.id, page)
        const fields = parseMemberPageHtml(html)
        const rawMemberRecord = setRawMemberRecord(member.id, fields)

        rawMemberRecords.push(rawMemberRecord)

        logProgress('Raw Member Records', index, rawMemberRecord, memberIdentifiers.length)
      } catch (error) {
        logError(error as Error, `ID: ${member.id}, Index: ${index}`)
      }
    }

    await writeCsv(rawMemberRecords, RAW_MEMBER_RECORDS_HEADER, RAW_MEMBER_RECORDS_PATH)
  } finally {
    if (browser) {
      await browser.close()
    }
  }

  console.log('Raw member records created.')
}

const getMemberPageContent = async (id: string, page: Page): Promise<string> =>
  retryOperation(async () => {
    await sleep(DELAY)

    await page.goto(`${HSBA_DIRECTORY_RESULTS_URL}${id}`, { waitUntil: 'networkidle0' })
    await page.waitForSelector('.PanelFieldValue')

    return await page.content()
  })

const parseMemberPageHtml = (html: string): string[] => {
  const $ = cheerio.load(html)

  return $('.PanelFieldValue')
    .map((index, element) => {
      const fieldValue = $(element).find('span')

      if (index === MemberRecordFieldOrder.Address) {
        return formatAddress(fieldValue.html() || '')
      }

      return fieldValue.text().trim()
    })
    .get()
}

const setRawMemberRecord = (id: string, fields: string[]): RawMemberRecord => ({
  id,
  name: fields[MemberRecordFieldOrder.Name],
  jdNumber: fields[MemberRecordFieldOrder.JdNumber],
  licenseType: fields[MemberRecordFieldOrder.LicenseType],
  employer: fields[MemberRecordFieldOrder.Employer],
  address: fields[MemberRecordFieldOrder.Address],
  country: fields[MemberRecordFieldOrder.Country],
  phone: fields[MemberRecordFieldOrder.Phone],
  fax: fields[MemberRecordFieldOrder.Fax],
  email: fields[MemberRecordFieldOrder.Email],
  lawSchool: fields[MemberRecordFieldOrder.LawSchool],
  graduated: fields[MemberRecordFieldOrder.Graduated],
  admittedHiBar: fields[MemberRecordFieldOrder.AdmittedHiBar],
})

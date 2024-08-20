import { clickAndWait } from '../utils/scraping'
import { HSBA_HOME_PAGE_URL } from '../constants/urls'
import { IS_PUPPETEER_HEADLESS } from '../constants/dotenv'
import { MEMBER_IDENTIFIERS_HEADER, MEMBER_IDENTIFIERS_PATH } from '../constants/csv'
import { MemberIdentifier } from '../types'
import { writeCsv } from '../utils/csv'
import puppeteer, { Browser } from 'puppeteer'

export const createMemberIdentifiers = async (): Promise<void> => {
  let browser: Browser | null = null

  console.log('Creating member identifiers...')

  try {
    browser = await puppeteer.launch({ args: ['--start-maximized'], defaultViewport: null, headless: IS_PUPPETEER_HEADLESS })

    const page = await browser.newPage()

    await page.goto(HSBA_HOME_PAGE_URL, { waitUntil: 'networkidle0' })
    await page.type('#txtDirectorySearchFirstName', '"')
    await page.click('#btnDirectorySearch')
    await page.waitForNetworkIdle()

    await clickAndWait(page, 'a[title="Click here to sort"]')
    await clickAndWait(page, 'a.AddPaddingLeft')

    const ascendingResults = await page.evaluate(parseMemberSearchResults)

    await clickAndWait(page, 'a[title="Click here to sort"]')

    const descendingResults = await page.evaluate(parseMemberSearchResults)

    const mergedAndSortedResults = Array.from(
      new Map([...ascendingResults, ...descendingResults].map(member => [member.id, member])).values()
    ).sort((a, b) => Number(a.jdNumber) - Number(b.jdNumber))

    await writeCsv(mergedAndSortedResults, MEMBER_IDENTIFIERS_HEADER, MEMBER_IDENTIFIERS_PATH)
  } catch (error) {
    console.error('Error scraping member identifiers:', error)
  } finally {
    if (browser) await browser.close()

    console.log('Member identifiers created.')
  }
}

const parseMemberSearchResults = (): MemberIdentifier[] => {
  const tableBody = document.querySelectorAll('.rgMasterTable > tbody')[0]
  const rows = Array.from(tableBody.querySelectorAll('tr'))

  return rows
    .map(row => {
      const cells = Array.from(row.querySelectorAll('td'))
      const id = cells[3].innerText.trim()
      const jdNumber = cells[0].innerText.trim()

      return jdNumber ? { id, jdNumber } : null
    })
    .filter((member): member is MemberIdentifier => member !== null)
}

import { getFormattedNameWithAi, getLocationWithAi } from '../api'
import { isAddressFormatValid } from './validation'
import { logError } from './logging'
import { MemberRecordFieldOrder } from '../types'
import cheerio from 'cheerio'
import csvParser from 'csv-parser'
import fs from 'fs'

export const extractEmailDomain = (email: string): string => email.split('@')[1]?.toLowerCase() || ''

export const extractYearFromDate = (date: string | undefined): string => (date ? new Date(date).getFullYear().toString() : '')

const formatAddress = (address: string): string => {
  if (!address) return ''

  const formattedAddress = address
    .replace(/<br\s*[\/]?>/gi, ', ') // Replace `<br>` with comma and space.
    .replace(/\n/g, '') // Remove newlines.
    .replace(/  +/g, ' ') // Replace multiple spaces with a single space.
    .trim()

  return formattedAddress === ',' ? '' : formattedAddress
}

export const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000) % 60
  const minutes = Math.floor(ms / (1000 * 60)) % 60
  const hours = Math.floor(ms / (1000 * 60 * 60))

  return [hours, minutes, seconds].map(value => value.toString().padStart(2, '0')).join(':')
}

export const formatName = (fullName: string): string => {
  const nameWithoutSuffix = fullName.split(',')[0].trim()
  const nameParts = nameWithoutSuffix.split(/\s+/)
  const firstNameOrInitial = nameParts[0]
  const firstInitial = firstNameOrInitial.length > 1 ? `${firstNameOrInitial[0]}.` : firstNameOrInitial
  const lastName = nameParts[nameParts.length - 1]

  return `${lastName}, ${firstInitial}`
}

export const parseMemberPageHtml = (html: string): string[] => {
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

export const readCsvFile = <T extends object>(filePath: string): Promise<T[]> =>
  new Promise((resolve, reject) => {
    const results: T[] = []

    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (data: T) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject)
  })

export const retryOperation = async <T>(operation: () => Promise<T>, retries: number = 3, delay: number = 1000): Promise<T> => {
  try {
    return await operation()
  } catch (error) {
    if (retries > 0) {
      console.info(`Retrying operation... Attempts left: ${retries}, retrying in ${delay} ms`)

      await sleep(delay)

      return retryOperation(operation, retries - 1, delay * 2)
    }

    throw error
  }
}

export const setLocation = async (address: string, country: string, id: string): Promise<string> => {
  const fullAddress = address + (country ? ` ${country}` : '')

  if (!isAddressFormatValid(fullAddress)) {
    return ''
  }

  try {
    return await getLocationWithAi(fullAddress)
  } catch (error) {
    logError(error as Error, `ID: ${id}, Address: ${fullAddress}`)

    return ''
  }
}

export const setName = async (rawName: string, id: string): Promise<string> => {
  try {
    return await getFormattedNameWithAi(rawName)
  } catch (error) {
    logError(error as Error, `ID: ${id}, Name: ${rawName}`)

    return formatName(rawName) // Fallback to formatting name manually, albeit potentially incorrect.
  }
}

export const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms))

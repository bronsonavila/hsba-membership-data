import { ERROR_LOG_FILE } from '../constants'
import { getStateAndCountryFromAddress } from '../api'
import { MemberDataComplete, MemberFieldIndex } from '../types/types'
import cheerio from 'cheerio'
import fs from 'fs'
import util from 'util'
import path from 'path'

util.inspect.defaultOptions.maxArrayLength = null // Do not truncate arrays in console output.

export const createMemberRecord = async (id: string, fields: string[]): Promise<MemberDataComplete> => {
  const stateAndCountry = await getStateAndCountry(id, fields[MemberFieldIndex.address])

  return {
    id,
    name: extractFirstInitialAndLastName(fields[MemberFieldIndex.name]),
    jd_number: fields[MemberFieldIndex.jd_number] || '',
    license_type: fields[MemberFieldIndex.license_type]?.trim() || '',
    employer: fields[MemberFieldIndex.employer]?.trim() || '',
    address: stateAndCountry,
    email: extractEmailDomain(fields[MemberFieldIndex.email]),
    law_school: fields[MemberFieldIndex.law_school]?.trim() || '',
    admitted_hi_bar: formatAdmittedYear(fields[MemberFieldIndex.admitted_hi_bar]),
  }
}

const decodeEmail = (encodedEmail: string): string => {
  const key = parseInt(encodedEmail.slice(0, 2), 16)
  let uriComponent = ''

  for (let i = 2; i < encodedEmail.length; i += 2) {
    const charCode = parseInt(encodedEmail.slice(i, i + 2), 16) ^ key

    uriComponent += String.fromCharCode(charCode)
  }

  return decodeURIComponent(uriComponent) // Silly Cloudflare… was this the best you could do?
}

export const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms))

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

export const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000) % 60
  const minutes = Math.floor(ms / (1000 * 60)) % 60
  const hours = Math.floor(ms / (1000 * 60 * 60))

  return [hours, minutes, seconds].map(value => value.toString().padStart(2, '0')).join(':')
}

export const getStateAndCountry = async (id: string, address: string | undefined): Promise<string> => {
  const fullAddress = formatAddress(address)
  const stateAndCountry = fullAddress ? await getStateAndCountryFromAddress(id, fullAddress) : ''

  return stateAndCountry
}

export const logErrorToFile = (error: Error, context: string = ''): void => {
  const logsDirectory = path.dirname(ERROR_LOG_FILE)

  if (!fs.existsSync(logsDirectory)) {
    fs.mkdirSync(logsDirectory, { recursive: true })
  }

  const errorMessage = `[${new Date().toISOString()}] ${context ? `Context: ${context}\n` : ''}${error.stack || error}\n`

  console.error(errorMessage)

  fs.appendFile(ERROR_LOG_FILE, errorMessage, err => {
    if (err) {
      console.error('Failed to write to error log file:', err)
    }
  })
}

export const logProgress = (index: number, total: number, record: MemberDataComplete): void => {
  const percentage = ((index + 1) / total) * 100

  console.log(`${index} ${util.inspect(record, { depth: null, colors: true })} ...${percentage.toFixed(3)}%`)
}

export const parseMemberHtml = (html: string): string[] => {
  const $ = cheerio.load(html)

  return $('.PanelFieldValue')
    .map((index, element) => {
      const fieldValue = $(element).find('span')

      if (index === MemberFieldIndex.address) {
        return formatAddress(fieldValue.html() || '')
      }

      if (index === MemberFieldIndex.email) {
        const encodedEmail = fieldValue.find('.__cf_email__').attr('data-cfemail')

        return encodedEmail ? decodeEmail(encodedEmail) : fieldValue.text()
      }

      return fieldValue.text()
    })
    .get()
}

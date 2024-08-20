import { ProcessedMemberRecord, RawMemberRecord } from '../types'
import fs from 'fs'
import path from 'path'
import util from 'util'

const ERROR_LOG_FILE = path.join(__dirname, '../../logs/errors.log')

export const logError = (error: Error, context: string = ''): void => {
  const logsDirectory = path.dirname(ERROR_LOG_FILE)

  if (!fs.existsSync(logsDirectory)) {
    fs.mkdirSync(logsDirectory, { recursive: true })
  }

  const errorMessage = `[${new Date().toISOString()}] ${context ? `Context – ${context}\n` : ''}${error.stack || error}\n`

  console.error(errorMessage)

  fs.appendFile(ERROR_LOG_FILE, errorMessage, error => {
    if (error) {
      console.error('Failed to write to error log file:', error)
    }
  })
}

export const logProgress = (phase: string, index: number, record: ProcessedMemberRecord | RawMemberRecord, total: number): void => {
  const percentage = (((index + 1) / total) * 100).toFixed(2)

  console.log(`[${phase}] ${index + 1}/${total} (${percentage}%)`)
  console.log(util.inspect(record, { depth: null, colors: true }))
  console.log('---')
}

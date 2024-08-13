import { ERROR_LOG_FILE } from '../../constants'
import { MemberRecord } from '../../types'
import fs from 'fs'
import path from 'path'
import util from 'util'

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

export const logProgress = (index: number, total: number, memberRecord: MemberRecord): void => {
  const percentage = ((index + 1) / total) * 100

  console.log(`${index} ${util.inspect(memberRecord, { depth: null, colors: true })} ...${percentage.toFixed(3)}%`)
}

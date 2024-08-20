import { extractEmailDomain, extractYearFromDate, formatDuration } from '../utils/formatting'
import { getFormattedName, getLocation } from '../api'
import { logError, logProgress } from '../utils/logging'
import { PROCESSED_MEMBER_RECORDS_HEADER, PROCESSED_MEMBER_RECORDS_PATH, RAW_MEMBER_RECORDS_PATH } from '../constants/csv'
import { ProcessedMemberRecord, RawMemberRecord } from '../types'
import { readCsv, writeCsv } from '../utils/csv'

export const createProcessedMemberRecords = async (): Promise<void> => {
  const startTime = Date.now()
  const processedMemberRecords: ProcessedMemberRecord[] = []

  console.log('Creating processed member records...')

  const rawMemberRecords = await readCsv<RawMemberRecord>(RAW_MEMBER_RECORDS_PATH)

  for (const [index, rawRecord] of rawMemberRecords.entries()) {
    try {
      const processedRecord = await processMemberRecord(rawRecord)

      processedMemberRecords.push(processedRecord)

      logProgress('Processed Member Records', index, processedRecord, rawMemberRecords.length)
    } catch (error) {
      logError(error as Error, `ID: ${rawRecord.id}`)
    }
  }

  await writeCsv(processedMemberRecords, PROCESSED_MEMBER_RECORDS_HEADER, PROCESSED_MEMBER_RECORDS_PATH)

  console.log('Processed member records created.')
  console.log(`Task complete. Duration: ${formatDuration(Date.now() - startTime)}`)
}

const processMemberRecord = async (rawRecord: RawMemberRecord): Promise<ProcessedMemberRecord> => {
  const { address, admittedHiBar, country, email, employer, id, jdNumber, lawSchool, licenseType, name } = rawRecord
  const location = await getLocation(address, country, id)
  const formattedName = await getFormattedName(name, id)

  return {
    id: id,
    jdNumber: jdNumber,
    name: formattedName,
    licenseType: licenseType,
    employer: employer,
    location,
    emailDomain: extractEmailDomain(email),
    lawSchool: lawSchool,
    barAdmissionYear: extractYearFromDate(admittedHiBar),
  }
}

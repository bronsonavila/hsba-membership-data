import { createObjectCsvWriter } from 'csv-writer'
import {
  extractEmailDomain,
  extractYearFromDate,
  formatDuration,
  parseMemberPageHtml,
  readCsvFile,
  retryOperation,
  setLocation,
  setName,
} from './utils'
import { getMemberPage } from './api'
import { logError, logProgress } from './utils/logging'
import { MEMBER_IDENTIFIERS_CSV, MEMBER_RECORDS_CSV, MEMBER_RECORDS_CSV_HEADER } from './constants'
import { MemberRecord, MemberIdentifiers, MemberRecordFieldOrder } from './types'

const createMemberRecord = async (id: string, fields: string[]): Promise<MemberRecord> => {
  const location = await setLocation(fields[MemberRecordFieldOrder.Address], fields[MemberRecordFieldOrder.Country], id)
  const name = await setName(fields[MemberRecordFieldOrder.Name], id)

  return {
    id,
    jdNumber: fields[MemberRecordFieldOrder.JdNumber],
    name,
    licenseType: fields[MemberRecordFieldOrder.LicenseType],
    employer: fields[MemberRecordFieldOrder.Employer],
    location,
    emailDomain: extractEmailDomain(fields[MemberRecordFieldOrder.Email]),
    lawSchool: fields[MemberRecordFieldOrder.LawSchool],
    barAdmissionYear: extractYearFromDate(fields[MemberRecordFieldOrder.AdmittedHiBar]),
  }
}

const writeMemberRecordsToCsv = async (): Promise<void> => {
  const startTime = Date.now()

  const memberIdentifiers = await readCsvFile<MemberIdentifiers>(MEMBER_IDENTIFIERS_CSV)
  const memberRecords: MemberRecord[] = []

  for (const [index, member] of memberIdentifiers.entries()) {
    try {
      const html = await retryOperation(() => getMemberPage(member.id))
      const fields = parseMemberPageHtml(html)
      const memberRecord = await createMemberRecord(member.id, fields)

      memberRecords.push(memberRecord)

      logProgress(index, memberIdentifiers.length, memberRecord)
    } catch (error) {
      logError(new Error(`Error processing member: ${error}`), `ID: ${member.id}, Index: ${index}`)
    }
  }

  const csvWriter = createObjectCsvWriter({ header: MEMBER_RECORDS_CSV_HEADER, path: MEMBER_RECORDS_CSV })
  await csvWriter.writeRecords(memberRecords)

  const duration = Date.now() - startTime

  console.log(`Task complete. Duration: ${formatDuration(duration)}`)
}

writeMemberRecordsToCsv()

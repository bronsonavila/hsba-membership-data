import { createCsvWriter, readCsvFile } from './helpers/csv'
import { createMemberRecord, delay, formatDuration, logErrorToFile, logProgress, parseMemberHtml } from './helpers/utilities'
import { getMemberPage } from './api'
import { MemberDataComplete, MemberDataPartial } from './types/types'
import { MEMBERS_PARTIAL_CSV } from './constants'

const writeMemberDataToCsv = async (): Promise<void> => {
  const startTime = Date.now()

  const completeMemberData: MemberDataComplete[] = []
  const partialMemberData = await readCsvFile<MemberDataPartial>(MEMBERS_PARTIAL_CSV)

  for (const [index, member] of partialMemberData.entries()) {
    try {
      const html = await getMemberPage(member.id)
      const fields = parseMemberHtml(html)
      const record = await createMemberRecord(member.id, fields)

      completeMemberData.push(record)

      logProgress(index, partialMemberData.length, record)
    } catch (error) {
      logErrorToFile(new Error(`Error processing member ${member.id}: ${error}`), `Index: ${index}`)
    }

    await delay(1000)
  }

  const csvWriter = createCsvWriter()
  await csvWriter.writeRecords(completeMemberData)

  const duration = Date.now() - startTime

  console.log(`Task complete. Duration: ${formatDuration(duration)}`)
}

writeMemberDataToCsv()

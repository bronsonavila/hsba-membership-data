import { createMemberIdentifiers } from './tasks/createMemberIdentifiers'
import { createProcessedMemberRecords } from './tasks/createProcessedMemberRecords'
import { createRawMemberRecords } from './tasks/createRawMemberRecords'
import { MEMBER_IDENTIFIERS_PATH, RAW_MEMBER_RECORDS_PATH } from './constants/csv'
import fs from 'fs'

const runTasks = async () => {
  if (fs.existsSync(MEMBER_IDENTIFIERS_PATH)) {
    console.log(`${MEMBER_IDENTIFIERS_PATH} already exists. Skipping task.`)
  } else {
    await createMemberIdentifiers()
  }

  if (fs.existsSync(RAW_MEMBER_RECORDS_PATH)) {
    console.log(`${RAW_MEMBER_RECORDS_PATH} already exists. Skipping task.`)
  } else {
    await createRawMemberRecords()
  }

  await createProcessedMemberRecords()
}

runTasks()

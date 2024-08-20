import { createObjectCsvWriter } from 'csv-writer'
import csvParser from 'csv-parser'
import fs from 'fs'

export const readCsv = <T>(path: string): Promise<T[]> =>
  new Promise((resolve, reject) => {
    const results: T[] = []

    fs.createReadStream(path)
      .pipe(csvParser())
      .on('data', (data: T) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject)
  })

export const writeCsv = async <T extends object>(data: T[], header: { id: string; title: string }[], path: string): Promise<void> => {
  const csvWriter = createObjectCsvWriter({ header, path })

  await csvWriter.writeRecords(data)

  console.log(`Results written to ${path}`)
}

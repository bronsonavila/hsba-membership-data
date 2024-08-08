import { createObjectCsvWriter } from 'csv-writer'
import { MEMBERS_COMPLETE_CSV } from '../constants'
import csvParser from 'csv-parser'
import fs from 'fs'

export const createCsvWriter = () =>
  createObjectCsvWriter({
    path: MEMBERS_COMPLETE_CSV,
    header: [
      { id: 'id', title: 'id' },
      { id: 'name', title: 'name' },
      { id: 'jd_number', title: 'jd_number' },
      { id: 'license_type', title: 'license_type' },
      { id: 'employer', title: 'employer' },
      { id: 'address', title: 'address' },
      { id: 'email', title: 'email' },
      { id: 'law_school', title: 'law_school' },
      { id: 'admitted_hi_bar', title: 'admitted_hi_bar' },
    ],
  })

export const readCsvFile = <T extends object>(filePath: string): Promise<T[]> =>
  new Promise((resolve, reject) => {
    const results: T[] = []

    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (data: T) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject)
  })

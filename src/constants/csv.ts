import path from 'path'

const DATA_DIR = path.resolve(__dirname, '../../data')

export const MEMBER_IDENTIFIERS_HEADER = [
  { id: 'id', title: 'id' },
  { id: 'jdNumber', title: 'jdNumber' },
]

export const MEMBER_IDENTIFIERS_PATH = path.join(DATA_DIR, 'member-identifiers.csv')

export const PROCESSED_MEMBER_RECORDS_HEADER = [
  { id: 'id', title: 'id' },
  { id: 'jdNumber', title: 'jdNumber' },
  { id: 'name', title: 'name' },
  { id: 'licenseType', title: 'licenseType' },
  { id: 'employer', title: 'employer' },
  { id: 'location', title: 'location' },
  { id: 'emailDomain', title: 'emailDomain' },
  { id: 'lawSchool', title: 'lawSchool' },
  { id: 'barAdmissionDate', title: 'barAdmissionDate' },
]

export const PROCESSED_MEMBER_RECORDS_PATH = path.join(DATA_DIR, 'processed-member-records.csv')

export const RAW_MEMBER_RECORDS_HEADER = [
  { id: 'id', title: 'id' },
  { id: 'name', title: 'name' },
  { id: 'jdNumber', title: 'jdNumber' },
  { id: 'licenseType', title: 'licenseType' },
  { id: 'employer', title: 'employer' },
  { id: 'address', title: 'address' },
  { id: 'country', title: 'country' },
  { id: 'phone', title: 'phone' },
  { id: 'fax', title: 'fax' },
  { id: 'email', title: 'email' },
  { id: 'lawSchool', title: 'lawSchool' },
  { id: 'graduated', title: 'graduated' },
  { id: 'admittedHiBar', title: 'admittedHiBar' },
]

export const RAW_MEMBER_RECORDS_PATH = path.join(DATA_DIR, 'raw-member-records.csv')

// Listed in the order they appear on a member's page.
export enum MemberRecordFieldOrder {
  Name,
  JdNumber,
  LicenseType,
  Employer,
  Address,
  Country,
  Phone,
  Fax,
  Email,
  LawSchool,
  Graduated,
  AdmittedHiBar,
}

export interface MemberIdentifier {
  id: string
  jdNumber: string
}

export interface ProcessedMemberRecord extends MemberIdentifier {
  barAdmissionYear: string
  emailDomain: string
  employer: string
  lawSchool: string
  licenseType: string
  location: string
  name: string
}

export interface RawMemberRecord extends MemberIdentifier {
  address: string
  admittedHiBar: string
  country: string
  email: string
  employer: string
  fax: string
  graduated: string
  lawSchool: string
  licenseType: string
  name: string
  phone: string
}

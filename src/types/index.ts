export interface MemberIdentifiers {
  id: string
  jdNumber: string
}

export interface MemberRecord extends MemberIdentifiers {
  barAdmissionYear: string
  emailDomain: string
  employer: string
  lawSchool: string
  licenseType: string
  location: string
  name: string
}

// Values represent the order in which fields are displayed on each member's page.
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

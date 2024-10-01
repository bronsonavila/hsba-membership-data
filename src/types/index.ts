interface AddressComponent {
  long_name: string
  short_name: string
  types: string[]
}

export interface GeocodeResponse {
  results: GeocodeResult[]
  status: string
}

export interface GeocodeResult {
  address_components: AddressComponent[]
  types: string[]
}

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
  barAdmissionDate: string
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

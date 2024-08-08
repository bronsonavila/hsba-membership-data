export type MemberDataPartial = {
  id: string
  jd_number: string
  license_type: string
  name: string
}

export type MemberDataComplete = MemberDataPartial & {
  address: string
  admitted_hi_bar: string
  email: string
  employer: string
  law_school: string
}

// Corresponds to the order in which fields are displayed on the member's page.
export enum MemberFieldIndex {
  name,
  jd_number,
  license_type,
  employer,
  address,
  country,
  phone,
  fax,
  email,
  law_school,
  graduated,
  admitted_hi_bar,
}

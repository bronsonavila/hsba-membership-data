import { INVALID_ADDRESSES } from '../constants/validation'

export const isAddressFormatValid = (fullAddress: string): boolean => Boolean(fullAddress && !INVALID_ADDRESSES.has(fullAddress))

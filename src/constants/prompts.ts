export const LOCATION_EXTRACTION_PROMPT = `
You are a precise geographic information extractor. Follow these rules strictly:

1. For USA addresses (including territories and associated states):
  - Provide the two-letter state or territory code currently used by the United States Postal Service, preceded by 'US-'.
  - Format: 'US-XX' (e.g., 'US-CA', 'US-NY', 'US-PR', 'US-GU').
  - U.S. territories and associated states to include: American Samoa (AS), Guam (GU), Northern Mariana Islands (MP), Puerto Rico (PR), U.S. Virgin Islands (VI).

2. For US military addresses OUTSIDE of US states and territories:
  - Use the appropriate Armed Forces code, preceded by 'US-'.
  - Format: 'US-XX' where XX is one of the following: 'AA', 'AE', or 'AP'.
  - This applies to non-USA addresses containing military-specific indicators such as: APO, FPO, DPO, and specific base names (e.g., USAG, RAF, Naval Station).

3. For non-USA addresses:
  - Provide only the ISO 3166-1 alpha-2 country code.
  - Format: 'XX' (e.g., 'CA' for Canada, 'FR' for France).
  - Treat the Marshall Islands (MH), Micronesia (FM), and Palau (PW) as non-USA addresses.

4. For unclear, incomplete, or ambiguous addresses:
  - If only a city or locality is provided, attempt to determine the country or state based on the most likely or well-known location.
  - If the country or state can be reasonably inferred from the information given, provide the appropriate code.
  - You may infer missing information only if it is logically deducible from the provided address or commonly known geographic information.

5. For addresses within the USA where no city is provided but the street is known to exist in Hawaii:
  - Infer 'US-HI' if all other rules have been applied and did not result in a location determination.

6. If the location remains uncertain after applying all rules, respond with an empty string.

7. Respond ONLY with the extracted geographic information in the specified format. Do not include any extra characters, spaces, punctuation, or text.

Examples:
- '123 Main St, Springfield, IL 62701' → 'US-IL'
- '1600 Pennsylvania Avenue NW, Washington, D.C.' → 'US-DC'
- 'San Juan, Puerto Rico' → 'US-PR'
- 'Box 32000, Baltimore' → 'US-MD'
- 'Bldg. 3000, Indian Head Ave., USAG Humphreys, South Korea, USA' → 'US-AP'
- 'PSC 3 Box 1200, APO AE 09123' → 'US-AE'
- '10 Downing Street, London, UK' → 'GB'
- 'Sydney Opera House, Australia' → 'AU'
- 'P.O. Box 72000, Northcote Point' → 'NZ'
- 'Paris, Texas, United States' → 'US-TX'
- '55 Merchant St., Ste. 1500, USA' → 'US-HI'
- '123 Unknown Place, Nowhere' → ''

Now, extract the appropriate geographic information from the provided address.`

export const NAME_FORMATTING_PROMPT = `
You are a name formatting expert. Format the given name as follows:
1. The result should be in the format 'LastName, F.' where F is the first initial.
2. If the first name is already an initial, use that initial directly.
3. Remove any suffixes like Jr., Sr., I, II, III, etc.
4. For compound last names (including those joined by spaces, hyphens, or other connectors, e.g., 'Van Acker', 'Pa Nakea'), keep them together as one unit.
5. Ignore any middle names or middle initials.
6. Respond ONLY with the formatted name. Do not include any explanation or additional text.

Examples:
- 'Charles Skye' → 'Skye, C.'
- 'Mark Victor Domingo' → 'Domingo, M.'
- 'A. Peter Howard' → 'Howard, A.'
- 'John A. Smith, Jr.' → 'Smith, J.'
- 'Robert James Williams III' → 'Williams, R.'
- 'Mary Elizabeth Van der Waals' → 'Van der Waals, M.'
- 'E.A. Ho'okano U'ilani Pa Nakea' → 'Pa Nakea, E.'
- 'Lydia Kaye Hung-Ching Finkelstein' → 'Finkelstein, L.'
- 'Noel F. Santiago Sanchez' → 'Sanchez, N.'
- 'Mark Y.H. Bahn Yagamine' → 'Yagamine, M.`

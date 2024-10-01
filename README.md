# HSBA Membership Data

This is a Node.js application designed to process membership data from the Hawaii State Bar Association's [Membership Directory](https://hsba.org/HSBA/Membership_Directory.aspx). The application scrapes member information, formats it, and saves the data to CSV files.

## Requirements

- Node.js (version specified in `.nvmrc`)
- Yarn package manager
- A valid Google Geocoding API key

## Installation

1. Set Node version:

   ```bash
   nvm use
   ```

2. Install dependencies:

   ```bash
   yarn install
   ```

## Configuration

1. Copy the `.env.example` file to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and set the necessary environment variables:
   - `GOOGLE_GEOCODING_API_KEY`: Your API key from the [Google Cloud Console](https://console.cloud.google.com/).
   - `IS_PUPPETEER_HEADLESS`: Set to `false` to run Puppeteer in non-headless mode for debugging.

## Usage

To run the application and process the data:

```bash
npm start
```

This executes the following steps:

1. Creates `data/member-identifiers.csv` if it does not exist.
2. Scrapes raw member records into `data/raw-member-records.csv` if not already present.
3. Processes raw data into `data/processed-member-records.csv`.

## Output

Generated CSV files:

- `member-identifiers.csv`: Member IDs and JD numbers.
- `raw-member-records.csv`: Raw scraped member data.
- `processed-member-records.csv`: Formatted member data.

## Error Handling

Errors are logged in `logs/errors.log`.

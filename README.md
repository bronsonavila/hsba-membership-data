# HSBA Membership Data

This is a Node.js application designed to process membership data from the Hawaii State Bar Association's [Membership Directory](https://hsba.org/HSBA/Membership_Directory.aspx). The application scrapes member information, formats it, and saves the data to a CSV file.

## Requirements

- Node.js (version specified in `.nvmrc`)
- Yarn package manager
- A valid OpenAI API key for accessing the OpenAI platform

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

   - `IS_PUPPETEER_HEADLESS`: Set to `false` to run Puppeteer in non-headless mode for debugging.
   - `OPEN_AI_API_KEY`: Your API key from the [OpenAI developer platform](https://platform.openai.com/docs/overview).

3. Navigate to `functions/index.js` and follow the instructions provided to create the `data/member-identifiers.csv` file.

## Usage

To run the application and process the data:

```bash
npm start
```

This command initiates the scraping process. Results are written to `data/member-records.csv`. Errors are logged in `logs/errors.log`.

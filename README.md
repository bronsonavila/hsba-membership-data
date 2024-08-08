# HSBA Membership Data

A Node application for processing membership data from the Hawaii State Bar Association's [Membership Directory](https://hsba.org/HSBA/Membership_Directory.aspx).

## Installation

- Run `nvm use` to use the version of Node specified in `.nvmrc`.
- Run `yarn install` to install all dependencies.

## Usage

- Follow the instructions in `src/helpers/console.js` to create a `data/members-partial.csv` file.
- Copy `.env.example` as `.env` and add the required environment variable values:
  1. `COOKIE`: Run a search on the HSBA membership directory and use the `Cookie` value from any request header.
  2. `OPEN_AI_API_KEY`: Use an API key generated on your [OpenAI developer platform](https://platform.openai.com/docs/overview) account.
- Run `npm start` to begin scraping data and writing output to `data/members-complete.csv`.
- Review `logs/errors.log` for any errors that occurred during the process.

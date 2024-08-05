# HSBA Membership Data

A Node application for processing membership data from the Hawaii State Bar Association's [Membership Directory](https://hsba.org/HSBA/Membership_Directory.aspx).

## Installation

1. Run `nvm use` to use the version of Node specified in `.nvmrc`.
2. Run `yarn install` to install all dependencies.

## Usage

1. Follow the instructions in `src/utils/console.js` to create a `data/members-limited.csv` file.
2. Run a search on the HSBA membership directory and copy the `Cookie` value from your request header.
3. Create a `.env` file with a `COOKIE` variable and paste the contents of your copied `Cookie` value.
4. Run `npm start` to begin scraping.

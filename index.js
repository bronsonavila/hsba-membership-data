// `d3-array` v2 includes `group` (not included in `d3` v5).
const d3 = Object.assign({}, require('d3'), require('d3-array'));
const fs = require('fs');

/**
 * Group Members by Law School (Count)
 *
 * Returns an array of objects with the `law_school` name as the key, and the
 * number of related members as the value.
 */
const groupByLawSchoolCount = (members) =>
  [...d3.group(members, (d) => d.law_school)].map((group) => ({
    [group[0]]: group[1].length,
  }));

/**
 * Get Law School Count
 *
 * Example:
 * { 'William S. Richardson': 2993 },
 * { '': 748 },
 * { 'Hastings College of Law': 484 },
 * ...
 */
module.exports.getLawSchoolCount = () => {
  const members = JSON.parse(fs.readFileSync('./data/members-full.json'));
  const lawSchoolCount = [...groupByLawSchoolCount(members)].sort((a, b) =>
    d3.descending(Object.values(a)[0], Object.values(b)[0])
  );

  console.dir(lawSchoolCount, { maxArrayLength: null });
  return lawSchoolCount;
};

/**
 * Get Law School Count (Alphabetical)
 *
 * Example:
 * { '': 748 },
 * { 'Albany Law School': 10 },
 * { 'American U.': 42 },
 * ...
 */
module.exports.getLawSchoolCountAlphabetical = () => {
  const members = JSON.parse(fs.readFileSync('./data/members-full.json'));
  const lawSchoolCountAlphabetical = [...groupByLawSchoolCount(members)].sort((a, b) =>
    d3.ascending(Object.getOwnPropertyNames(a)[0], Object.getOwnPropertyNames(b)[0])
  );

  console.dir(lawSchoolCountAlphabetical, { maxArrayLength: null });
  return lawSchoolCountAlphabetical;
};

/**
 * Write Full Member Results to JSON
 *
 * Uses the `id` values from `members-limited.json` to fetch the full member profiles
 * from the HSBA directory. Results are saved as `members-full.json`.
 */
module.exports.writeFullMemberResultsToJson = async () => {
  const axios = require('axios');
  const cheerio = require('cheerio');
  const { asyncForEach, sanitizeEmail, sleep } = require('./src/js/utils');

  const membersFull = `data/members-full.json`;
  const membersLimited = JSON.parse(fs.readFileSync('./data/members-limited.json'));
  const url = 'https://hsba.org/HSBA/Directory/Directory_results.aspx?ID=';

  // Delete any existing JSON file containing full member data.
  try {
    fs.unlinkSync(membersFull);
    console.log(`Rebuilding ${membersFull}...`);
  } catch {
    console.log(`${membersFull} does not exist. The file will be created...`);
  }

  // Open write stream.
  const stream = fs.createWriteStream(membersFull, { flags: 'a' });
  stream.write('[\n');

  await asyncForEach(membersLimited, async (member, index) => {
    await axios.get(`${url}${member.id}`).then((response) => {
      const $ = cheerio.load(response.data);
      const fields = $('html').find('.PanelFieldValue');
      const fieldsArr = [];

      for (let i = 0; i < fields.length; i++) {
        fieldsArr.push($(fields[i]).find('span').text());
      }

      // Omit indices `6`, `7`, and `10` (`phone`, `fax`, and `graduated`).
      const fieldsObj = {
        id: member.id,
        name: fieldsArr[0],
        jd_number: fieldsArr[1],
        license_type: fieldsArr[2],
        status: fieldsArr[3],
        employer: fieldsArr[4],
        address: fieldsArr[5],
        email: fieldsArr[8] ? sanitizeEmail(fieldsArr[8]) : '',
        law_school: fieldsArr[9],
        admitted_hi_bar: fieldsArr[11],
      };

      // Write member fields (with a comma appended to all but the last object).
      stream.write(
        `${JSON.stringify(fieldsObj)}${index !== membersLimited.length - 1 ? ',' : ''}\n`
      );

      console.log(index, fieldsArr[1], member.id, fieldsArr[0]);
    });

    await sleep(5000);
  });

  // Close write stream.
  stream.write(']\n');
  stream.end();
  console.log('Task complete.');
};

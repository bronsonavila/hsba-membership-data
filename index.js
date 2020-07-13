// `d3-array` v2 includes additional methods not present in `d3` v5.
const d3 = Object.assign({}, require('d3'), require('d3-array'));
const fs = require('fs');
const util = require('util');

util.inspect.defaultOptions.maxArrayLength = null; // Do not truncate arrays in console.

/**
 * Get Group
 *
 * Returns a 2D array where each sub-array's first index is the field name,
 * and the second index is the number of times the field appears in the data.
 *
 * Example: [ ['foo': 123], ['bar': 246], ['baz': 369] ]
 *
 * @param {string} fieldName - The field to be used in grouping the data.
 * @param {string} sortMethod - Sort results either by `alpha` or `count`.
 * @return {array}
 */
module.exports.getGroup = (fieldName, sortMethod = 'alpha') => {
  const members = JSON.parse(fs.readFileSync('./data/members-full.json'));
  const group = d3
    .rollups(
      members,
      v => v.length,
      d => d[fieldName]
    )
    .sort((a, b) => {
      return sortMethod === 'alpha'
        ? d3.ascending(a[0].toString().toLowerCase(), b[0].toString().toLowerCase())
        : d3.descending(a[1], b[1]); // `count` is sorted from high to low.
    });

  console.log(group);
  return group;
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
  const { asyncForEach, sleep } = require('./src/js/utils');

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
    await axios.get(`${url}${member.id}`).then(response => {
      const $ = cheerio.load(response.data);
      const fields = $('html').find('.PanelFieldValue');
      const fieldsArr = [];

      for (let i = 0; i < fields.length; i++) {
        let fieldValue = $(fields[i]).find('span');
        // Apply special formatting to the `address` field's HTML at index 5.
        // Otherwise, just use the standard `text()` value for all other fields.
        if (i === 5) {
          fieldsArr.push(
            fieldValue
              .html()
              .replace(/<br\s*[\/]?>/gi, '\n') // Replace `<br>` with newline.
              .replace(/\n\s*\n/g, '\n') // Remove duplicate newline characters.
              .replace(/  +/g, ' ') // Replace double spaces with a single space.
          );
        } else {
          fieldsArr.push(fieldValue.text());
        }
      }

      // Indices `6` and `7` (`phone` and `fax`) are omitted for privacy purposes.
      // Index `10` (`graduated`) is omitted due to inconsistent usage by the HSBA.
      const fieldsObj = {
        id: member.id,
        name: fieldsArr[0].trim(),
        jd_number: Number(fieldsArr[1]),
        license_type: fieldsArr[2].trim(),
        status: fieldsArr[3].trim(),
        employer: fieldsArr[4].trim(),
        // Some addresses contain only a comma. Replace such values with empty strings.
        address: fieldsArr[5].trim() === ',' ? '' : fieldsArr[5].trim(),
        // Save only the domain name from the `email` field.
        email: fieldsArr[8].split('@')[1]
          ? `@${fieldsArr[8].split('@')[1].trim().toLowerCase()}`
          : '',
        law_school: fieldsArr[9].trim(),
        admitted_hi_bar: fieldsArr[11] ? new Date(fieldsArr[11]).getFullYear() : '',
      };

      // Write member fields (with a comma appended to all but the last object).
      stream.write(
        `${JSON.stringify(fieldsObj)}${index !== membersLimited.length - 1 ? ',' : ''}\n`
      );

      // Log percentage complete.
      console.log(
        index,
        member.id,
        `...${parseFloat(((index + 1) / membersLimited.length) * 100).toFixed(3)}%`
      );
    });

    await sleep(5000);
  });

  // Close write stream.
  stream.write(']\n');
  stream.end();
  console.log('Task complete.');
};

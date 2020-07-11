const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const members = require('./src/js/members');
const { asyncForEach, sleep } = require('./src/js/utils');

const jsonFile = 'data/members.json';
const url = 'https://hsba.org/HSBA/Directory/Directory_results.aspx?ID=';

const writeMembersJSON = async () => {
  // Delete any existing JSON file containing member data.
  try {
    fs.unlinkSync(jsonFile);
  } catch {
    console.log('JSON data file does not exist. The file will be created...');
  }

  // Open write stream.
  const stream = fs.createWriteStream(jsonFile, { flags: 'a' });
  stream.write('[\n');

  await asyncForEach(members, async (member, index) => {
    await axios.get(`${url}${member.id}`).then((response) => {
      const $ = cheerio.load(response.data);
      const fields = $('html').find('.PanelFieldValue');
      const fieldsArr = [];

      for (let i = 0; i < fields.length; i++) {
        fieldsArr.push($(fields[i]).find('span').text());
      }

      const fieldsObj = {
        id: member.id,
        name: fieldsArr[0],
        jd_number: fieldsArr[1],
        license_type: fieldsArr[2],
        status: fieldsArr[3],
        employer: fieldsArr[4],
        address: fieldsArr[5],
        phone: fieldsArr[6],
        fax: fieldsArr[7],
        email: fieldsArr[8],
        law_school: fieldsArr[9],
        graduated: fieldsArr[10],
        admitted_hi_bar: fieldsArr[11],
      };

      // Write member fields (with a comma appended to all but the last object).
      stream.write(
        `${JSON.stringify(fieldsObj)}${
          index !== members.length - 1 ? ',' : ''
        }\n`
      );

      console.log(index, fieldsArr[1], member.id);
    });

    await sleep(5000);
  });

  // Close write stream.
  stream.write(']\n');
  stream.end();
  console.log('Task complete.');
};

writeMembersJSON();

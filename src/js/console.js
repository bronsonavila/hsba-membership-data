/**
 * Copy Limited HSBA "Membership Directory Results" as JSON
 *
 * 1. Go to https://hsba.org/HSBA/Membership_Directory.aspx.
 * 2. Enter your desired search criteria (there's a trick to fetch up to 10K results).
 * 3. Paste and run this function in the browser's console to save results to an array.
 * 4. Save results to `data/members-limited.json`.
 *
 * The JSON output will be used to fetch full member directory results via the `id`.
 */
function copyLimitedDirectoryResultsAsJson() {
  var tableBody = document.querySelectorAll('.rgMasterTable tbody')[2];
  var rows = [...tableBody.querySelectorAll('tr')];
  var members = rows.map((row) => {
    var cells = [...row.querySelectorAll('td')];
    return {
      jd_number: cells[0].innerText,
      name: cells[1].innerText,
      license_status: cells[2].innerText,
      id: cells[3].innerText,
    };
  });

  console.dir(members);
  copy(JSON.stringify(members));
}

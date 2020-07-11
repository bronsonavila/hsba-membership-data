/**
 * Copy, paste, and run in the browser's console to save member data to an array.
 */
function copyMembers() {
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

  copy(members);
}

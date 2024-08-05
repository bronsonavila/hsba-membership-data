/**
 * Instructions:
 *
 * 1. Go to https://hsba.org/HSBA/Membership_Directory.aspx.
 * 2. Enter your desired search criteria (there's a trick to fetch up to 10,000 results).
 * 3. Paste the following code into the browser's console.
 * 4. Sort by JD Number (ascending) and type `arr1 = copyLimitedDirectoryResultsAsJson()` in the console.
 * 5. Sort by JD Number (descending) and type `arr2 = copyLimitedDirectoryResultsAsJson()` in the console.
 * 6. Run `copy(mergeAndSortToCSV(arr1, arr2))` to copy the CSV output to the clipboard.
 * 7. Paste the CSV output into a file and save it as `data/members-limited.json`.
 *
 * The final CSV output will be used to fetch the full member directory results via the `id`.
 */

function copyLimitedDirectoryResultsAsJson() {
  const tableBody = document.querySelectorAll('.rgMasterTable tbody')[0]

  const rows = [...tableBody.querySelectorAll('tr')]

  const members = rows.map(row => {
    const cells = [...row.querySelectorAll('td')]

    return { jd_number: cells[0].innerText, name: cells[1].innerText, license_type: cells[2].innerText, id: cells[3].innerText }
  })

  return members
}

function mergeAndSortToCSV(arr1, arr2) {
  const mergedMap = new Map()

  for (const obj of arr1.concat(arr2)) {
    mergedMap.set(obj.id, obj)
  }

  const sortedArray = Array.from(mergedMap.values()).sort((a, b) => {
    const numA = Number(a.jd_number.replace(/\D/g, ''))
    const numB = Number(b.jd_number.replace(/\D/g, ''))

    return numA - numB
  })

  const headers = ['jd_number', 'name', 'license_type', 'id']
  const csvRows = [headers.join(',')]

  for (const obj of sortedArray) {
    // Wrap the value in quotes and escape any existing quotes.
    const row = headers.map(header => `"${obj[header].replace(/"/g, '""')}"`)

    csvRows.push(row.join(','))
  }

  return csvRows.join('\n')
}

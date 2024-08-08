/**
 * Instructions:
 *
 * 1. Go to https://hsba.org/HSBA/Membership_Directory.aspx.
 * 2. Enter your desired search criteria (there's a trick to fetch up to 10,000 results).
 * 3. Paste the following code into the browser's console.
 * 4. Sort by JD Number (ascending) and type `arr1 = copyResultsAsJson()` in the console.
 * 5. Sort by JD Number (descending) and type `arr2 = copyResultsAsJson()` in the console.
 * 6. Run `copy(mergeAndSortAsCsv(arr1, arr2))` to copy the CSV output to the clipboard.
 * 7. Paste the CSV output into a file and save it as `data/members-partial.csv`.
 *
 * The final CSV output will be used to fetch the complete member directory results via the `id`.
 */

function copyResultsAsJson() {
  const tableBody = document.querySelectorAll('.rgMasterTable > tbody')[0]

  const rows = [...tableBody.querySelectorAll('tr')]

  const members = rows
    .map(row => {
      const cells = [...row.querySelectorAll('td')]
      const jd_number = cells[0].innerText.trim()

      if (!jd_number) return null

      return { id: cells[3].innerText.trim(), jd_number }
    })
    .filter(member => member !== null)

  return members
}

function mergeAndSortAsCsv(arr1, arr2) {
  const mergedMap = new Map()

  for (const obj of arr1.concat(arr2)) {
    mergedMap.set(obj.id, obj)
  }

  const sortedArray = Array.from(mergedMap.values()).sort((a, b) => {
    const numA = Number(a.jd_number.replace(/\D/g, ''))
    const numB = Number(b.jd_number.replace(/\D/g, ''))

    return numA - numB
  })

  const headers = ['id', 'jd_number']
  const csvRows = [headers.join(',')]

  for (const obj of sortedArray) {
    const row = headers.map(header => `"${obj[header].replace(/"/g, '""')}"`) // Wrap the value in quotes and escape any existing quotes.

    csvRows.push(row.join(','))
  }

  return csvRows.join('\n')
}

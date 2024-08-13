/**
 * Instructions:
 *
 * 1. Go to the "Member Directory" on https://hsba.org/ and submit a search (there's a trick to fetch up to 10,000 results).
 * 2. Paste the functions below into the browser's console.
 * 3. Sort by JD Number (ascending) and enter `arr1 = parseResults()` in the console.
 * 4. Sort by JD Number (descending) and enter `arr2 = parseResults()` in the console.
 * 5. Run `copy(mergeAndSortResultsAsCsv(arr1, arr2))` to copy the CSV output to the clipboard.
 * 6. Paste the CSV output into a file and save it as `data/member-identifiers.csv`.
 *
 * The final CSV output will be used to fetch the complete member directory results via the `id`.
 */

function parseResults() {
  const tableBody = document.querySelectorAll('.rgMasterTable > tbody')[0]

  const rows = [...tableBody.querySelectorAll('tr')]

  const members = rows
    .map(row => {
      const cells = [...row.querySelectorAll('td')]
      const id = cells[3].innerText.trim()
      const jdNumber = cells[0].innerText.trim()

      if (!jdNumber) return null

      return { id, jdNumber }
    })
    .filter(Boolean)

  return members
}

function mergeAndSortResultsAsCsv(arr1, arr2) {
  const mergedMap = new Map()

  for (const obj of arr1.concat(arr2)) {
    mergedMap.set(obj.id, obj)
  }

  const sortedArray = Array.from(mergedMap.values()).sort((a, b) => {
    const numA = Number(a.jdNumber.replace(/\D/g, ''))
    const numB = Number(b.jdNumber.replace(/\D/g, ''))

    return numA - numB
  })

  const headers = ['id', 'jdNumber']
  const csvRows = [headers.join(',')]

  for (const obj of sortedArray) {
    const row = headers.map(header => `"${obj[header].replace(/"/g, '""')}"`) // Wrap the value in quotes and escape any existing quotes.

    csvRows.push(row.join(','))
  }

  return csvRows.join('\n')
}

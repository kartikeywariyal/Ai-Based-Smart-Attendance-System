document.addEventListener("DOMContentLoaded", async () => {
  const filterRoll = document.getElementById("filterRoll")
  const startDate = document.getElementById("startDate")
  const endDate = document.getElementById("endDate")
  const filterCourse = document.getElementById("filterCourse")
  const applyFiltersBtn = document.getElementById("applyFilters")
  const exportExcelBtn = document.getElementById("exportExcel")
  const exportCSVBtn = document.getElementById("exportCSV")
  const attendanceTable = document.getElementById("attendanceRecords").querySelector("tbody")
  const prevPageBtn = document.getElementById("prevPage")
  const nextPageBtn = document.getElementById("nextPage")
  const pageInfo = document.getElementById("pageInfo")

  let currentPage = 1
  const recordsPerPage = 10
  let filteredRecords = []

  const today = new Date().toISOString().split("T")[0]
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  startDate.value = thirtyDaysAgo.toISOString().split("T")[0]
  endDate.value = today

  async function loadAttendanceRecords() {
    try {
      const filters = {
        rollNumber: filterRoll.value.trim(),
        startDate: startDate.value,
        endDate: endDate.value,
        course: filterCourse.value,
      }

      filteredRecords = await window.attendanceDB.getFilteredAttendance(filters)

      filteredRecords.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

      updatePagination()

      displayRecords()
    } catch (error) {
      console.error("Error loading attendance records:", error)
      attendanceTable.innerHTML = `<tr><td colspan="6" style="text-align: center;">Error loading records. Please try again.</td></tr>`
    }
  }

  function updatePagination() {
    const totalPages = Math.ceil(filteredRecords.length / recordsPerPage)

    if (currentPage > totalPages) {
      currentPage = 1
    }

    pageInfo.textContent = `Page ${currentPage} of ${totalPages || 1}`

    prevPageBtn.disabled = currentPage <= 1
    nextPageBtn.disabled = currentPage >= totalPages || totalPages === 0
  }

  function displayRecords() {
    attendanceTable.innerHTML = ""

    if (filteredRecords.length === 0) {
      const row = document.createElement("tr")
      row.innerHTML = `<td colspan="6" style="text-align: center;">No attendance records found</td>`
      attendanceTable.appendChild(row)
      return
    }

    // Calculate start and end index for current page
    const startIndex = (currentPage - 1) * recordsPerPage
    const endIndex = Math.min(startIndex + recordsPerPage, filteredRecords.length)

    // Display records for current page
    for (let i = startIndex; i < endIndex; i++) {
      const record = filteredRecords[i]
      const row = document.createElement("tr")

      // Format date and time
      const recordDate = new Date(record.timestamp)
      const dateStr = recordDate.toLocaleDateString()
      const timeStr = recordDate.toLocaleTimeString()

      row.innerHTML = `
        <td>${dateStr}</td>
        <td>${record.rollNumber}</td>
        <td>${record.name}</td>
        <td>${record.course}</td>
        <td>${timeStr}</td>
        <td>${record.status}</td>
      `

      attendanceTable.appendChild(row)
    }
  }

  exportExcelBtn.addEventListener("click", () => {
    if (filteredRecords.length === 0) {
      alert("No records to export")
      return
    }

    let csv = "Date,Roll Number,Name,Course,Time,Status\n"

    filteredRecords.forEach((record) => {
      const recordDate = new Date(record.timestamp)
      const dateStr = recordDate.toLocaleDateString()
      const timeStr = recordDate.toLocaleTimeString()

      csv += `${dateStr},${record.rollNumber},"${record.name}","${record.course}",${timeStr},${record.status}\n`
    })

    const blob = new Blob([csv], { type: "application/vnd.ms-excel" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `attendance_records_${new Date().toISOString().split("T")[0]}.xls`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  })

  exportCSVBtn.addEventListener("click", () => {
    if (filteredRecords.length === 0) {
      alert("No records to export")
      return
    }

    let csv = "Date,Roll Number,Name,Course,Time,Status\n"

    filteredRecords.forEach((record) => {
      const recordDate = new Date(record.timestamp)
      const dateStr = recordDate.toLocaleDateString()
      const timeStr = recordDate.toLocaleTimeString()

      csv += `${dateStr},${record.rollNumber},"${record.name}","${record.course}",${timeStr},${record.status}\n`
    })

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `attendance_records_${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  })

  applyFiltersBtn.addEventListener("click", () => {
    currentPage = 1 // Reset to first page
    loadAttendanceRecords()
  })

  prevPageBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--
      displayRecords()
      updatePagination()
    }
  })

  nextPageBtn.addEventListener("click", () => {
    const totalPages = Math.ceil(filteredRecords.length / recordsPerPage)
    if (currentPage < totalPages) {
      currentPage++
      displayRecords()
      updatePagination()
    }
  })

  loadAttendanceRecords()
})

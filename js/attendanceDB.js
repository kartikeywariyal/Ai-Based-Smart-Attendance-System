
const attendanceDB = {
  dbName: "SmartAttendanceSystem",
  dbVersion: 1,
  db: null,

  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = (event) => {
        console.error("Error opening database:", event.target.error)
        reject(event.target.error)
      }

      request.onsuccess = (event) => {
        this.db = event.target.result
        console.log("Database opened successfully")
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = event.target.result

        // Create students store
        if (!db.objectStoreNames.contains("students")) {
          const studentsStore = db.createObjectStore("students", { keyPath: "rollNumber" })
          studentsStore.createIndex("name", "name", { unique: false })
          studentsStore.createIndex("course", "course", { unique: false })
        }

        // Create attendance store
        if (!db.objectStoreNames.contains("attendance")) {
          const attendanceStore = db.createObjectStore("attendance", { keyPath: "id", autoIncrement: true })
          attendanceStore.createIndex("rollNumber", "rollNumber", { unique: false })
          attendanceStore.createIndex("date", "date", { unique: false })
          attendanceStore.createIndex("timestamp", "timestamp", { unique: false })
        }

        // Create faceDescriptors store
        if (!db.objectStoreNames.contains("faceDescriptors")) {
          const faceStore = db.createObjectStore("faceDescriptors", { keyPath: "rollNumber" })
          faceStore.createIndex("descriptors", "descriptors", { unique: false })
        }

        console.log("Database setup complete")
      }
    })
  },

  async addStudent(student) {
    if (!this.db) await this.initDB()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["students"], "readwrite")
      const store = transaction.objectStore("students")
      const request = store.add(student)

      request.onsuccess = () => {
        console.log("Student added successfully")
        resolve(true)
      }

      request.onerror = (event) => {
        console.error("Error adding student:", event.target.error)
        reject(event.target.error)
      }
    })
  },

  async addFaceDescriptor(rollNumber, descriptors) {
    if (!this.db) await this.initDB()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["faceDescriptors"], "readwrite")
      const store = transaction.objectStore("faceDescriptors")
      const request = store.put({ rollNumber, descriptors })

      request.onsuccess = () => {
        console.log("Face descriptors added successfully")
        resolve(true)
      }

      request.onerror = (event) => {
        console.error("Error adding face descriptors:", event.target.error)
        reject(event.target.error)
      }
    })
  },

  async getAllFaceDescriptors() {
    if (!this.db) await this.initDB()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["faceDescriptors"], "readonly")
      const store = transaction.objectStore("faceDescriptors")
      const request = store.getAll()

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = (event) => {
        console.error("Error getting face descriptors:", event.target.error)
        reject(event.target.error)
      }
    })
  },

  // Get student by roll number
  async getStudent(rollNumber) {
    if (!this.db) await this.initDB()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["students"], "readonly")
      const store = transaction.objectStore("students")
      const request = store.get(rollNumber)

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = (event) => {
        console.error("Error getting student:", event.target.error)
        reject(event.target.error)
      }
    })
  },

  // Mark attendance
  async markAttendance(attendanceRecord) {
    if (!this.db) await this.initDB()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["attendance"], "readwrite")
      const store = transaction.objectStore("attendance")
      const request = store.add(attendanceRecord)

      request.onsuccess = () => {
        console.log("Attendance marked successfully")
        resolve(true)
      }

      request.onerror = (event) => {
        console.error("Error marking attendance:", event.target.error)
        reject(event.target.error)
      }
    })
  },

  async getAttendanceByDate(date) {
    if (!this.db) await this.initDB()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["attendance"], "readonly")
      const store = transaction.objectStore("attendance")
      const index = store.index("date")
      const request = index.getAll(date)

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = (event) => {
        console.error("Error getting attendance records:", event.target.error)
        reject(event.target.error)
      }
    })
  },

  async getAllAttendance() {
    if (!this.db) await this.initDB()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["attendance"], "readonly")
      const store = transaction.objectStore("attendance")
      const request = store.getAll()

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = (event) => {
        console.error("Error getting all attendance records:", event.target.error)
        reject(event.target.error)
      }
    })
  },

  async getFilteredAttendance(filters) {
    const allRecords = await this.getAllAttendance()

    return allRecords.filter((record) => {
      let match = true

      if (filters.rollNumber && filters.rollNumber.trim() !== "") {
        match = match && record.rollNumber === filters.rollNumber
      }

      if (filters.startDate) {
        const recordDate = new Date(record.date)
        const startDate = new Date(filters.startDate)
        match = match && recordDate >= startDate
      }

      if (filters.endDate) {
        const recordDate = new Date(record.date)
        const endDate = new Date(filters.endDate)
        endDate.setHours(23, 59, 59, 999) // End of the day
        match = match && recordDate <= endDate
      }

      if (filters.course && filters.course !== "") {
        match = match && record.course === filters.course
      }

      return match
    })
  },

  async checkAttendanceToday(rollNumber) {
    const today = new Date().toISOString().split("T")[0]
    const todayRecords = await this.getAttendanceByDate(today)
    return todayRecords.some((record) => record.rollNumber === rollNumber)
  },

  async getAllStudents() {
    if (!this.db) await this.initDB()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["students"], "readonly")
      const store = transaction.objectStore("students")
      const request = store.getAll()

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = (event) => {
        console.error("Error getting all students:", event.target.error)
        reject(event.target.error)
      }
    })
  },
}

attendanceDB.initDB().catch((error) => {
  console.error("Failed to initialize database:", error)
})

export { attendanceDB }

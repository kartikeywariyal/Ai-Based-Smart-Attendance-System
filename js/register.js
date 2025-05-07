// Registration page functionality
document.addEventListener("DOMContentLoaded", async () => {
  // DOM elements
  const video = document.getElementById("video")
  const canvas = document.getElementById("canvas")
  const startCameraBtn = document.getElementById("startCamera")
  const captureImageBtn = document.getElementById("captureImage")
  const registerBtn = document.getElementById("registerBtn")
  const captureStatus = document.getElementById("captureStatus")
  const registrationForm = document.getElementById("registrationForm")

  let stream = null
  let faceDescriptors = null
  let isModelLoaded = false

  if (!window.faceapi) {
    captureStatus.textContent = "Face API not loaded. Please check your internet connection and refresh."
    captureStatus.style.backgroundColor = "#ffebee"
    return
  }

  const faceapi = window.faceapi

  async function loadModels() {
    try {
      captureStatus.textContent = "Loading face detection models..."
      captureStatus.style.backgroundColor = "#e3f2fd"

      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri("models/face-api.js-models-master/ssd_mobilenetv1"),
        faceapi.nets.faceLandmark68Net.loadFromUri("models/face-api.js-models-master/face_landmark_68"),
        faceapi.nets.faceRecognitionNet.loadFromUri("models/face-api.js-models-master/face_recognition"),
      ])

      isModelLoaded = true
      captureStatus.textContent = "Face detection models loaded. You can start the camera now."
      captureStatus.style.backgroundColor = "#e8f5e9"
      console.log("Face detection models loaded")
    } catch (error) {
      console.error("Error loading models:", error)
      captureStatus.textContent =
        "Error loading face detection models. Please check if model files exist in the 'models' folder."
      captureStatus.style.backgroundColor = "#ffebee"
    }
  }

  startCameraBtn.addEventListener("click", async () => {
    try {
      captureStatus.textContent = "Requesting camera access..."
      captureStatus.style.backgroundColor = "#e3f2fd"

      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      })

      video.srcObject = stream

      video.onloadedmetadata = () => {
        video.play().catch((e) => {
          console.error("Error playing video:", e)
          captureStatus.textContent = "Error starting video. Please try again."
          captureStatus.style.backgroundColor = "#ffebee"
        })
      }

      startCameraBtn.disabled = true
      captureImageBtn.disabled = false

      if (!isModelLoaded) {
        await loadModels()
      }

      captureStatus.textContent = 'Camera started. Position your face in the camera and click "Capture Face".'
      captureStatus.style.backgroundColor = "#e8f5e9"
    } catch (error) {
      console.error("Error accessing camera:", error)
      captureStatus.textContent =
        "Error accessing camera. Please check camera permissions and ensure your device has a camera."
      captureStatus.style.backgroundColor = "#ffebee"

      startCameraBtn.disabled = false
    }
  })

  captureImageBtn.addEventListener("click", async () => {
    if (!isModelLoaded) {
      captureStatus.textContent = "Face detection models not loaded yet. Please wait."
      captureStatus.style.backgroundColor = "#fff3e0"
      return
    }

    try {
      captureStatus.textContent = "Processing..."
      captureStatus.style.backgroundColor = "#e3f2fd"

      const context = canvas.getContext("2d")
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      const detections = await faceapi.detectSingleFace(canvas).withFaceLandmarks().withFaceDescriptor()

      if (!detections) {
        captureStatus.textContent = "No face detected. Please position your face clearly in the camera and try again."
        captureStatus.style.backgroundColor = "#fff3e0"
        return
      }

      faceDescriptors = Array.from(detections.descriptor)

      captureStatus.textContent = "Face captured successfully! You can now complete the registration."
      captureStatus.style.backgroundColor = "#e8f5e9"
      registerBtn.disabled = false

      const context2d = canvas.getContext("2d")
      context2d.strokeStyle = "#4361ee"
      context2d.lineWidth = 3
      const box = detections.detection.box
      context2d.strokeRect(box.x, box.y, box.width, box.height)

      canvas.style.display = "block"
      video.style.display = "none"
    } catch (error) {
      console.error("Error capturing face:", error)
      captureStatus.textContent = "Error processing face. Please try again."
      captureStatus.style.backgroundColor = "#ffebee"
    }
  })

  registrationForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    if (!faceDescriptors) {
      captureStatus.textContent = "Please capture your face before registering."
      captureStatus.style.backgroundColor = "#fff3e0"
      return
    }

    const formData = new FormData(registrationForm)
    const student = {
      fullName: formData.get("fullName"),
      rollNumber: formData.get("rollNumber"),
      course: formData.get("course"),
      semester: formData.get("semester"),
      email: formData.get("email"),
      registrationDate: new Date().toISOString(),
    }

    try {
      const existingStudent = await window.attendanceDB.getStudent(student.rollNumber)
      if (existingStudent) {
        captureStatus.textContent = "A student with this roll number already exists."
        captureStatus.style.backgroundColor = "#ffebee"
        return
      }

      await window.attendanceDB.addStudent(student)

      await window.attendanceDB.addFaceDescriptor(student.rollNumber, faceDescriptors)

      captureStatus.textContent = "Registration successful!"
      captureStatus.style.backgroundColor = "#e8f5e9"

      registrationForm.reset()
      registerBtn.disabled = true

      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
        video.srcObject = null
      }

      video.style.display = "block"
      canvas.style.display = "none"
      startCameraBtn.disabled = false
      captureImageBtn.disabled = true

      setTimeout(() => {
        window.location.href = "attendance.html"
      }, 3000)
    } catch (error) {
      console.error("Error registering student:", error)
      captureStatus.textContent = "Error registering student. Please try again."
      captureStatus.style.backgroundColor = "#ffebee"
    }
  })

  loadModels()
})

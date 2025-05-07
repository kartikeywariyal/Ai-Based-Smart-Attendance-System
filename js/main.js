document.addEventListener("DOMContentLoaded", () => {
  const yearElement = document.querySelector("footer p")
  if (yearElement) {
    const currentYear = new Date().getFullYear()
    yearElement.textContent = yearElement.textContent.replace("2025", currentYear)
  }

  const currentPage = window.location.pathname.split("/").pop() || "index.html"
  const navLinks = document.querySelectorAll("nav ul li a")

  navLinks.forEach((link) => {
    const linkPage = link.getAttribute("href")
    if (linkPage === currentPage) {
      link.classList.add("active")
    } else if (currentPage === "index.html" && linkPage === "index.html") {
      link.classList.add("active")
    }
  })
})

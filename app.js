document.addEventListener("DOMContentLoaded", () => {
  // Select all sidebar <li> elements inside the sidebar <ul>
  const sidebarItems = document.querySelectorAll(".sidebar ul li");

  sidebarItems.forEach(item => {
    item.addEventListener("click", () => {
      let sectionId = item.getAttribute("data-section");
      if (!sectionId) {
        // Example: onclick="showSection('dashboard')" or onclick="requestPinAndShow('hotels')"
        const onclickAttr = item.getAttribute("onclick");
        if (onclickAttr) {
          // Extract sectionId inside the parentheses and quotes
          const match = onclickAttr.match(/\(['"]([^'"]+)['"]\)/);
          if (match) {
            sectionId = match[1];
          }
        }
      }

      if (!sectionId) {
        // If no section ID found, do nothing
        return;
      }
      requestPinAndShow(sectionId);
    });
  });
});

// Function to show the section and update sidebar active state
function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll(".section").forEach(sec => {
    sec.classList.remove("active");
    sec.style.display = "none";
  });

  // Show target section
  const target = document.getElementById(sectionId);
  if (target) {
    target.classList.add("active");
    target.style.display = "block";
  }

  // Update sidebar active class
  document.querySelectorAll(".sidebar ul li").forEach(item => {
    const isActive = 
      item.getAttribute("data-section") === sectionId ||
      // fallback: check onclick inline attribute contains the sectionId
      (item.getAttribute("onclick") && item.getAttribute("onclick").includes(`'${sectionId}'`));

    item.classList.toggle("active", isActive);
  });
}

// Dummy requestPinAndShow function — add your PIN verification here if needed
function requestPinAndShow(sectionId) {
  // For demo purposes, just call showSection directly
  showSection(sectionId);
}

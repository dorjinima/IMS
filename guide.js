document.addEventListener("DOMContentLoaded", () => {
  const guideBtn = document.getElementById("guideBtn");
  const guideForm = document.getElementById("guideForm");
  const cancelBtn = guideForm.querySelector(".cancel-btn");
  const saveBtn = guideForm.querySelector(".save-btn");
  const guideTableBody = document.getElementById("guideTableBody");
  const guideTableContainer = document.querySelector(".guide-table-container");
  const searchInput = document.getElementById("searchGuide");
  const searchBtn = document.getElementById("searchGuideBtn");
  const prevPageBtn = document.getElementById("prevPageBtn");
  const nextPageBtn = document.getElementById("nextPageBtn");

  let guideData = JSON.parse(localStorage.getItem("guides")) || [];
  let editIndex = null;
  let currentPage = 1;
  const rowsPerPage = 10;
  let currentSearch = "";

  // Show form, hide table
  guideBtn.addEventListener("click", () => {
    guideForm.style.display = "block";
    guideTableContainer.style.display = "none";
    resetForm();
    editIndex = null;
  });

  // Cancel form, show table
  cancelBtn.addEventListener("click", () => {
    guideForm.style.display = "none";
    guideTableContainer.style.display = "block";
    resetForm();
    editIndex = null;
  });

  // Save or update entry
  saveBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const guide = getGuideFormData();
    if (!guide) return;

    if (editIndex !== null) {
      guideData[editIndex] = guide;
    } else {
      guideData.push(guide);
    }
    localStorage.setItem("guides", JSON.stringify(guideData));

    // Set currentPage to last page after adding/editing
    currentPage = Math.ceil(guideData.length / rowsPerPage) || 1;

    filterAndRender();

    guideForm.style.display = "none";
    guideTableContainer.style.display = "block";
    resetForm();
    editIndex = null;
  });

  // Edit button in table
  guideTableBody.addEventListener("click", (e) => {
    if (e.target.classList.contains("edit-btn")) {
      const index = parseInt(e.target.dataset.index, 10);
      if (isNaN(index) || !guideData[index]) return;

      setGuideFormData(guideData[index]);
      editIndex = index;
      guideForm.style.display = "block";
      guideTableContainer.style.display = "none";
    }
  });

  // Search button click
  searchBtn.addEventListener("click", () => {
    currentSearch = searchInput.value.toLowerCase().trim();
    currentPage = 1;
    filterAndRender();
  });

  // Search enter key
  searchInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      currentSearch = searchInput.value.toLowerCase().trim();
      currentPage = 1;
      filterAndRender();
    }
  });

  // Pagination previous
  prevPageBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      filterAndRender();
    }
  });

  // Pagination next
  nextPageBtn.addEventListener("click", () => {
    const filteredData = getFilteredData();
    const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;
    if (currentPage < totalPages) {
      currentPage++;
      filterAndRender();
    }
  });

  // Filter data by search term
  function getFilteredData() {
    if (!currentSearch) return guideData;
    return guideData.filter(guide =>
      guide.name.toLowerCase().includes(currentSearch)
    );
  }

  // Filter and render table with pagination
  function filterAndRender() {
    const filtered = getFilteredData();
    const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;

    // Correct currentPage if it is out of range
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    renderTable(filtered);

    // Update buttons disabled state
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
  }

  // Render the table rows for the current page
  function renderTable(data) {
    guideTableBody.innerHTML = "";
    if (data.length === 0) {
      guideTableBody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:20px;">No records found.</td></tr>`;
      return;
    }

    const start = (currentPage - 1) * rowsPerPage;
    const end = Math.min(start + rowsPerPage, data.length);
    for (let i = start; i < end; i++) {
      const guide = data[i];
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td>${guide.name}</td>
        <td>${guide.specialize}</td>
        <td>${guide.gender}</td>
        <td>${guide.language}</td>
        <td>${guide.license}</td>
        <td>${guide.email}</td>
        <td>${guide.phone}</td>
        <td><button class="edit-btn btn btn-secondary" data-index="${i}">Edit</button></td>
      `;
      guideTableBody.appendChild(tr);
    }
  }

  // Get data from form with validation
  function getGuideFormData() {
    const name = document.getElementById("guideName").value.trim();
    const specialize = document.getElementById("guideSpecialize").value;
    const gender = document.getElementById("guideGender").value;
    const language = document.getElementById("guideLanguage").value.trim();
    const license = document.getElementById("guideLicense").value.trim();
    const phone = document.getElementById("guidePhone").value.trim();
    const email = document.getElementById("guideEmail").value.trim();

    if (!name) {
      alert("Guide Name is required.");
      return null;
    }
    if (!gender) {
      alert("Gender is required.");
      return null;
    }
    if (!joinDate) {
      alert("Date of Join is required.");
      return null;
    }

    return {
      name,
      specialize,
      gender,
      language,
      license,
      phone,
      email,
      joinDate,
    };
  }

  // Populate form for editing
  function setGuideFormData(guide) {
    document.getElementById("guideName").value = guide.name;
    document.getElementById("guideSpecialize").value = guide.specialize;
    document.getElementById("guideGender").value = guide.gender;
    document.getElementById("guideLanguage").value = guide.language;
    document.getElementById("guideLicense").value = guide.license;
    document.getElementById("guidePhone").value = guide.phone;
    document.getElementById("guideEmail").value = guide.email;
  }

  // Reset form inputs
  function resetForm() {
    guideForm.reset();
  }

  // Initial render call
  filterAndRender();
});

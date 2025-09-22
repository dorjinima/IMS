document.addEventListener("DOMContentLoaded", () => {
  const addCarBtn = document.getElementById("carBtn");
  const carForm = document.getElementById("carForm");
  const cancelBtn = carForm.querySelector(".cancel-btn");
  const saveBtn = carForm.querySelector(".save-btn");
  const carTableBody = document.getElementById("carTableBody");
  const carTableContainer = document.querySelector(".car-table-container");
  const searchInput = document.getElementById("searchCar");
  const prevPageBtn = document.getElementById("prevPageBtn");
  const nextPageBtn = document.getElementById("nextPageBtn");

  let carData = JSON.parse(localStorage.getItem("carData")) || [];
  let editIndex = null;
  let currentPage = 1;
  const rowsPerPage = 10;
  let currentSearch = "";

  // Show Form
  addCarBtn.addEventListener("click", () => {
    carForm.style.display = "block";
    carTableContainer.style.display = "none";
    resetForm();
    editIndex = null;
  });

  // Cancel Form
  cancelBtn.addEventListener("click", () => {
    carForm.style.display = "none";
    carTableContainer.style.display = "block";
    resetForm();
    editIndex = null;
  });

  // Save or Update
  saveBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const car = getCarFormData();
    if (!car) return;

    if (editIndex !== null) {
      carData[editIndex] = car;
    } else {
      carData.push(car);
    }

    localStorage.setItem("carData", JSON.stringify(carData));
    currentPage = Math.ceil(carData.length / rowsPerPage);
    filterAndRender();
    carForm.style.display = "none";
    carTableContainer.style.display = "block";
    resetForm();
    editIndex = null;
  });

  // Edit Entry
  carTableBody.addEventListener("click", (e) => {
    if (e.target.classList.contains("edit-btn")) {
      const index = parseInt(e.target.dataset.index);
      const car = carData[index];
      setCarFormData(car);
      editIndex = index;
      carForm.style.display = "block";
      carTableContainer.style.display = "none";
    }
  });

  // Live Search on Input
  searchInput.addEventListener("input", () => {
    currentSearch = searchInput.value.toLowerCase().trim();
    currentPage = 1;
    filterAndRender();
  });

  // Pagination
  prevPageBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      filterAndRender();
    }
  });

  nextPageBtn.addEventListener("click", () => {
    const filteredData = getFilteredData();
    if (currentPage < Math.ceil(filteredData.length / rowsPerPage)) {
      currentPage++;
      filterAndRender();
    }
  });

  // Filter and Render Table
  function filterAndRender() {
    const filtered = getFilteredData();
    renderTable(filtered);
  }

  // Get Filtered Data
  function getFilteredData() {
    if (!currentSearch) return carData;
    return carData.filter(car =>
      (car.carDriver && car.carDriver.toLowerCase().includes(currentSearch)) ||
      (car.carPlate && car.carPlate.toLowerCase().includes(currentSearch)) ||
      (car.carType && car.carType.toLowerCase().includes(currentSearch))
    );
  }

  // Render Table
  function renderTable(data) {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginated = data.slice(start, end);
    carTableBody.innerHTML = "";

    if (paginated.length === 0) {
      carTableBody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:20px;">No records found.</td></tr>`;
      return;
    }

    paginated.forEach((car, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${start + index + 1}</td>
        <td>${car.carPlate}</td>
        <td>${car.carType}</td>
        <td>${car.carSeat}</td>
        <td>${car.carColor}</td>
        <td>${car.carDriver}</td>
        <td>${car.carPhone}</td>
        <td>${car.carStatus}</td>
        <td>${car.carRegisteredDate}</td>
        <td><button class="edit-btn btn btn-secondary" data-index="${start + index}">Edit</button></td>
      `;
      carTableBody.appendChild(row);
    });

    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage >= Math.ceil(data.length / rowsPerPage);
  }

  // Form Helpers
  function getCarFormData() {
    const carPlate = document.getElementById("carPlate").value.trim();
    const carType = document.getElementById("carType").value.trim();
    const carSeat = document.getElementById("carSeat").value.trim();
    const carColor = document.getElementById("carColor").value.trim();
    const carDriver = document.getElementById("carDriver").value.trim();
    const carPhone = document.getElementById("carPhone").value.trim();
    const carStatus = document.getElementById("carStatus").value.trim();
    const carRegisteredDate = document.getElementById("carRegisteredDate").value;

    if (!carPlate || !carDriver || !carRegisteredDate) {
      alert("Please fill all required fields.");
      return null;
    }

    return {
      carPlate,
      carType,
      carSeat,
      carColor,
      carDriver,
      carPhone,
      carStatus,
      carRegisteredDate,
    };
  }

  function setCarFormData(car) {
    document.getElementById("carPlate").value = car.carPlate;
    document.getElementById("carType").value = car.carType;
    document.getElementById("carSeat").value = car.carSeat;
    document.getElementById("carColor").value = car.carColor;
    document.getElementById("carDriver").value = car.carDriver;
    document.getElementById("carPhone").value = car.carPhone;
    document.getElementById("carStatus").value = car.carStatus;
    document.getElementById("carRegisteredDate").value = car.carRegisteredDate;
  }

  function resetForm() {
    carForm.reset();
  }

  // Initial Render
  filterAndRender();
});

// ============================
// Toggle Hotel Form
// ============================
const hotelBtn = document.getElementById("hotelBtn");
const hotelForm = document.getElementById("hotelForm");
hotelForm.style.display = "none"; // hide initially

let editingHotelIndex = null; 

hotelBtn.addEventListener("click", () => {
  const visible = hotelForm.style.display === "block";
  hotelForm.style.display = visible ? "none" : "block";
  hotelBtn.textContent = visible ? "Add New Hotel" : "Hide Form";
  if (visible) {
    editingHotelIndex = null;
    hotelForm.reset();
    touristTypeTables = {};
    document.getElementById("rateTablesContainer").innerHTML = "";
  }
});

// ============================
// Clone/Remove Room Types
// ============================
function setupClone(containerId) {
  const container = document.getElementById(containerId);

  function updateRemoveBtns() {
    const wrappers = container.querySelectorAll(".qty-room-wrapper");
    wrappers.forEach((btnWrap) => {
      const removeBtn = btnWrap.querySelector(".remove-room-btn");
      if (removeBtn) removeBtn.disabled = wrappers.length <= 1;
    });
  }

  function removeItem(e) {
    if (container.querySelectorAll(".qty-room-wrapper").length > 1) {
      e.target.closest(".qty-room-wrapper").remove();
      updateRemoveBtns();
    }
  }

  function addItem() {
    const firstWrapper = container.querySelector(".qty-room-wrapper");
    const clone = firstWrapper.cloneNode(true);
    clone
      .querySelectorAll("input")
      .forEach((inp) => (inp.value = inp.type === "number" ? "0" : ""));
    clone
      .querySelector(".remove-room-btn")
      .addEventListener("click", removeItem);
    clone.querySelector(".add-room-btn").addEventListener("click", addItem);
    container.appendChild(clone);
    updateRemoveBtns();
  }

  container
    .querySelectorAll(".remove-room-btn")
    .forEach((btn) => btn.addEventListener("click", removeItem));
  container
    .querySelectorAll(".add-room-btn")
    .forEach((btn) => btn.addEventListener("click", addItem));
  updateRemoveBtns();
}

setupClone("deptEmailContainer");
setupClone("deptPhoneContainer");
setupClone("roomTypesContainer"); // add for rooms

// ============================
// Rate Table Add Functionality
// ============================
let touristTypeTables = {};

document.getElementById("addTableBtn").addEventListener("click", () => {
  const type = document.getElementById("touristType").value;
  const from = document.getElementById("rateFrom").value;
  const to = document.getElementById("rateTo").value;
  const remarks = document.getElementById("remarks").value.trim();
  const currency = document.getElementById("currency").value;

  const rooms = [];
  document
    .querySelectorAll("#roomTypesContainer .qty-room-wrapper")
    .forEach((wrap) => {
      const rt = wrap.querySelector('input[type="text"]').value.trim();
      const qty = parseInt(
        wrap.querySelector('input[type="number"]').value,
        10
      );
      if (rt && qty > 0) rooms.push({ rt, qty });
    });

  if (!type || !from || !to || !currency || rooms.length === 0) {
    alert(
      "Please fill all required fields and add at least one room type with quantity > 0."
    );
    return;
  }

  touristTypeTables[type] = { from, to, remarks, currency, rooms };
  renderTables();
});

function renderTables() {
  const container = document.getElementById("rateTablesContainer");
  container.innerHTML = "";

  Object.keys(touristTypeTables).forEach((type) => {
    const data = touristTypeTables[type];
    const block = document.createElement("div");
    block.className = "saved-block";

    // Header columns for rates
    const rateCategories = ["EP", "CP", "MAP", "AP"];
    const rateSubCols = ["Dbl", "Sgl", "EB", "CWB", "CNB"];

    block.innerHTML = `
      <h3>${type}</h3>
      <p>Valid: ${data.from} to ${data.to} | Remarks: ${data.remarks}</p>
      <div class="rate-table-scroll" style="overflow-x:auto;">
        <table border="1" cellpadding="5">
          <thead>
            <tr>
              <th rowspan="2">Room Type</th>
              <th rowspan="2">Qty</th>
              ${rateCategories
                .map(
                  (rc) =>
                    `<th colspan="5" class="colored-block-${rc.toLowerCase()}">${rc}</th>`
                )
                .join("")}
            </tr>
            <tr>
              ${rateCategories
                .map((rc) =>
                  rateSubCols
                    .map(
                      (sc) =>
                        `<th class="colored-block-${rc.toLowerCase()}">${sc}</th>`
                    )
                    .join("")
                )
                .join("")}
            </tr>
          </thead>
          <tbody>
            ${data.rooms
              .map(
                (r) => `
              <tr>
                <td>${r.rt}</td>
                <td>${r.qty}</td>
                ${rateCategories
                  .map((rc) =>
                    rateSubCols
                      .map((sc) => {
                        const val = r[rc.toLowerCase()]?.[sc] || ""; // prefill if data exists
                        return `<td class="${rc.toLowerCase()}"><input type="text" value="${val}" /></td>`;
                      })
                      .join("")
                  )
                  .join("")}
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;
    container.appendChild(block);
  });
}
// ============================
// Save & Cancel Button + Edit
// ============================
const cancelBtn = hotelForm.querySelector(".search-btn");
const saveBtn = hotelForm.querySelector(".add-btn");
const hotelTableBody = document.getElementById("hotelTableBody");
const HOTELS_PER_PAGE = 15;
let currentPage = 1;

function getHotels() {
  return JSON.parse(localStorage.getItem("hotels")) || [];
}
function saveHotelsToLocal(hotels) {
  localStorage.setItem("hotels", JSON.stringify(hotels));
}

function addHotelRow(hotel, index) {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${index}</td>
    <td>${hotel.hotelName}</td>
    <td>${hotel.location}</td>
    <td>${hotel.tcbRating}</td>
    <td>${hotel.category}</td>
    <td>${hotel.departments}</td>
    <td>
      <button class="view-hotel-btn">View</button>
      <button class="edit-hotel-btn">Edit</button>
    </td>
  `;

  row.querySelector(".view-hotel-btn").addEventListener("click", () => {
    let rateDetails = "";
    if (hotel.rates && typeof hotel.rates === "object") {
      Object.keys(hotel.rates).forEach((type) => {
        const t = hotel.rates[type];
        rateDetails += `\n\n${type} (${t.from} to ${t.to}) - ${t.currency}\nRemarks: ${t.remarks}\nRooms:\n`;
        t.rooms.forEach((r) => {
          rateDetails += ` - ${r.rt}: ${r.qty}\n`;
        });
      });
    }
    alert(
      `Hotel: ${hotel.hotelName}\nLocation: ${hotel.location}\nRating: ${hotel.tcbRating}\nCategory: ${hotel.category}\nDepartments: ${hotel.departments}\nRooms: ${hotel.rooms}\n\n--- Rate Details ---${rateDetails}`
    );
  });

  row.querySelector(".edit-hotel-btn").addEventListener("click", () => {
    editingHotelIndex = index - 1;
    hotelForm.style.display = "block";
    hotelBtn.textContent = "Hide Form";

    const hotelToEdit = getHotels()[editingHotelIndex];
    const inputs = hotelForm.querySelectorAll('.form-row input[type="text"]');
    if (inputs[0]) inputs[0].value = hotelToEdit.hotelName;
    if (inputs[1]) inputs[1].value = hotelToEdit.location;
    if (inputs[2]) inputs[2].value = hotelToEdit.tcbRating;
    if (inputs[3]) inputs[3].value = hotelToEdit.category;

    touristTypeTables = JSON.parse(JSON.stringify(hotelToEdit.rates || {}));
    renderTables();
  });

  hotelTableBody.appendChild(row);
}

function renderHotels() {
  const hotels = getHotels();
  hotelTableBody.innerHTML = "";
  const start = (currentPage - 1) * HOTELS_PER_PAGE;
  const end = start + HOTELS_PER_PAGE;
  hotels
    .slice(start, end)
    .forEach((hotel, i) => addHotelRow(hotel, start + i + 1));
}

if (cancelBtn) {
  cancelBtn.type = "button";
  cancelBtn.addEventListener("click", (e) => {
    e.preventDefault();
    hotelForm.reset();
    hotelForm.style.display = "none";
    hotelBtn.textContent = "Add New Hotel";
    editingHotelIndex = null;
    touristTypeTables = {};
    document.getElementById("rateTablesContainer").innerHTML = "";
  });
}

if (saveBtn) {
  saveBtn.type = "button";
  saveBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const inputs = hotelForm.querySelectorAll('.form-row input[type="text"]');
    const hotelName = inputs[0]?.value.trim() || "";
    const location = inputs[1]?.value.trim() || "";
    const tcbRating = inputs[2]?.value.trim() || "";
    const category = inputs[3]?.value.trim() || "";

    if (!hotelName || !location) {
      alert("Please fill required fields (Hotel Name, Location).");
      return;
    }

    const departments = Array.from(
      document.querySelectorAll('#deptEmailContainer input[type="text"]')
    )
      .map((d) => d.value)
      .filter((v) => v)
      .join(", ");
    const rooms = Array.from(
      document.querySelectorAll('#roomTypesContainer input[type="text"]')
    )
      .map((r) => r.value)
      .filter((v) => v)
      .join(",");
    const rates = JSON.parse(JSON.stringify(touristTypeTables));

    const newHotel = {
      hotelName,
      location,
      tcbRating,
      category,
      departments,
      rooms,
      rates,
    };
    let hotels = getHotels();

    if (editingHotelIndex !== null && editingHotelIndex >= 0) {
      hotels[editingHotelIndex] = newHotel;
      editingHotelIndex = null;
    } else {
      hotels.push(newHotel);
    }

    saveHotelsToLocal(hotels);
    hotelForm.reset();
    hotelForm.style.display = "none";
    hotelBtn.textContent = "Add New Hotel";
    touristTypeTables = {};
    document.getElementById("rateTablesContainer").innerHTML = "";

    renderHotels();
  });
}

// Auto-Search Hotel
document.getElementById("searchHotel").addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase();
  document.querySelectorAll("#hotelTableBody tr").forEach((row) => {
    const hotelName = row.cells[1].textContent.toLowerCase();
    row.style.display = hotelName.includes(query) ? "" : "none";
  });
});

// Load hotels on page load
window.addEventListener("load", renderHotels);

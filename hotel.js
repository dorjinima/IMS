// ============================
// Toggle Hotel Form
// ============================
const hotelBtn = document.getElementById('hotelBtn');
const hotelForm = document.getElementById('hotelForm');
hotelForm.style.display = 'none'; // hide initially

hotelBtn.addEventListener('click', () => {
  const visible = hotelForm.style.display === 'block';
  hotelForm.style.display = visible ? 'none' : 'block';
  hotelBtn.textContent = visible ? 'Add New Hotel' : 'Hide Form';
});

// ============================
// Generic Clone/Remove Utility
// ============================
function setupClone(containerId) {
  const container = document.getElementById(containerId);

  function updateRemoveBtns() {
    const wrappers = container.querySelectorAll('.qty-room-wrapper');
    wrappers.forEach(btnWrap => {
      const removeBtn = btnWrap.querySelector('.remove-room-btn');
      if (removeBtn) removeBtn.disabled = wrappers.length <= 1;
    });
  }

  function removeItem(e) {
    if (container.querySelectorAll('.qty-room-wrapper').length > 1) {
      e.target.closest('.qty-room-wrapper').remove();
      updateRemoveBtns();
    }
  }

  function addItem() {
    const firstWrapper = container.querySelector('.qty-room-wrapper');
    const clone = firstWrapper.cloneNode(true);
    clone.querySelectorAll('input').forEach(inp => inp.value = '');
    clone.querySelector('.remove-room-btn').addEventListener('click', removeItem);
    clone.querySelector('.add-room-btn').addEventListener('click', addItem);
    container.appendChild(clone);
    updateRemoveBtns();
  }

  container.querySelectorAll('.remove-room-btn').forEach(btn => btn.addEventListener('click', removeItem));
  container.querySelectorAll('.add-room-btn').forEach(btn => btn.addEventListener('click', addItem));
  updateRemoveBtns();
}

setupClone('deptEmailContainer');
setupClone('deptPhoneContainer');

// ============================
// Clone/Remove Room Types (Horizontal)
// ============================
const roomTypesContainer = document.getElementById('roomTypesContainer');

function updateRoomRemoveButtons() {
  const wrappers = roomTypesContainer.querySelectorAll('.qty-room-wrapper');
  wrappers.forEach(wrapper => {
    const btn = wrapper.querySelector('.remove-room-btn');
    if (btn) btn.disabled = wrappers.length <= 1;
  });
}

function removeRoom(e) {
  if (roomTypesContainer.querySelectorAll('.qty-room-wrapper').length > 1) {
    e.target.closest('.qty-room-wrapper').remove();
    updateRoomRemoveButtons();
  }
}

function addRoom() {
  const firstWrapper = roomTypesContainer.querySelector('.qty-room-wrapper');
  const clone = firstWrapper.cloneNode(true);
  clone.querySelectorAll('input').forEach(inp => inp.value = inp.type === 'number' ? '0' : '');
  clone.querySelector('.remove-room-btn').addEventListener('click', removeRoom);
  clone.querySelector('.add-room-btn').addEventListener('click', addRoom);
  roomTypesContainer.appendChild(clone);
  updateRoomRemoveButtons();
}

// init
roomTypesContainer.querySelectorAll('.remove-room-btn').forEach(btn => btn.addEventListener('click', removeRoom));
roomTypesContainer.querySelectorAll('.add-room-btn').forEach(btn => btn.addEventListener('click', addRoom));
updateRoomRemoveButtons();

// ============================
// Rate Table Add Functionality
// ============================
let touristTypeTables = {};

document.getElementById('addTableBtn').addEventListener('click', () => {
  const type = document.getElementById('touristType').value;
  const from = document.getElementById('rateFrom').value;
  const to = document.getElementById('rateTo').value;
  const remarks = document.getElementById('remarks').value.trim();
  const currency = document.getElementById('currency').value;

  // collect rooms
  const rooms = [];
  roomTypesContainer.querySelectorAll('.qty-room-wrapper').forEach(wrap => {
    const rt = wrap.querySelector('input[type="text"]').value.trim();
    const qty = parseInt(wrap.querySelector('input[type="number"]').value, 10);
    if (rt && qty > 0) rooms.push({ rt, qty });
  });

  if (!type || !from || !to || !currency || rooms.length === 0) {
    alert("Please fill all required fields and add at least one room type with quantity > 0.");
    return;
  }

  touristTypeTables[type] = { from, to, remarks, currency, rooms };
  renderTables();
});

function renderTables() {
  const container = document.getElementById('rateTablesContainer');
  container.innerHTML = '';

  Object.keys(touristTypeTables).forEach(type => {
    const data = touristTypeTables[type];
    const block = document.createElement('div');
    block.className = 'saved-block';

    block.innerHTML = `
      <h3>${type}</h3>
      <p>Valid: ${data.from} to ${data.to} | Remarks: ${data.remarks}</p>
      <div class="rate-table-scroll" style="overflow-x:auto;">
        <table>
          <thead>
            <tr>
              <th rowspan="2">Room Type</th>
              <th rowspan="2">Qty</th>
              <th colspan="5" class="colored-block-ep">EP</th>
              <th colspan="5" class="colored-block-cp">CP</th>
              <th colspan="5" class="colored-block-map">MAP</th>
              <th colspan="5" class="colored-block-ap">AP</th>
            </tr>
            <tr>
              ${['EP','CP','MAP','AP'].map(cls =>
                ['Dbl','Sgl','EB','CWB','CNB'].map(h =>
                  `<th class="colored-block-${cls.toLowerCase()}">${h}</th>`
                ).join('')
              ).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.rooms.map(room => `
              <tr>
                <td>${room.rt}</td>
                <td>${room.qty}</td>
                ${['ep','cp','map','ap'].map(cls =>
                  Array(5).fill(`<td class="${cls}"><input type="text" /></td>`).join('')
                ).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>`;
    container.appendChild(block);
  });
}

// ============================
// Save & Cancel Button with LocalStorage + Pagination + Edit/View
// ============================
const cancelBtn = hotelForm.querySelector('.search-btn');
const saveBtn = hotelForm.querySelector('.add-btn');
const hotelTableBody = document.getElementById('hotelTableBody');

const HOTELS_PER_PAGE = 15;
let currentPage = 1;

function getHotels() {
  return JSON.parse(localStorage.getItem('hotels')) || [];
}

function saveHotelsToLocal(hotels) {
  localStorage.setItem('hotels', JSON.stringify(hotels));
}

function addHotelRow(hotel, index) {
  const row = document.createElement('tr');
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

  // View with full details (including rates)
  row.querySelector('.view-hotel-btn').addEventListener('click', () => {
    let rateDetails = "";
    Object.keys(touristTypeTables).forEach(type => {
      const t = touristTypeTables[type];
      rateDetails += `\n${type} (${t.from} to ${t.to}) - ${t.currency}\nRemarks: ${t.remarks}`;
    });

    alert(
      `Hotel: ${hotel.hotelName}\nLocation: ${hotel.location}\nRating: ${hotel.tcbRating}\nCategory: ${hotel.category}\nDepartments: ${hotel.departments}\nRooms: ${hotel.rooms}\nRates: ${hotel.rates}\n\n--- Rate Details ---${rateDetails}`
    );
  });

  // Edit hotel basic info
  row.querySelector('.edit-hotel-btn').addEventListener('click', () => {
    hotelForm.style.display = 'block';
    hotelBtn.textContent = 'Hide Form';
    const inputs = hotelForm.querySelectorAll('.form-row input[type="text"]');
    inputs[0].value = hotel.hotelName;
    inputs[1].value = hotel.location;
    inputs[2].value = hotel.tcbRating;
    inputs[3].value = hotel.category;
  });

  hotelTableBody.appendChild(row);
}

function renderHotels() {
  const hotels = getHotels();
  hotelTableBody.innerHTML = '';

  const start = (currentPage - 1) * HOTELS_PER_PAGE;
  const end = start + HOTELS_PER_PAGE;
  const paginatedHotels = hotels.slice(start, end);

  paginatedHotels.forEach((hotel, i) => addHotelRow(hotel, start + i + 1));

  renderPagination(hotels.length);
}

function renderPagination(totalHotels) {
  const pagination = document.getElementById('pagination');
  if (!pagination) return;

  pagination.innerHTML = '';

  const totalPages = Math.ceil(totalHotels / HOTELS_PER_PAGE);

  if (currentPage > 1) {
    const prevBtn = document.createElement('button');
    prevBtn.textContent = 'Prev';
    prevBtn.addEventListener('click', () => {
      currentPage--;
      renderHotels();
    });
    pagination.appendChild(prevBtn);
  }

  if (currentPage < totalPages) {
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next';
    nextBtn.addEventListener('click', () => {
      currentPage++;
      renderHotels();
    });
    pagination.appendChild(nextBtn);
  }
}

// cancel
cancelBtn.addEventListener('click', () => {
  hotelForm.reset();
  hotelForm.style.display = 'none';
  hotelBtn.textContent = 'Add New Hotel';
});

// save
saveBtn.addEventListener('click', (e) => {
  e.preventDefault();
  const inputs = hotelForm.querySelectorAll('.form-row input[type="text"]');
  const hotelName = inputs[0].value.trim();
  const location = inputs[1].value.trim();
  const tcbRating = inputs[2].value.trim();
  const category = inputs[3].value.trim();

  if (!hotelName || !location) {
    alert("Please fill Hotel Name and Location.");
    return;
  }

  const departments = Array.from(document.querySelectorAll('#deptEmailContainer input[type="text"]'))
    .map(d => d.value).join(', ');
  const rooms = Array.from(document.querySelectorAll('#roomTypesContainer input[type="text"]'))
    .map(r => r.value).join(', ');
  const rates = Object.keys(touristTypeTables).join(', ');

  const newHotel = { hotelName, location, tcbRating, category, departments, rooms, rates };

  const hotels = getHotels();
  hotels.push(newHotel);
  saveHotelsToLocal(hotels);

  hotelForm.reset();
  hotelForm.style.display = 'none';
  hotelBtn.textContent = 'Add New Hotel';
  document.getElementById('rateTablesContainer').innerHTML = '';
  touristTypeTables = {};

  renderHotels();
});

// ============================
// Auto-Search Hotel Functionality
// ============================
document.getElementById('searchHotel').addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  document.querySelectorAll('#hotelTableBody tr').forEach(row => {
    const hotelName = row.cells[1].textContent.toLowerCase();
    row.style.display = hotelName.includes(query) ? '' : 'none';
  });
});

// ============================
// Load stored hotels on page load
// ============================
window.addEventListener('load', renderHotels);

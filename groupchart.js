const NEPTUNE_KEY = "neptuneGroupChartData";
let editingIndex = null;

// === IDs to match your HTML elements ===
const cloneCheckboxId = "cloneCheckbox";        // checkbox that triggers cloning
const cloneContainerId = "neptuneCloneContainer"; // container to append cloned forms

// Keep track of the cloned form node
let clonedRow = null;

// === Toggle Form Display ===
function toggleForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return;
  const isVisible = form.style.display === "block";
  form.style.display = isVisible ? "none" : "block";
  if (!isVisible) resetForm();
}

// === Reset Form ===
function resetForm() {
  const form = document.getElementById("neptuneGroupChartForm");
  if (form) form.reset();

  editingIndex = null;

  // Hide all tabs
  document.querySelectorAll(".section-tab").forEach(tab => {
    tab.style.display = "none";
  });

  // Remove active class
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.classList.remove("active");
  });

  // Show first tab by default if available
  const firstTab = document.querySelector(".tab-btn");
  if (firstTab) {
    firstTab.classList.add("active");
    const firstTarget = document.getElementById(firstTab.dataset.target);
    if (firstTarget) firstTarget.style.display = "block";
  }
}

// === Cancel Form ===
function neptuneCancelForm() {
  const form = document.getElementById("neptuneGroupChartForm");
  if (form) form.style.display = "none";
  resetForm();
}

// === Save / Update Group ===
function addGroupChartRow(event) {
  if (event) event.preventDefault();

  const getValue = id => document.getElementById(id)?.value || '';
  const parseNum = val => parseInt(val || 0, 10);

  const groupData = {
    fileNo: getValue("neptuneFileNo"),
    groupName: getValue("neptuneGroupName"),
    company: getValue("neptuneCompany"),
    confirmationDate: getValue("neptuneDateofConfrmtn"),
    adultsRegional: parseNum(getValue("adultsRegional")),
    adultsInternational: parseNum(getValue("adultsInternational")),
    adultsOther: parseNum(getValue("adultsOther")),
    kidsRegional: parseNum(getValue("kids6to12Regional")) + parseNum(getValue("kids5BelowRegional")),
    kidsInternational: parseNum(getValue("kids6to12International")) + parseNum(getValue("kids5BelowInternational")),
    kidsOther: parseNum(getValue("kids6to12Other")) + parseNum(getValue("kids5BelowOther")),
    arrivalDate: getValue("neptuneArrivalDate"),
    arrivalTime: getValue("neptuneArrivalTime"),
    arrivalPort: getValue("neptuneArrivalPort"),
    arrivalTransport: getValue("neptuneArrivalMode"),
    departureDate: getValue("neptuneDepartureDate"),
    departureTime: getValue("neptuneDepartureTime"),
    departurePort: getValue("neptuneDeparturePort"),
    departureTransport: getValue("neptuneDepartureMode"),
    noOfNights: getValue("noOfNights"),
    hotelName: getValue("hotelName"),
    roomType: getValue("roomType"),
    qty: getValue("qty"),
    guideName: getValue("guideName"),
    guideContact: getValue("guideContact"),
    guideProfessional: getValue("guideProfessional"),
    guideLicense: getValue("guideLicense"),
    guideStartDate: getValue("guideStartDate"),
    guideEndDate: getValue("guideEndDate"),
    vehicleNo: getValue("vehicleNo"),
    driverName: getValue("driverName"),
    driverContact: getValue("driverContact"),
    vehicleStartDate: getValue("vehicleStartDate"),
    vehicleEndDate: getValue("vehicleEndDate"),
    tourRemark: getValue("tourRemark")
  };

  const savedData = JSON.parse(localStorage.getItem(NEPTUNE_KEY)) || [];

  if (editingIndex !== null) {
    savedData[editingIndex] = groupData;
  } else {
    savedData.push(groupData);
  }

  localStorage.setItem(NEPTUNE_KEY, JSON.stringify(savedData));
  renderGroupChart();
  document.getElementById("neptuneGroupChartForm").style.display = "none";
  resetForm();
  showSavePrompt();
  scrollToTopOfTable();
}

// === Render Data Table ===
function renderGroupChart() {
  const tbody = document.getElementById("neptuneGroupChartList");
  const data = JSON.parse(localStorage.getItem(NEPTUNE_KEY)) || [];
  if (!tbody) return;

  tbody.innerHTML = data.map((item, index) => {
    const totalAdults = item.adultsRegional + item.adultsInternational + item.adultsOther;
    const totalKids = item.kidsRegional + item.kidsInternational + item.kidsOther;
    const totalPax = totalAdults + totalKids;
    return `
      <tr>
        <td>${index + 1}</td>
        <td>${item.fileNo}</td>
        <td>${item.groupName}</td>
        <td>${item.company}</td>
        <td>${item.confirmationDate}</td>
        <td>${item.adultsRegional}</td>
        <td>${item.adultsInternational}</td>
        <td>${totalAdults}</td>
        <td>${totalKids}</td>
        <td>${totalPax}</td>
        <td>${item.roomType} - ${item.qty}</td>
        <td>${item.arrivalDate}</td>
        <td>${item.arrivalTime}</td>
        <td>${item.arrivalPort}</td>
        <td>${item.arrivalTransport}</td>
        <td>${item.departureDate}</td>
        <td>${item.departureTime}</td>
        <td>${item.departurePort}</td>
        <td>${item.departureTransport}</td>
        <td>${item.noOfNights}</td>
        <td>${item.hotelName}</td>
        <td>${item.guideName}</td>
        <td>${item.guideContact}</td>
        <td>${item.guideProfessional}</td>
        <td>${item.guideLicense}</td>
        <td>${item.guideStartDate}</td>
        <td>${item.guideEndDate}</td>
        <td>${item.vehicleNo}</td>
        <td>${item.driverName}</td>
        <td>${item.driverContact}</td>
        <td>${item.vehicleStartDate}</td>
        <td>${item.vehicleEndDate}</td>
        <td>${item.tourRemark}</td>
        <td>
          <button onclick="editGroup(${index})">Edit</button>
          <button onclick="deleteGroup(${index})">Delete</button>
        </td>
      </tr>
    `;
  }).join("");
}

// === Edit Row ===
function editGroup(index) {
  const data = JSON.parse(localStorage.getItem(NEPTUNE_KEY)) || [];
  const item = data[index];
  if (!item) return;

  for (const key in item) {
    const input = document.getElementById(key);
    if (input) input.value = item[key];
  }

  editingIndex = index;
  document.getElementById("neptuneGroupChartForm").style.display = "block";
}

// === Delete Row ===
function deleteGroup(index) {
  if (!confirm("Are you sure you want to delete this group?")) return;
  const data = JSON.parse(localStorage.getItem(NEPTUNE_KEY)) || [];
  data.splice(index, 1);
  localStorage.setItem(NEPTUNE_KEY, JSON.stringify(data));
  renderGroupChart();
}

// === Search by Group Name ===
function handleSearchInput() {
  const query = document.getElementById("searchByGroupName")?.value.toLowerCase() || "";
  const data = JSON.parse(localStorage.getItem(NEPTUNE_KEY)) || [];
  const filtered = data.filter(item => item.groupName.toLowerCase().includes(query));
  const tbody = document.getElementById("neptuneGroupChartList");
  if (!tbody) return;

  tbody.innerHTML = filtered.map((item, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${item.fileNo}</td>
      <td>${item.groupName}</td>
      <td>${item.company}</td>
      <td>${item.confirmationDate}</td>
      <td colspan="28">Filtered Result</td>
      <td>
        <button onclick="editGroup(${index})">Edit</button>
        <button onclick="deleteGroup(${index})">Delete</button>
      </td>
    </tr>
  `).join("");
}

// === Save Confirmation Prompt ===
function showSavePrompt() {
  const prompt = document.getElementById("savePrompt");
  if (!prompt) return;
  prompt.style.display = "flex";
  setTimeout(() => {
    prompt.style.display = "none";
  }, 3000);
}

// === Scroll to Table ===
function scrollToTopOfTable() {
  const container = document.querySelector(".group-chart-scroll");
  if (container) container.scrollTop = 0;
}

// === Tab Switch for Additional Info ===
function setupTabs() {
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-target");

      document.querySelectorAll(".section-tab").forEach(tab => {
        tab.style.display = "none";
      });
      document.querySelectorAll(".tab-btn").forEach(b => {
        b.classList.remove("active");
      });

      btn.classList.add("active");
      const targetSection = document.getElementById(target);
      if (targetSection) targetSection.style.display = "block";
    });
  });
}

// === Clone .neptune-row when checkbox toggled ===
function handleCloneCheckboxChange() {
  const checkbox = document.getElementById(cloneCheckboxId);
  const container = document.getElementById(cloneContainerId);
  if (!checkbox || !container) return;

  if (checkbox.checked) {
    // Clone the first .neptune-row
    const originalRow = document.querySelector(".neptune-row");
    if (originalRow) {
      clonedRow = originalRow.cloneNode(true);

      // Clear input/select/textarea values in clonedRow & update ids
      clonedRow.querySelectorAll("input, select, textarea").forEach((input) => {
        if (input.type === "checkbox" || input.type === "radio") {
          input.checked = false;
        } else {
          input.value = "";
        }

        if (input.id) {
          input.id = input.id + "_clone";
        }
        if (input.name) {
          input.name = input.name + "_clone";
        }
      });

      container.appendChild(clonedRow);
    }
  } else {
    // Remove the cloned row if unchecked
    if (clonedRow && container.contains(clonedRow)) {
      container.removeChild(clonedRow);
      clonedRow = null;
    }
  }
}

// === INIT ===
document.addEventListener("DOMContentLoaded", () => {
  renderGroupChart();
  setupTabs();

  document.getElementById("searchByGroupName")?.addEventListener("input", handleSearchInput);
  document.querySelector(".neptune-submit-btn")?.addEventListener("click", addGroupChartRow);
  document.querySelector(".neptune-cancel-btn")?.addEventListener("click", neptuneCancelForm);

  // Setup clone checkbox event listener
  const checkbox = document.getElementById(cloneCheckboxId);
  if (checkbox) {
    checkbox.addEventListener("change", handleCloneCheckboxChange);
  }
});

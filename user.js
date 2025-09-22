const USER_KEY = "userAccounts";
let userData = JSON.parse(localStorage.getItem(USER_KEY)) || [];

document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.getElementById("userAddBtn");
  const formContainer = document.querySelector(".user-form-container");
  const cancelBtn = formContainer.querySelector(".btn-danger");
  const saveBtn = document.getElementById("userSaveBtn");
  const showPasswordCheckbox = document.getElementById("userShowPassword");
  const passwordInput = document.getElementById("userPassword");
  const togglePasswordBtn = document.getElementById("userTogglePassword");
  const selectAllBtn = document.getElementById("userSelectAll");
  const statusToggle = document.getElementById("userStatusToggle");
  const statusText = document.getElementById("userStatusText");

  let editIndex = null;

  // Show form
  addBtn.addEventListener("click", () => {
    formContainer.style.display = "block";
  });

  // Cancel form
  cancelBtn.addEventListener("click", () => {
    formContainer.style.display = "none";
    resetForm();
  });

  // Toggle password visibility
  togglePasswordBtn.addEventListener("click", () => {
    passwordInput.type = passwordInput.type === "password" ? "text" : "password";
  });

  showPasswordCheckbox.addEventListener("change", () => {
    passwordInput.type = showPasswordCheckbox.checked ? "text" : "password";
  });

  // Toggle account status
  statusToggle.addEventListener("change", () => {
    statusText.textContent = statusToggle.checked ? "Active" : "Inactive";
  });

  // Select all permissions
  selectAllBtn.addEventListener("click", () => {
    const checkboxes = formContainer.querySelectorAll(".permissions input[type='checkbox']");
    checkboxes.forEach(cb => cb.checked = true);
  });

  // Save user
  saveBtn.addEventListener("click", () => {
    const newUser = {
      fullName: document.getElementById("userFullName").value.trim(),
      email: document.getElementById("userEmail").value.trim(),
      phone: document.getElementById("userPhone").value.trim(),
      username: document.getElementById("userUsername").value.trim(),
      password: document.getElementById("userPassword").value.trim(),
      status: statusToggle.checked ? "Active" : "Inactive",
    };

    if (!newUser.fullName || !newUser.email || !newUser.username || !newUser.password) {
      alert("Please fill in all required fields.");
      return;
    }

    if (editIndex !== null) {
      userData[editIndex] = newUser;
      editIndex = null;
    } else {
      userData.push(newUser);
    }

    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    renderUserTable();
    formContainer.style.display = "none";
    resetForm();
  });

  // Render user table
  function renderUserTable() {
    const tbody = document.getElementById("userTableBody");
    tbody.innerHTML = "";

    userData.forEach((user, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${user.fullName}</td>
        <td>${user.email}</td>
        <td>${user.phone}</td>
        <td>${user.username}</td>
        <td>${user.password}</td>
        <td>${user.status}</td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="editUser(${index})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteUser(${index})">Delete</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  // Edit user
  window.editUser = function(index) {
    const user = userData[index];
    editIndex = index;

    document.getElementById("userFullName").value = user.fullName;
    document.getElementById("userEmail").value = user.email;
    document.getElementById("userPhone").value = user.phone;
    document.getElementById("userUsername").value = user.username;
    document.getElementById("userPassword").value = user.password;
    statusToggle.checked = user.status === "Active";
    statusText.textContent = user.status;

    formContainer.style.display = "block";
  };

  // Delete user
  window.deleteUser = function(index) {
    if (confirm("Are you sure you want to delete this user?")) {
      userData.splice(index, 1);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      renderUserTable();
    }
  };

  // Reset form
  function resetForm() {
    formContainer.querySelectorAll("input").forEach(input => {
      if (input.type === "checkbox") input.checked = false;
      else input.value = "";
    });
    statusToggle.checked = true;
    statusText.textContent = "Active";
    editIndex = null;
  }

  // Initial render
  renderUserTable();
});

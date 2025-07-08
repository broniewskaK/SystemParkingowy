const API_URL = "/api/users";

let allUsers = [];
let selectedUserIdx = null;

const usersList           = document.getElementById("usersList");
const addBtn              = document.getElementById("addBtn");
const editBtn             = document.getElementById("editBtn");
const deleteBtn           = document.getElementById("deleteBtn");
const userFormContainer   = document.getElementById("userFormContainer");
const userForm            = document.getElementById("userForm");
const userLogin           = document.getElementById("userLogin");
const userName            = document.getElementById("userName");
const userSurname         = document.getElementById("userSurname");
const userRole            = document.getElementById("userRole");
const defaultPasswordInfo = document.getElementById("defaultPasswordInfo");
const saveBtn             = document.getElementById("saveBtn");

// ładowanie listy
function loadUsers() {
  fetch(API_URL)
    .then(res => res.json())
    .then(data => {
      allUsers = data;
      selectedUserIdx = null;
      renderUsersList();
    })
    .catch(() => {
      usersList.innerHTML = '<li style="color:red;">Błąd ładowania</li>';
    });
}

// rysowanie listy i przycisków
function renderUsersList() {
  usersList.innerHTML = "";
  allUsers.forEach((u, idx) => {
    const li = document.createElement("li");
    li.textContent = `${u.login} — ${u.name} ${u.surname} (${u.role==="manager"?"Zarządca":"Pracownik"})`;
    li.className = "user-li" + (idx===selectedUserIdx ? " selected":"");
    li.onclick = () => {
      selectedUserIdx = idx;
      renderUsersList();
      editBtn.disabled = deleteBtn.disabled = false;
      userFormContainer.style.display = "none";
    };
    usersList.appendChild(li);
  });
  if (selectedUserIdx===null) {
    editBtn.disabled = deleteBtn.disabled = true;
  }
}

// Dodawanie
addBtn.onclick = () => {
  selectedUserIdx = null;
  userForm.reset();
  userLogin.disabled   = false;
  defaultPasswordInfo.style.display = "block";
  saveBtn.textContent = "Dodaj";
  userFormContainer.style.display = "block";
  editBtn.disabled = deleteBtn.disabled = true;
};

// Edycja
editBtn.onclick = () => {
  if (selectedUserIdx === null) return;
  const u = allUsers[selectedUserIdx];
  userLogin.value   = u.login;
  userName.value    = u.name;
  userSurname.value = u.surname;
  userRole.value    = u.role;
  userLogin.disabled = true;
  defaultPasswordInfo.style.display = "none";
  saveBtn.textContent = "Zapisz";
  userFormContainer.style.display = "block";
};

// Usuwanie
deleteBtn.onclick = () => {
  if (selectedUserIdx === null) return;
  if (!confirm("Usunąć pracownika?")) return;
  const u = allUsers[selectedUserIdx];
  fetch(API_URL, {
    method: "DELETE",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({login: u.login})
  })
  .then(r=>r.json())
  .then(data=>{
    if (data.success) loadUsers();
    else alert("Błąd: "+(data.message||""));
  })
  .catch(()=>alert("Błąd połączenia"));
};

// Zapis
userForm.onsubmit = e => {
  e.preventDefault();
  const login   = userLogin.value.trim();
  const name    = userName.value.trim();
  const surname = userSurname.value.trim();
  const role    = userRole.value;

  if (!login || !name || !surname) {
    alert("Wypełnij wszystkie pola!");
    return;
  }

  if (saveBtn.textContent === "Dodaj") {
    fetch(API_URL, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({
        login: login,
        password: "PASSWORD",
        role: role,
        name: name,
        surname: surname
      })
    })
    .then(r=>r.json())
    .then(data=>{
      if (data.success) {
        loadUsers();
        userFormContainer.style.display = "none";
      } else {
        alert("Błąd: "+(data.message||""));
      }
    })
    .catch(()=>alert("Błąd sieci"));
  } else {
    // edycja
    fetch(API_URL, {
      method: "PUT",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({
        login: login,
        role: role,
        name: name,
        surname: surname
      })
    })
    .then(r=>r.json())
    .then(data=>{
      if (data.success) {
        loadUsers();
        userFormContainer.style.display = "none";
      } else {
        alert("Błąd: "+(data.message||""));
      }
    })
    .catch(()=>alert("Błąd sieci"));
  }
};

// start
loadUsers();

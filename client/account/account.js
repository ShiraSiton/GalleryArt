const profilePic = document.getElementById("profilePic");
const fullName = document.getElementById("fullName");
const description = document.getElementById("description");
const totalArts = document.getElementById("totalArts");
const totalLikes = document.getElementById("totalLikes");
const myArtworks = document.getElementById("myArtworks");
const logoutBtn = document.getElementById("logoutBtn");

// כפתורי חשבון
const deleteAccountBtn = document.getElementById("deleteAccountBtn");
const editProfileBtn = document.getElementById("editProfileBtn");

// מודל עריכת פרופיל
const editProfileModal = document.getElementById("editProfileModal");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const saveEditBtn = document.getElementById("saveEditBtn");
const editFullName = document.getElementById("editFullName");
const editDescription = document.getElementById("editDescription");
const previewProfilePic = document.getElementById("previewProfilePic");
const editProfilePicInput = document.getElementById("editProfilePic");

// מודל עריכת יצירה
const editArtModal = document.getElementById("editArtModal");
const editArtTitle = document.getElementById("editArtTitle");
const cancelEditArtBtn = document.getElementById("cancelEditArtBtn");
const saveEditArtBtn = document.getElementById("saveEditArtBtn");

let currentArtId = null;

// טוקן ואימייל
const token = localStorage.getItem("token");
const payload = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(token.split(".")[1]), c => c.charCodeAt(0))));
const email = payload.email;

// ===== פונקציה שמביאה את נתוני המשתמש =====
async function loadAccount() {
  try {
    if (!token) {
      alert("עליך להתחבר קודם!");
      window.location.href = "../login/login.html";
      return;
    }

    // שליפת פרטי המשתמש
    const userRes = await fetch(`http://localhost:3000/users?email=${encodeURIComponent(email)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const userArray = await userRes.json();
    const user = userArray[0];

    // מילוי הנתונים במסך
    fullName.textContent = user.fullName;
    description.textContent = user.description || "אין עדיין תיאור אישי";
    profilePic.src = `/uploads/${user.profilePic}`;

    // שליפת היצירות
    const artsRes = await fetch(`http://localhost:3000/artWorks/getByEmail?email=${encodeURIComponent(user.email)}`);
    const arts = await artsRes.json();

    totalArts.textContent = arts.length || 0;
    totalLikes.textContent = arts.reduce((sum, a) => sum + (a.likes || 0), 0);

    // יצירת כרטיסים
    myArtworks.innerHTML = "";
    arts.forEach(a => {
      const card = document.createElement("div");
      card.className = "art-card";
      card.setAttribute("data-art-id", a.id);
      card.innerHTML = `
        <img src="/uploads/${a.imagePath}" alt="${a.title}">
        <div class="art-info">
          <h4 class="art-title">${a.title}</h4>
          <p class="text-sm text-gray-500">${a.likes} ❤️</p>
          <div class="art-actions">
            <button class="edit-btn">עריכה</button>
            <button class="delete-btn">מחיקה</button>
          </div>
        </div>
      `;

      // כפתור מחיקת יצירה
      const deleteBtn = card.querySelector(".delete-btn");
      deleteBtn.addEventListener("click", async () => {
        const confirmDelete = confirm("האם את בטוחה שברצונך למחוק את היצירה?");
        if (!confirmDelete) return;

        const response = await fetch(`http://localhost:3000/artWorks/${a.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          card.remove();
          console.log("✔️ היצירה נמחקה");
        } else {
          console.error("❌ שגיאה במחיקת יצירה:", await response.json());
          alert("לא ניתן למחוק את היצירה");
        }
      });

      // כפתור עריכת יצירה
      const editBtn = card.querySelector(".edit-btn");
      editBtn.addEventListener("click", () => {
        currentArtId = a.id;
        editArtTitle.value = a.title;
        editArtModal.classList.remove("hidden");
      });

      myArtworks.appendChild(card);
    });
  } catch (err) {
    console.error("❌ שגיאה בטעינת חשבון:", err);
  }
}

// ===== מאזינים לכפתורים =====

// התנתקות
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "../login/login.html";
});

// מחיקת חשבון
deleteAccountBtn.addEventListener("click", async () => {
  const confirmDelete = confirm("האם את בטוחה שברצונך למחוק את החשבון?");
  if (!confirmDelete) return;

  await fetch(`http://localhost:3000/users/${email}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });

  localStorage.removeItem("token");
  window.location.href = "../login/login.html";
});

// פתיחת המודל של עריכת פרופיל
editProfileBtn.addEventListener("click", () => {
  editFullName.value = fullName.textContent;
  editDescription.value = description.textContent;
  previewProfilePic.src = profilePic.src;
  editProfileModal.classList.remove("hidden");
});

// סגירת המודל
cancelEditBtn.addEventListener("click", () => {
  editProfileModal.classList.add("hidden");
});

// שמירת פרופיל
saveEditBtn.addEventListener("click", async () => {
  const newFullName = editFullName.value.trim();
  const newDescription = editDescription.value.trim();
  const newProfilePic = editProfilePicInput.files[0];

  const formData = new FormData();
  formData.append("fullName", newFullName);
  formData.append("description", newDescription);
  if (newProfilePic) {
    formData.append("profilePic", newProfilePic);
  }

  const response = await fetch("http://localhost:3000/users", {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });

  if (response.ok) {
    fullName.textContent = newFullName;
    description.textContent = newDescription;
    if (newProfilePic) {
      profilePic.src = URL.createObjectURL(newProfilePic);
    }
    editProfileModal.classList.add("hidden");
  } else {
    alert("❌ שגיאה בעדכון הפרופיל");
  }
});

// תצוגה מקדימה לתמונה חדשה
editProfilePicInput.addEventListener("change", () => {
  const file = editProfilePicInput.files[0];
  if (file) {
    previewProfilePic.src = URL.createObjectURL(file);
  }
});

// --- עריכת יצירה ---
cancelEditArtBtn.addEventListener("click", () => {
  editArtModal.classList.add("hidden");
});

saveEditArtBtn.addEventListener("click", async () => {
  const newTitle = editArtTitle.value.trim();
  if (!newTitle) return alert("שם היצירה לא יכול להיות ריק");

  const response = await fetch(`http://localhost:3000/artWorks/${currentArtId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json", 
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ title: newTitle })
  });

  if (response.ok) {
    const artCardTitle = document.querySelector(`[data-art-id="${currentArtId}"] .art-title`);
    if (artCardTitle) artCardTitle.textContent = newTitle;

    editArtModal.classList.add("hidden");
    console.log("✔️ היצירה עודכנה בהצלחה");
  } else {
    alert("❌ שגיאה בעדכון היצירה");
  }
});
// ========= Image Modal logic =========
const imageModal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const modalCaption = document.getElementById('modalCaption');
const closeImageModalBtn = document.getElementById('closeImageModal');
const myArtworksGrid = document.getElementById('myArtworks');

function openImageModal(src, caption = '') {
  modalImage.src = src;
  modalImage.alt = caption || 'תצוגת יצירה';
  modalCaption.textContent = caption || '';
  imageModal.classList.remove('hidden');
  imageModal.classList.add('flex');
  // מניעת גלילת רקע
  document.body.classList.add('overflow-hidden');
}

function closeImageModal() {
  imageModal.classList.remove('flex');
  imageModal.classList.add('hidden');
  modalImage.src = '';
  modalCaption.textContent = '';
  document.body.classList.remove('overflow-hidden');
}

// סגירה בכפתור X
closeImageModalBtn.addEventListener('click', closeImageModal);

// סגירה בלחיצה על הרקע
imageModal.addEventListener('click', (e) => {
  if (e.target === imageModal) closeImageModal();
});

// סגירה עם ESC
document.addEventListener('keydown', (e) => {
  if (!imageModal.classList.contains('hidden') && e.key === 'Escape') {
    closeImageModal();
  }
});

// האזנה לכל התמונות בכרטיסי היצירות (נטענים דינמית)
myArtworksGrid.addEventListener('click', (e) => {
  const img = e.target.closest('img');
  if (!img) return;
  const card = e.target.closest('.art-card');
  if (!card) return;

  // ניסיונות להביא כותרת/כיתוב
  const titleEl = card.querySelector('[data-art-title]') || card.querySelector('h4, .art-title');
  const caption = (titleEl?.textContent || img.alt || '').trim();

  openImageModal(img.src, caption);
});

// ===== אתחול =====
document.addEventListener("DOMContentLoaded", loadAccount);

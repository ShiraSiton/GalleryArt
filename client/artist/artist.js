// חילוץ ה-email מה-URL
const params = new URLSearchParams(window.location.search);
const email = params.get("email");

const artistInfo = document.getElementById("artistInfo");
const artistArtworks = document.getElementById("artistArtworks");


async function loadArtistProfile() {
  try {
        // שליפת יצירות של המשתמש
    const artRes = await fetch(`http://localhost:3000/artWorks/getByEmail?email=${encodeURIComponent(email)}`);
    const arts = await artRes.json();

// חישוב סטטיסטיקות
const totalArts = arts.length;
const totalLikes = arts.reduce((sum, art) => sum + (art.likes || 0), 0);
    arts.forEach(a => {
      const card = document.createElement("div");
      card.className = "art-card";
      card.innerHTML = `
        <img src="/uploads/${a.imagePath}" alt="${a.title}" class="w-full h-64 object-cover">
        <div class="p-4">
          <h4 class="text-lg font-semibold text-pink-600">${a.title}</h4>
          <p class="text-gray-500 text-sm mt-1">${a.likes} ❤️</p>
        </div>
      `;
      artistArtworks.appendChild(card);
    });
    // שליפת פרטי המשתמש
    const token = localStorage.getItem("token");

    const userRes = await fetch(`http://localhost:3000/users?email=${encodeURIComponent(email)}`, {
        headers: {
    "Authorization": `Bearer ${token}`
      }
    });

    const userData = await userRes.json();

    const user = userData[0]; // נניח שחוזר מערך

  artistInfo.innerHTML = `
  <div class="artist-header">
    <img src="/uploads/${user.profilePic || 'default.png'}" class="artist-photo" />
    <div class="artist-details">
      <h2>${user.fullName}</h2>
      <p class="stats">
        <span><strong>${totalArts}</strong> יצירות</span> • 
        <span><strong>${totalLikes}</strong> לייקים</span>
      </p>
      <p class="bio">${user.description || "אין תיאור עדיין"}</p>
    </div>
  </div>
`;



  } catch (err) {
    console.error("❌ שגיאה בטעינת פרופיל יוצר:", err);
    artistInfo.innerHTML = `<p class="text-red-500">שגיאה בטעינת פרטי היוצר</p>`;
  }
}

loadArtistProfile();
// בחירת המודול
const modal = document.getElementById("imageModal");
const modalImg = document.getElementById("modalImage");
const closeBtn = document.getElementById("closeModal");

// הוספת אירוע לכל תמונה
document.addEventListener("click", (e) => {
  if (e.target.tagName === "IMG" && e.target.closest(".art-card")) {
    modalImg.src = e.target.src;
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }
});

// סגירה
closeBtn.addEventListener("click", () => {
  modal.classList.remove("flex");
  modal.classList.add("hidden");
});

modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.remove("flex");
    modal.classList.add("hidden");
  }
});

const gallerySection = document.getElementById("galleryGrid");
const searchInput = document.getElementById("searchInput");

let artworks = [];

// פונקציה לחיפוש יצירות
function renderGallery() {
  gallerySection.innerHTML = "";

  const searchTerm = searchInput.value.trim().toLowerCase();// לוקחים את התוכן שאותו ברצוננו לחפש מסירים רווחים מימין ומשמאל וכן ממירים לאותיות קטנות שלא יהיה הבדל

  const filtered = artworks.filter(a =>
    a.title.toLowerCase().includes(searchTerm) ||
    (a.description && a.description.toLowerCase().includes(searchTerm)) ||
    (a.artist?.name && a.artist.name.toLowerCase().includes(searchTerm))
  );

  if (filtered.length === 0) { //אם לאחר הסינון לא נשארה אף יצירה מערך המוכנים ריק אז מחליפים את הגלריה בכיתוב 
    gallerySection.innerHTML = `<p class="text-center text-gray-600 col-span-full text-lg">לא נמצאו יצירות ✨</p>`;
    return;//יוצא מהפונקציה
  }

  filtered.forEach(a => {
    const card = document.createElement("article");//יוצרים כרטיס מסוג article
    card.className = "art-card";//מוסיפים לו שם מחלקה בשביל העיצוב ב css
    //כאן יקבע מה יהיה התוכן של הכרטיס בתוך טקבט כותבים הכל
  card.innerHTML = `
  <a href="../artist/artist.html?email=${encodeURIComponent(a.email)}">
    <img src="/uploads/${a.imagePath}" alt="${a.title}" loading="lazy" />
    <div class="art-info">
      <h3 class="art-title">${a.title}</h3>
      <p class="art-description">${a.description || ""}</p>
      <div class="flex justify-between items-center mt-3">
        <div class="artist-profile">
          <img src="/uploads/${a.artist?.profilePic || 'default.png'}" alt="${a.artist?.name || 'אומן'}" />
          <span class="artist-name">${a.artist?.name || a.email}</span>
        </div>
        <div class="like-btn">❤️ <span>${a.likes || 0}</span></div>
      </div>
    </div>
  </a>
`;

    gallerySection.appendChild(card);
  });
}

// טעינת הנתונים מהשרת
async function loadArtworks() {
  try {
    const res = await fetch("http://localhost:3000/artWorks");//ברירת מחדל של פאטצ זה GET
    const data = await res.json();//ממיר את הגייסון שחזר מהשרת לאובייקט אמיתי
    artworks = data;//מכניסים את המערך לאחד החיצוני
    renderGallery();//קוראים לפונקצית הסינון שהיא בפועל יוצרת את הכרטיסיות
  } catch (err) {
    console.error("❌ שגיאה בטעינת יצירות:", err);
    gallerySection.innerHTML = `<p class="text-center text-red-500">שגיאה בטעינת היצירות</p>`;
  }
}

// חיפוש
searchInput.addEventListener("input", renderGallery);//כשמכניסים משהו לתוך הקופסא יהיה נקראת הפונקציה

// אתחול
document.addEventListener("DOMContentLoaded", loadArtworks);//כשהעמוד נטען טוענים את היצירות מהשרת

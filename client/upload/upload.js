// 1. בחירת אלמנטים
const form = document.getElementById("uploadForm");
const fileInput = document.getElementById("imagePath");
const titleInput = document.querySelector("textarea");

// תוסיף ב-HTML אלמנט לתצוגה מקדימה:
const previewImg = document.createElement("img");
previewImg.id = "preview";
form.insertBefore(previewImg, titleInput); // מוסיף לפני הטקסטאריה

// 2. תצוגה מקדימה
fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      previewImg.src = reader.result; // מציג את התמונה שנבחרה
    };
    reader.readAsDataURL(file);
  }
});
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const file = fileInput.files[0];
  const title = titleInput.value;

  if (!file) {
    alert("נא לבחור תמונה!");
    return;
  }

  const formData = new FormData();
  formData.append("image", file);
  formData.append("title", title);

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("עליך להתחבר לפני העלאת יצירה");
      return;
    }

    const res = await fetch("http://localhost:3000/artWorks", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: formData
    });

    const data = await res.json();
    console.log("Status:", res.status, "Data:", data);

    if (res.ok) {
      alert("היצירה עלתה בהצלחה!");
       window.location.href = "../gallery/gallery.html"; 
    } else {
      alert("שגיאה: " + (data.error || "קרתה בעיה"));
    }
  } catch (err) {
    console.error("שגיאה:", err);
    alert("שגיאה כללית בהעלאה");
  }
});
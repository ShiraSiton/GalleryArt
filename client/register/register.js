
document.getElementById('registerForm').addEventListener('submit', async function (e) {//פונקציה אסינורית בשביל שיוכלו להשתמש בה ב await שזה נצרך כדי שקודם נקבל את הנתונים מהשרת ואז נוכל לבדוק עליהם
  e.preventDefault(); // מונע את הרענון של הדף

  const form = e.target;// זהו הטופס שבו נעשה ה submit
  const file = document.getElementById('profilePic').files[0];//מחלץ את התמונה עצמה
  const formData = new FormData();// עושים בצורה הזו ולא בהמרה רגילה לגייסון בגלל שהוא לא יודע להמיר תמונות.

  // מוסיפים את הנתונים מהטופס ל־FormData
  formData.append('fullName', form.fullName.value);
  formData.append('userName', form.userName.value);
  formData.append('email', form.email.value);
  formData.append('description', form.description.value);
  formData.append('password', form.password.value);
  if (file) formData.append('profilePic', file);

  try {
      const res = await fetch('http://localhost:3000/users', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();//ממירים את מה שחזר מהשרת לגייסון כדי שנוכל לעבוד עם זה
    if (res.ok) {
      alert("נרשמת בהצלחה!")

    localStorage.setItem("token", data.token); 
      window.location.href = "../home/home.html"; // מעבר לעמוד הבית
    } 
    else 
      {
      alert("שגיאה בהרשמה: " +  (data?.error || 'שגיאה לא מזוהה'));
    }
  } catch (err) {
    console.error("שגיאה:", err);
    alert("קרתה שגיאה כללית");
  }
});
// תצוגה מקדימה של התמונה שנבחרה לפרופיל
const profilePicInput = document.getElementById('profilePic');
const profilePreview = document.getElementById('profilePreview');

profilePicInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      profilePreview.src = reader.result;
    };
    reader.readAsDataURL(file);
  }
});

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch('http://localhost:3000/enterence', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || `שגיאת התחברות`);
    }

    if (result.success) {
    localStorage.setItem("token", result.token); 
      alert("התחברת בהצלחה!");
      window.location.href = "../home/home.html";
    } 
    else {
      alert("סיסמה שגויה או משתמש לא קיים");
    }
  } catch (error) {
    console.error("שגיאה בהתחברות:", error);
    alert("שגיאה בהתחברות: " + error.message);
  }
});

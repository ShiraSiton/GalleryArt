# GalleryArt - Project Book

מסמך זה מסביר את הפרויקט בצורה מקיפה, למי שרוצה להכיר אותו לעומק.

---

## Part 1: Overview - מה הפרויקט הזה עושה?

**GalleryArt** היא אפליקציית �็บ מלאה (Full Stack) לאמניות להצגה ושיתוף של יצירותיהן.

**המשתמשים יכולים:**
- להרשם ולהתחבר עם סיסמה מוצפנת
- להעלות תמונות של יצירות她们 יצרו
- לצפות בגלריה מלאה של יצירות
- לחפש יצירות לפי שם, תיאור או שם האמנית
- להכנס לפרופיל של אמנית ספציפית
- לנהל את החשבון שלהן (לערוך פרופיל, למחוק יצירות, למחוק חשבון)

**הממשק בעברית, מותאם לגלישה מימין-לשמאל (RTL).**

---

## Part 2: Technologies - הכלים שניצלנו

### What is Node.js?

**Node.js** is a JavaScript runtime — it lets you run JavaScript outside the browser, on your computer.

**Why we used it:** To build the server that handles all the logic behind the scenes — user registration, database queries, file uploads, etc.

**Simple analogy:** If the browser is where users see things, Node.js is what runs in the background — like the kitchen in a restaurant.

---

### What is Express?

**Express** is a minimal web framework for Node.js. It helps us build an API (Application Programming Interface) — a set of endpoints that the browser can talk to.

**Why we used it:** Instead of building everything from scratch, Express gives us tools to:
- Define routes (URLs that respond to requests)
- Parse incoming data
- Send back responses

**How it works:**
```
Browser says: "GET /artWorks"
Express matches that to our route handler
Handler fetches artworks from MySQL
Handler sends them back as JSON
```

---

### What is MySQL?

**MySQL** is a relational database — it stores data in tables (like Excel spreadsheets), with relationships between them.

**Why we used it:** To persistently store users, artworks, and comments.

**Our tables:**

| Table | Stores |
|-------|--------|
| Users | User accounts (name, email, password, profile picture) |
| ArtWorks | Artwork submissions (title, image, likes, owner email) |
| Comments | Comments on artworks |
| Category | Artwork categories |

**Key concept — Primary Key & Foreign Key:**
- **Primary Key (PK):** A unique identifier for each row (e.g., `email` in Users, `id` in ArtWorks)
- **Foreign Key (FK):** A reference from one table to another's PK (e.g., `ArtWorks.email` references `Users.email`)

**This means:** Every artwork must belong to an existing user. You cannot create an artwork for a user that doesn't exist.

---

### What is bcrypt?

**bcrypt** is a library for hashing passwords.

**Why we used it:** We never store plain-text passwords. When a user registers, we hash their password before saving it to the database. When they log in, we compare the hash — not the original password.

**How hashing works:**
```
User registers with password: "abc123"
bcrypt hashes it: "$2b$10$X4KvR5..."
We store the hash in MySQL

User logs in with password: "abc123"
bcrypt hashes the input: "$2b$10$X4KvR5..."
We compare: is the new hash equal to the stored hash?
If yes → password is correct
If no → password is wrong
```

**Why this matters:** If someone hacks the database and steals the passwords table, they only see hashes — not actual passwords. They can't reverse-engineer them.

---

### What is JWT (JSON Web Token)?

**JWT** is a way to authenticate users — to know who is making each request.

**Why we used it:** After a user logs in, we give them a "token" — a small piece of data that proves they are who they say they are. Every time they make a request that requires login (upload, edit, delete), they send this token with the request.

**How the flow works:**
```
1. User logs in → server checks credentials
2. Server creates a JWT token containing the user's data (email, name)
3. Server sends the token back to the browser
4. Browser saves the token in localStorage
5. Every subsequent request includes the token in the "Authorization" header
6. Server verifies the token before processing the request
```

**What a JWT token looks like:**
```
eyJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InNoaXJhQG1haWwuY29tIn0.abc123xyz
```
It's three parts separated by dots: header.payload.signature

**Why this is secure:**
- The token is signed with a secret key only the server knows
- If someone tries to fake a token, the signature won't match
- Tokens expire after time (configurable)

---

### What is multer?

**multer** is middleware for handling `multipart/form-data` — the format used when uploading files through a web form.

**Why we used it:** HTML forms can't send files as JSON. Files are sent as binary data using FormData. multer intercepts these requests and saves the files to our `uploads/` folder.

**How it works:**
```
Browser sends POST with FormData containing a file
multer reads the file
multer saves it to disk (uploads/ folder)
multer attaches file info to req.file
Controller reads req.file and gets the filename
```

**Our multer config:**
```javascript
filename: function (req, file, cb) {
  const imgId = req.params?.postId || Date.now();
  const ext = file.originalname.substring(file.originalname.lastIndexOf('.'));
  cb(null, `${imgId}${ext}`);
}
```
This means: the saved filename = timestamp + original extension (e.g., `1753955577586.png`)

---

### What is cors?

**CORS** (Cross-Origin Resource Sharing) is a security mechanism in browsers.

**Why we need it:** When the server runs on `localhost:3000` and the browser page is served from the same origin, there are no issues. But sometimes requests come from different ports. CORS tells the browser "it's okay to accept responses from other origins."

**Simple version:** We enable CORS so the browser doesn't block API requests.

---

### What is dotenv?

**dotenv** reads a `.env` file and puts its values into `process.env`.

**Why we used it:** To keep sensitive data (database password, JWT secret key) out of the source code.

**The `.env` file:**
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=1111
DB_PORT=3306
SecretKey=abcd1234
```

**Why this matters:** If we put passwords directly in the code and upload to GitHub, everyone can see them. The `.env` file is listed in `.gitignore` so it's NOT uploaded.

---

## Part 3: Architecture - How the code is organized

### The MVC Pattern

Our server follows the **MVC (Model-View-Controller)** pattern:

```
Request from browser
        ↓
    Router         → Which route handles this URL?
        ↓
    Middleware     → Check JWT? Handle file upload?
        ↓
    Controller    → Business logic: validate, process, respond
        ↓
    Model         → Database queries: SELECT, INSERT, UPDATE, DELETE
        ↓
    MySQL         → The actual database
```

**What each layer does:**

| Layer | Responsibility | Example |
|-------|---------------|---------|
| **Router** | Maps URLs to handlers | `GET /artWorks` → `getAll()` |
| **Middleware** | Processes requests before the controller | `verifyToken` checks JWT |
| **Controller** | Business logic | Validate input, call model, send response |
| **Model** | Database communication | Run SQL queries |

**Why this pattern?** Separation of concerns. Each file has one job. It's easy to find and fix problems.

---

## Part 4: Code Walkthrough

### Server Entry Point — `server/server.js`

This is the first file that runs. It:

1. **Loads environment variables:**
```javascript
import dotenv from "dotenv";
dotenv.config(); // reads .env into process.env
```

2. **Imports routers:**
```javascript
import userRouter from './routers/users.js'
import artWorkRouter from './routers/artWorks.js'
import entrenceRouter from './routers/enterence.js'
```

3. **Sets up middleware:**
```javascript
app.use(cors())            // Allow cross-origin requests
app.use(express.json())    // Parse JSON request bodies
```

4. **Connects routers to URL paths:**
```javascript
app.use('/users', userRouter)        // /users/* goes to users router
app.use('/artWorks', artWorkRouter)  // /artWorks/* goes to artWorks router
app.use('/enterence', entrenceRouter) // /enterence/* goes to entrance router
```

5. **Serves static files (the client):**
```javascript
app.use(express.static(path.join(__dirname, '../client')));
```
This means: when someone visits `http://localhost:3000/gallery/gallery.html`, the server finds `client/gallery/gallery.html` and sends it.

6. **Starts listening:**
```javascript
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
```

---

### Database Connection — `server/DB/runSql.js`

```javascript
import mysql from 'mysql2/promise';

const connectionPromise = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'GalleryArt',
    port: process.env.DB_PORT
});
```

**Key point:** We use `mysql2/promise` — this means every database query returns a **Promise** that we can `await`. This prevents "callback hell" and makes the code cleaner.

**The `?` placeholders** in SQL queries prevent **SQL injection** attacks:
```javascript
// SAFE — uses parameterized query
DB.execute('SELECT * FROM Users WHERE email = ?', [email])

// DANGEROUS — never do this
DB.execute(`SELECT * FROM Users WHERE email = '${email}'`)
```

---

### User Registration Flow

**Frontend** (`client/register/register.js`):

```javascript
// 1. User submits the form
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault(); // Stop the form from reloading the page

  // 2. We use FormData because we're sending a file (profile picture)
  const formData = new FormData();
  formData.append('fullName', form.fullName.value);
  formData.append('profilePic', file);

  // 3. Send to server
  const res = await fetch('http://localhost:3000/users', {
    method: 'POST',
    body: formData  // NOT JSON — because we have a file
  });

  // 4. If successful, save token and redirect
  const data = await res.json();
  localStorage.setItem("token", data.token);
  window.location.href = "../home/home.html";
});
```

**Backend** (`server/controllers/users.js` — `add` method):

```javascript
add: async (req, res) => {
  // 1. Validate input
  const result = validateUserInput(req.body);

  // 2. Hash the password (NEVER store plain text!)
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3. Save to database
  const insertResult = await userModel.add(userTS);

  // 4. Create JWT token
  const token = generateToken(userWithoutPassword);

  // 5. Send back to client
  res.status(201).json({ success: true, token, user: userWithoutPassword });
}
```

**Important concepts in this flow:**
- `FormData` is used instead of JSON because files can't be serialized to JSON
- `bcrypt.hash(password, 10)` — the 10 is "salt rounds" (how many times the algorithm runs — higher = more secure but slower)
- `status(201)` means "Created" (HTTP status code for successful resource creation)

---

### Login Flow

**Frontend** (`client/login/login.js`):
```javascript
// 1. Send email + password as JSON
const response = await fetch('http://localhost:3000/enterence', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

// 2. Save the token for future requests
const result = await response.json();
localStorage.setItem("token", result.token);
```

**Backend** (`server/controllers/enterence.js`):
```javascript
login: async (req, res) => {
  // 1. Find user by email
  const users = await userModel.getByEmail(email);
  const user = users[0];

  // 2. Compare password with stored hash
  const isMatch = await bcrypt.compare(password, user.password);

  // 3. If match — generate token
  const token = generateToken(userWithoutPassword);

  // 4. Return token
  return res.json({ success: true, token });
}
```

**Key point about `bcrypt.compare`:** It hashes the input password using the same salt as the stored hash, then compares. If they match, the password is correct — without ever decrypting anything.

---

### The verifyToken Middleware — `server/middleware/outh.js`

This is a gatekeeper. It runs before protected routes.

```javascript
export const verifyToken = (req, res, next) => {
  // 1. Get the token from the Authorization header
  const token = req.headers['authorization']?.split(" ")[1]; // "Bearer TOKEN"

  // 2. If no token, reject
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  // 3. Verify the token is valid and not expired
  const decoded = jwt.verify(token, process.env.SecretKey);

  // 4. Attach user data to the request
  req.user = {
    email: decoded.email,
    name: decoded.fullName,
    userName: decoded.userName,
    description: decoded.description
  };

  // 5. Continue to the actual route handler
  next();
};
```

**The `next()` function:** Express runs middleware in sequence. `next()` tells Express "I'm done, move to the next step." If we don't call it, the request stops here.

**How `req.user` is used:** After verifyToken runs, the controller can access `req.user.email` to know WHO is making the request — without the user having to send their email manually. This prevents users from pretending to be someone else.

---

### File Upload Flow

**Frontend** (`client/upload/upload.js`):
```javascript
// 1. Create FormData with the file
const formData = new FormData();
formData.append("image", file);
formData.append("title", title);

// 2. Send with JWT token
const res = await fetch("http://localhost:3000/artWorks", {
  method: "POST",
  headers: { "Authorization": `Bearer ${token}` },
  body: formData
});
```

**Router** (`server/routers/artWorks.js`):
```javascript
// The request passes through multer first
artWorksRouter.post('/', verifyToken, upload.single('image'), ArtWorksController.add);
```

**How the chain works:**
1. `verifyToken` — checks the JWT. If invalid, stops here.
2. `upload.single('image')` — multer looks for a file named "image" in the FormData and saves it.
3. `ArtWorksController.add` — the actual handler runs. By this point, `req.file` has the file info and `req.user` has the user's data.

---

### Gallery Page — `client/gallery/gallery.js`

```javascript
// 1. Load all artworks from server
async function loadArtworks() {
  const res = await fetch("http://localhost:3000/artWorks");
  const data = await res.json();
  artworks = data;
  renderGallery();
}

// 2. Filter + render
function renderGallery() {
  const searchTerm = searchInput.value.trim().toLowerCase();

  const filtered = artworks.filter(a =>
    a.title.toLowerCase().includes(searchTerm) ||
    (a.artist?.name && a.artist.name.toLowerCase().includes(searchTerm))
  );

  // 3. Create HTML for each card
  filtered.forEach(a => {
    const card = document.createElement("article");
    card.innerHTML = `
      <img src="/uploads/${a.imagePath}" />
      <h3>${a.title}</h3>
      <span>${a.artist.name}</span>
    `;
    gallerySection.appendChild(card);
  });
}

// 4. Search on every keystroke
searchInput.addEventListener("input", renderGallery);

// 5. Load when page is ready
document.addEventListener("DOMContentLoaded", loadArtworks);
```

**Key concepts:**
- `addEventListener("input", ...)` — fires every time the user types a character. This gives instant search.
- `filter()` — creates a new array with only items that match the condition.
- Template literals (`` ` ``) allow embedding JavaScript expressions directly in HTML strings.

---

### Account Page — `client/account/account.js`

This is the most complex client-side file. It manages:

1. **Loading user data** — decodes JWT to get email, fetches user profile and artworks
2. **Editing profile** — opens a modal, sends PUT request with FormData
3. **Deleting artwork** — confirms with user, sends DELETE request
4. **Editing artwork title** — opens a modal, sends PUT request
5. **Deleting account** — confirms, sends DELETE, logs out
6. **Image modal** — clicking an artwork opens it full-size, closes on ESC or backdrop click

**How we decode the JWT on the client:**
```javascript
const token = localStorage.getItem("token");
const payload = JSON.parse(
  new TextDecoder().decode(
    Uint8Array.from(atob(token.split(".")[1]), c => c.charCodeAt(0))
  )
);
const email = payload.email;
```

**What this does step by step:**
1. `token.split(".")[1]` — gets the payload part of the JWT
2. `atob(...)` — decodes Base64
3. `Uint8Array.from(...)` — converts to bytes (for proper UTF-8 handling)
4. `new TextDecoder().decode(...)` — converts bytes to text
5. `JSON.parse(...)` — converts JSON string to JavaScript object

---

## Part 5: Key Concepts for Interview

### Q: "What is REST API?"

**A:** REST (Representational State Transfer) is an architectural style for building APIs. It uses standard HTTP methods:

| Method | Purpose | Example |
|--------|---------|---------|
| GET | Read/fetch data | `GET /artWorks` — get all artworks |
| POST | Create new data | `POST /users` — register a new user |
| PUT | Update existing data | `PUT /artWorks/5` — update artwork #5 |
| DELETE | Remove data | `DELETE /artWorks/5` — delete artwork #5 |

Each URL is a "resource" (e.g., `/users`, `/artWorks`). This makes the API predictable and easy to understand.

---

### Q: "What is middleware?"

**A:** Middleware is code that runs between receiving a request and sending a response. It can:
- Process the request (e.g., parse JSON, handle file uploads)
- Check permissions (e.g., verify JWT token)
- Modify the request/response
- End the request early (e.g., reject unauthorized requests)

Express middleware runs in order. Each middleware function either calls `next()` to continue, or sends a response to stop the chain.

---

### Q: "What is the difference between authentication and authorization?"

**A:**
- **Authentication** = "Who are you?" — Verifying identity (login with email + password)
- **Authorization** = "What are you allowed to do?" — Checking permissions

In our project:
- **Authentication:** Login endpoint verifies email + password, gives JWT token
- **Authorization:** `verifyToken` middleware checks if the token is valid before allowing access to protected routes

---

### Q: "What is SQL injection and how do you prevent it?"

**A:** SQL injection is when an attacker types malicious SQL into a form field.

**Example:**
```
Email field: ' OR 1=1 --
```
If we put this directly into the SQL query, it could return all users.

**Prevention:** We use parameterized queries with `?` placeholders:
```javascript
DB.execute('SELECT * FROM Users WHERE email = ?', [email])
```
The database driver separates the query from the data, so the malicious input is treated as a plain string, not as SQL code.

---

### Q: "What is the difference between JWT and session-based authentication?"

**A:**
- **Session:** Server stores user data in memory/database. Sends a session ID cookie to the browser. Server must look up the session on each request.
- **JWT:** Server creates a signed token containing user data. Sends it to the browser. Server can verify the token WITHOUT looking anything up — because the data is inside the token itself.

**JWT advantages:**
- Stateless — no session storage needed on server
- Works well for distributed systems
- Can contain any data in the payload

---

### Q: "Why did you use MySQL and not MongoDB?"

**A:** MySQL is a relational database — data is organized in tables with relationships between them. This project has clear relationships (Users → ArtWorks, Users → Comments), so a relational model fits naturally.

MongoDB (NoSQL) stores data as documents without fixed structure. It's better when data is unstructured or changes frequently.

For a project with users and their artworks (clear one-to-many relationship), MySQL's foreign keys enforce data integrity at the database level.

---

### Q: "What is the difference between JSON and FormData?"

**A:**
- **JSON** (Content-Type: application/json): Used for sending structured data (text). Can't include files.
- **FormData** (Content-Type: multipart/form-data): Used for sending files along with text data.

In our project:
- Login sends **JSON** (only email + password, no files)
- Register sends **FormData** (includes profile picture file)
- Upload sends **FormData** (includes artwork image)

---

### Q: "What does 'async/await' mean?"

**A:** JavaScript is single-threaded and non-blocking. When we make a request to the database, we don't want the entire application to freeze while waiting for a response.

- **async function:** A function that returns a Promise (something that will complete in the future)
- **await:** Pauses execution inside an async function until the Promise resolves

```javascript
// WITHOUT async/await (callback style)
userModel.getByEmail(email, function(err, user) {
  if (err) { ... }
  // do something with user
});

// WITH async/await (cleaner!)
const user = await userModel.getByEmail(email);
// do something with user
```

**Why it matters:** It makes asynchronous code look and read like synchronous code — much easier to understand and maintain.

---

### Q: "What is Express static file serving?"

**A:** `express.static('folder')` tells Express to serve all files in that folder as-is (HTML, CSS, images, etc.) — without any special processing.

```javascript
app.use(express.static(path.join(__dirname, '../client')));
```

This means if a browser requests `http://localhost:3000/gallery/gallery.html`, Express looks for `client/gallery/gallery.html` and sends it back. Same for CSS, images, and JavaScript files in that folder.

---

### Q: "What is the role of the .env file?"

**A:** The `.env` file stores configuration that varies between environments:

```
DB_PASSWORD=1111
SecretKey=abcd1234
```

We use `dotenv` to load these into `process.env`. The `.env` file is listed in `.gitignore` so it's never uploaded to GitHub — preventing secrets from being exposed publicly.

---

### Q: "How does the search work in the gallery?"

**A:** Client-side filtering:
1. All artworks are loaded from the server once (on page load)
2. Stored in the `artworks` array in memory
3. When the user types in the search box, `renderGallery()` is called
4. It filters the array using `Array.filter()` — checking if the search term appears in the title, description, or artist name
5. Only matching artworks are rendered to the page

This is fast because filtering happens locally — no server round-trip on every keystroke.

---

## Part 6: How to Present the Project in an Interview

### Opening (30 seconds)

"I built GalleryArt — a full-stack web application for female artists to showcase and manage their artworks. It's built with Node.js and Express on the backend, MySQL for the database, and vanilla JavaScript on the frontend with Tailwind CSS for styling."

### Key Features (1 minute)

"The main features are:
- JWT-based authentication with bcrypt password hashing
- Image upload with multer
- An artwork gallery with real-time search
- Artist profiles with their bio and artwork collection
- Full account management — edit profile, edit/delete artwork, delete account
- Protected routes — only authenticated users can upload, edit, or delete"

### Technical Highlights (1 minute)

"The code follows the MVC pattern — Models, Controllers, Routers — for clean separation of concerns. The database uses foreign keys to maintain data integrity. I implemented parameterized queries to prevent SQL injection. Passwords are hashed with bcrypt and never stored in plain text. The JWT tokens are verified through middleware before any sensitive operation."

### Challenges / What You Learned (30 seconds)

"One challenge was handling file uploads alongside text data — I learned to use FormData instead of JSON for those requests. Another was implementing JWT authentication correctly — understanding how tokens are created, verified, and stored on the client side."

---

## Part 7: File Structure Quick Reference

```
server/
├── server.js              ← Entry point — sets up Express, routes, middleware
├── .env                   ← Secrets (not uploaded to Git)
├── package.json           ← Dependencies list
├── DB/
│   ├── runSql.js          ← MySQL connection setup
│   └── GalleryArt.sql     ← Database schema (CREATE TABLE statements)
├── middleware/
│   ├── outh.js            ← JWT: generateToken + verifyToken
│   └── multer.js          ← File upload configuration
├── models/
│   ├── users.js           ← SQL queries for Users table
│   ├── artWorks.js        ← SQL queries for ArtWorks table
│   └── comments.js        ← SQL queries for Comments table
├── controllers/
│   ├── users.js           ← Business logic for user operations
│   ├── artWorks.js        ← Business logic for artwork operations
│   ├── enterence.js       ← Login logic
│   └── comments.js        ← Comment operations
├── routers/
│   ├── users.js           ← Maps /users/* to controller methods
│   ├── artWorks.js        ← Maps /artWorks/* to controller methods
│   └── enterence.js       ← Maps /enterence/* to login
└── uploads/               ← Where uploaded images are saved

client/
├── register/              ← Registration page (HTML + CSS + JS)
├── login/                 ← Login page
├── home/                  ← Landing page
├── gallery/               ← Gallery with search
├── artist/                ← Artist profile page
├── account/               ← Account management
├── upload/                ← Artwork upload page
└── images/                ← Static images (decorative)
```

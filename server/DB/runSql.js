import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

//   שמיוצא Promise  כבר עכשיו מחזיר 

const connectionPromise = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD|| 'code1234' ,
    database: 'GalleryArt',
    port: process.env.DB_PORT || 3306
})
.then((conn) => {
    console.log("✅ התחברות למסד הצליחה");
    return conn;
})
.catch((err) => {
    console.error("❌ שגיאה בחיבור למסד:", err);
    process.exit(1); // עצירת התוכנית אם החיבור נכשל
});

export default await connectionPromise;
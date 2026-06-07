import express from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from "dotenv";
dotenv.config();// אומר לשרת להכניס את כל הנתונים מהקובץ .env לתוך process.env כדי שנוכל לגשת אליו בהמשך
import userRouter from './routers/users.js' // חייב לכתוב תחילה ./ כי אחרת הוא חושב שזה ייבוא מודל מnode.js וזה שגיאה
import artWorkRouter from './routers/artWorks.js'
import entrenceRouter from './routers/enterence.js'
import { fileURLToPath } from 'url'; // מייצאים פונקציה אחת מתוך הרבה פונקציות שמיוצאות זוהי לא ייצוא דיפולטיבי ולכן{}
const __dirname = path.dirname(fileURLToPath(import.meta.url));//יוצרים משתנה ששומר את המיקום של תיקית הפרויקט ממיר את כתובת הדפדפן לכתובת במחשב של server.js ןאז לוקח את שם התיקיה שלה 
const app =express()//זהו בניית שרת בפועל
let port= process.env.PORT ||3000 // זה הפורט שעליו השרת ירוץ
app.use(cors()) // נותן לכל בקשה מהלקוח שרצה על פורט אחר משל השרת להתקבל
app.use(express.json())// מפרק כל בקשה גייסון לתוך הreq.body
app.use('/users',userRouter)
app.use('/artWorks',artWorkRouter)
app.use('/enterence',entrenceRouter)
app.use(express.static(path.join(__dirname, '../client')));//מאפשר לשרת לשלוח קבצים מתקיית client(לאחר הצירוף הקישור המתאים) לדפדפן
app.use('/uploads', express.static('uploads'));//נותן גישה לתקית uploads 
// מפנה את הבקשה הראשית (/) אל register.html
 app.get('/', (req, res) => {
   res.sendFile(path.join(__dirname, '../client/register', 'register.html'));
 });


app.listen(port,() => {console.log(`Server is running on port ${port}`)})//פונקציה מאקספרס שמקבלת איזה פורט רצים וכן פונקציה שתרוץ כאשר יתחיל לרוץ


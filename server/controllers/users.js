import userModel from '../models/users.js'
import bcrypt from 'bcrypt'
import { generateToken } from "../middleware/outh.js";


function validateUserInput(data, { isUpdate = false } = {}) { //פונקציה שמקבלת 2 פרמטרים הראשון הנתון והשני משתנה אופציונלי רק בשביל עדכון אם לא שולחים ברירת מחדל FALSE
  const errors = [];
  if ("email" in data) {//בודק האם יש לו שדה אימייל
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // זהו ביטוי רגולרי ניתן להבחין על פי /.../
const email = data.email?.trim();//אם קיים בDATA EMAIL אז תבצע עליו את הפעולה TRIM שזה מסיר רווחים מהסוף ווהתחלה.
if (typeof email !== "string" || !emailRegex.test(email)) {//בדיקת תקינות אמייל בודק האם האיימיל עובר את הביטוי הרגולרי וכן האם הוא מסוג מחרוזת

      errors.push("אימייל לא תקין");
    }
  } else if (!isUpdate) {
    errors.push("שדה אימייל חסר");
  }

  if ("fullName" in data) {
    if (typeof data.fullName !== "string" || data.fullName.trim().length < 2) {
      errors.push("שם חייב להכיל לפחות 2 תווים");
    }
  } else if (!isUpdate) {
    errors.push("שדה שם חסר");
  }

  if ("password" in data) {
    const pwd = data.password;
    const hasNumber = /\d/.test(pwd);// בודק אם קיים תו שהוא מספר
    if (typeof pwd !== "string" || pwd.length < 6 || !hasNumber) {
      errors.push("סיסמה חלשה – דרושות לפחות 6 תווים (כולל מספר אחד)ד");
    }
  } else if (!isUpdate) {
    errors.push("שדה סיסמה חסר");
  }

  return {
    valid: errors.length === 0,//true or false
    errors,
  };
}



const userController = {
  add: async (req, res) => {
  const result = validateUserInput(req.body);
   if (!result.valid) {
     return res.status(400).json({ errors: result.errors });
   }
  const { fullName, userName, email, description, password} = req.body;
  const file = req.file;// שיצרנו על ידי ה multer
   const safeProfilePic = file ? file.filename : null;
  const hashedPassword = await bcrypt.hash(password, 10);//הצפנת הסיסמא בדרגת חומרה 10
  const userTS = {
    fullName,
    userName,
    email,
    description,
    password: hashedPassword,
    profilePic: safeProfilePic,
  };
  try{
    
    const insertResult = await userModel.add(userTS);

 const userWithoutPassword = { fullName, userName, email, description, profilePic: safeProfilePic };
  const token = generateToken(userWithoutPassword);
      userWithoutPassword.token = token;

    res.status(201).json({
      success: true,
      message: "user added successfully",
      user: userWithoutPassword,
      token,   // 👈 שולחים את הטוקן לפרונט
    });
  }catch(err){
    console.error('❌ שגיאה בהוספת משתמש:', err);
    res.status(500).json({ error: 'שגיאה בשרת בעת הוספת משתמש' });
  }
},

  getByEmail: async (req, res) => {
    const email = req.query.email?.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    try {
      const user = await userModel.getByEmail(email);
      if (!user || user.length === 0) {
        return res.status(404).json({ error: "user not found" });
      }
      res.json(user);
    } catch (err) {
      console.error("❌ Error fetching user:", err);
      res.status(500).json({ error: "Database Error" });
    }
  },

update: async (req, res) => {
    const allowedFields = ["fullName", "description", "profilePic"];

    try {
      const email = req.user.email;

      const updateFields = {};
      for (const key of allowedFields) {
        if (req.body[key] !== undefined) {
          updateFields[key] = req.body[key];
        }
      }

      if (req.file) {
        updateFields.profilePic = req.file.filename;
      }

      if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({ error: "No fields provided to update" });
      }

      const updateResult = await userModel.update(email, updateFields);
      if (!updateResult || updateResult.affectedRows === 0) {
        return res.status(404).json({ error: "user not found" });
      }

      res.json({ message: "user updated successfully" });
    } catch (err) {
      console.error("❌ Error updating user:", err);
      res.status(500).json({ error: "Database error" });
    }
  },


  delete: async (req, res) => {
  const email = req.params.email;

  try {
    const result = await userModel.delete(email);

    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ error: "משתמש לא נמצא" });
    }

    res.json({ message: "המשתמש נמחק בהצלחה" });
  } catch (error) {
    console.error("❌ שגיאה במחיקת המשתמש:", error);
    res.status(500).json({ error: "שגיאה בשרת בעת מחיקת המשתמש" });
  }
}

};

export default userController;

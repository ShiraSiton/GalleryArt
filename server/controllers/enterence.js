import userModel from "../models/users.js";
import { generateToken } from "../middleware/outh.js";
import bcrypt from "bcrypt";

const enterenceController = {
  login: async (req, res) => {
    const { email, password } = req.body;

    try {
      // חיפוש משתמש לפי אימייל
      const users = await userModel.getByEmail(email);
      const user = users[0];

      if (!user) 
        {
        return res.status(404).json({ success: false, error: "User not found" });
        }
        console.log("Body:", req.body);
      console.log("Email:", email);
      console.log("Password:", password);
      // השוואת סיסמאות
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, error: "Invalid password" });
      }

      // מחיקת הסיסמה מהאובייקט לפני שליחה
      const userWithoutPassword = { ...user };// העתקה עמוקה של האוביקט user לתוך האחד בלי הסיסמא
      delete userWithoutPassword.password;//מוחק את שדה הסיסמא

      // יצירת טוקן
      const token = generateToken(userWithoutPassword);
      userWithoutPassword.token = token;

      // תשובה ללקוח
      return res.json({
        success: true,
        message: "Login successful",
        user: userWithoutPassword,
        token,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: "Login failed",
        details: err.message,
      });
    }
  },
};

export default enterenceController;


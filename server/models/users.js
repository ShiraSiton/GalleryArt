import DB from '../DB/runSql.js'
const queryAsync= async (sql,params) =>{
    try{
        const[rows, fields]=await DB.execute(sql,params);//execute מחזירה מערך עם שני איברים הראשון את הנתונים השני פירוט עליהם (לא נצרך)
        return rows;
    }
    catch(err)
    {
        throw err
    }
}
const userModel ={
    getByEmail:async(email) => {
        return await queryAsync(`SELECT Users.* FROM Users WHERE Users.email =?`,[email]);// לוקח את הערכים מהמערך ומציב לפי סדר בכל מקום שיש ?

    },
    add: async(userTS) => {
        try{
           
                Object.keys(userTS).forEach(key => {//כלומר אם יש לי תכונה שלא הוגדרה נציב שם נאל
                 if (userTS[key] === undefined) {
                   userTS[key] = null;
                  }
                });

           const{fullName,userName,email,description,password,profilePic}=userTS//בשמה בתוך 6 משתנים חדשים בעלי אותו שם מתוך המשתנה ו  {} מסמל שזה השמה מתוך אובייקט (TS ) ולא מתוך מערך    
           const[result]= await DB.execute(

            
            `INSERT INTO Users 
            (fullName,userName,email,description,password,profilePic)
            VALUES(?,?,?,?,?,?)`,
            [fullName,userName,email,description,password,profilePic]//מכניס את מערך הערכים הללו לאיפה שיש ? לפי סדר
           );
           return result;// לא בטוח שבפועל משתמשים בנתון שחוזר פה אבל אנחנו מחזירות בכל מקרה ומי שירצה ישתמש בזה ומי שלא לא. רק החלק הראשון של התוצאה שחוזרת מ execute וזה הנתונים עצמם
        }
        catch(error)
        {
            console.error("שגיאה ב- ADD: ",error);
            throw error
        }
    },
  
  update: async (email, updateFields) => {
    const fields = [];
    const values = [];
    for (const [key, value] of Object.entries(updateFields)) {
      fields.push(`${key}=?`);
      values.push(value);
    }

    if (fields.length === 0) {
      throw new Error("no fields provided to update");
    }

    const sql = `UPDATE Users SET ${fields.join(',')} WHERE email=?`;
    values.push(email);

    const [result] = await DB.execute(sql, values); 
    console.log("🔎 UPDATE result:", result); // << אפשר לראות את affectedRows
    return result;
  },
      delete: async (email) => {
        try {
            const result = await DB.execute(
                `DELETE FROM Users WHERE email = ?`,// ימחוק את השורה הראשונה שיש לה את המייל שהתקבל
                [email]
            );
            return result;
        } catch (error) {
            console.error("❌ שגיאה ב-delete:", error);
            throw error;
        }
    },
};
export default userModel
